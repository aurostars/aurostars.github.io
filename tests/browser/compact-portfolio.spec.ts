import { expect, test, type Locator, type Page } from "@playwright/test";
import sharp from "sharp";

const viewports = [
  { width: 1440, height: 900, columns: 3 },
  { width: 1024, height: 768, columns: 2 },
  { width: 768, height: 900, columns: 2 },
  { width: 767, height: 900, columns: 2 },
  { width: 390, height: 844, columns: 1 },
  { width: 320, height: 800, columns: 1 },
];

type Color = { rgb: [number, number, number]; alpha: number };

function parseColor(value: string): Color {
  const normalized = value.trim();
  if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(normalized)) {
    return {
      rgb: [
        Number.parseInt(normalized.slice(1, 3), 16),
        Number.parseInt(normalized.slice(3, 5), 16),
        Number.parseInt(normalized.slice(5, 7), 16),
      ],
      alpha: normalized.length === 9 ? Number.parseInt(normalized.slice(7, 9), 16) / 255 : 1,
    };
  }
  const channels = normalized.match(/[\d.]+/g)?.map(Number) ?? [];
  if (channels.length < 3) {
    throw new Error(`Unsupported computed color: ${value}`);
  }
  return {
    rgb: channels.slice(0, 3) as Color["rgb"],
    alpha: channels[3] ?? 1,
  };
}

function contrastRatio(foreground: Color | string, background: Color | string) {
  const luminance = (color: Color | string) => (typeof color === "string" ? parseColor(color) : color).rgb
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

async function rawPixels(buffer: Buffer) {
  return sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

function pixelAt(data: Buffer, width: number, x: number, y: number): Color {
  const offset = (y * width + x) * 4;
  return { rgb: [data[offset], data[offset + 1], data[offset + 2]], alpha: data[offset + 3] / 255 };
}

function colorDistance(first: Color, second: Color) {
  return Math.hypot(...first.rgb.map((channel, index) => channel - second.rgb[index]));
}

async function expectRenderedTextContrast(locator: Locator, label: string, minimum = 4.5) {
  await locator.scrollIntoViewIfNeeded();
  const foreground = parseColor(await locator.evaluate((element) => getComputedStyle(element).color));
  const visible = await rawPixels(await locator.screenshot({ animations: "disabled" }));
  const marker = "active";
  await locator.evaluate((element, value) => element.setAttribute("data-contrast-sample", value), marker);
  await locator.page().addStyleTag({ content: `
    [data-contrast-sample="${marker}"], [data-contrast-sample="${marker}"] * {
      color: transparent !important;
      -webkit-text-fill-color: transparent !important;
      text-decoration-color: transparent !important;
      text-shadow: none !important;
    }
  ` });
  const background = await rawPixels(await locator.screenshot({ animations: "disabled" }));
  await locator.evaluate((element) => element.removeAttribute("data-contrast-sample"));

  expect(background.info.width, `${label} background width`).toBe(visible.info.width);
  expect(background.info.height, `${label} background height`).toBe(visible.info.height);
  const ratios: number[] = [];
  for (let y = 0; y < visible.info.height; y += 1) {
    for (let x = 0; x < visible.info.width; x += 1) {
      const renderedForeground = pixelAt(visible.data, visible.info.width, x, y);
      const renderedBackground = pixelAt(background.data, background.info.width, x, y);
      // Solid glyph interiors render at (or extremely near) the declared foreground;
      // this excludes anti-aliased edge pixels without assuming the background color.
      if (colorDistance(renderedForeground, foreground) <= 8
        && colorDistance(renderedForeground, renderedBackground) >= 16) {
        ratios.push(contrastRatio(renderedForeground, renderedBackground));
      }
    }
  }
  expect(ratios.length, `${label} must expose solid rendered glyph pixels`).toBeGreaterThan(0);
  expect(Math.min(...ratios), `${label} rendered-pixel contrast`).toBeGreaterThanOrEqual(minimum);
}

async function expectRenderedFocusIndicator(locator: Locator, label: string) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box, `${label} bounds`).not.toBeNull();
  const outline = parseColor(await locator.evaluate((element) => getComputedStyle(element).outlineColor));
  const viewport = locator.page().viewportSize()!;
  const inset = 7;
  const clip = {
    x: Math.max(0, Math.floor(box!.x - inset)),
    y: Math.max(0, Math.floor(box!.y - inset)),
    width: Math.min(viewport.width, Math.ceil(box!.x + box!.width + inset)) - Math.max(0, Math.floor(box!.x - inset)),
    height: Math.min(viewport.height, Math.ceil(box!.y + box!.height + inset)) - Math.max(0, Math.floor(box!.y - inset)),
  };
  const focused = await rawPixels(await locator.page().screenshot({ clip, animations: "disabled" }));
  const marker = "active";
  await locator.evaluate((element, value) => element.setAttribute("data-focus-sample", value), marker);
  await locator.page().addStyleTag({ content: `[data-focus-sample="${marker}"] { outline-color: transparent !important; }` });
  const background = await rawPixels(await locator.page().screenshot({ clip, animations: "disabled" }));
  await locator.evaluate((element) => element.removeAttribute("data-focus-sample"));

  const ratios: number[] = [];
  for (let y = 0; y < focused.info.height; y += 1) {
    for (let x = 0; x < focused.info.width; x += 1) {
      const pageX = clip.x + x;
      const pageY = clip.y + y;
      const outsideElement = pageX < box!.x
        || pageX >= box!.x + box!.width
        || pageY < box!.y
        || pageY >= box!.y + box!.height;
      if (!outsideElement) continue;
      const indicator = pixelAt(focused.data, focused.info.width, x, y);
      const behindIndicator = pixelAt(background.data, background.info.width, x, y);
      if (colorDistance(indicator, outline) <= 8 && colorDistance(indicator, behindIndicator) >= 16) {
        ratios.push(contrastRatio(indicator, behindIndicator));
      }
    }
  }
  expect(ratios.length, `${label} must render solid focus-indicator pixels`).toBeGreaterThan(0);
  ratios.sort((first, second) => first - second);
  expect(ratios[Math.floor(ratios.length / 2)], `${label} rendered focus-indicator contrast`).toBeGreaterThanOrEqual(3);
}

function expectRectClose(
  actual: { x: number; y: number; width: number; height: number },
  expected: { x: number; y: number; width: number; height: number },
  tolerance = 1,
) {
  for (const key of ["x", "y", "width", "height"] as const) {
    expect(Math.abs(actual[key] - expected[key]), `${key} changed`).toBeLessThanOrEqual(tolerance);
  }
}

function rectanglesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  const epsilon = 0.5;
  return first.x < second.x + second.width - epsilon
    && first.x + first.width > second.x + epsilon
    && first.y < second.y + second.height - epsilon
    && first.y + first.height > second.y + epsilon;
}

async function injectProjectFixtures(page: Page, count: 5 | 6) {
  await page.locator(".case-grid").evaluate((grid, targetCount) => {
    const sourceCards = Array.from(grid.children);
    for (let index = sourceCards.length; index < targetCount; index += 1) {
      const fixture = sourceCards[index % sourceCards.length].cloneNode(true) as HTMLElement;
      fixture.dataset.testFixture = `project-${index + 1}`;
      const button = fixture.querySelector("button");
      button?.setAttribute("aria-label", `查看项目详情：测试案例 ${index + 1}`);
      grid.append(fixture);
    }
    (grid as HTMLElement).dataset.projectCount = String(targetCount);
  }, count);
}

test("dark theme uses final rendered pixels for text and focus contrast", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });

  const skipLink = page.locator(".skip-link");
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await expectRenderedTextContrast(skipLink, "focused skip link");
  await expectRenderedFocusIndicator(skipLink, "focused skip link");

  const textSamples = [
    { locator: page.locator(".identity-bar-motion h1"), label: "identity heading" },
    { locator: page.locator(".identity-bar-motion a").first(), label: "identity link" },
    { locator: page.locator("#education-title"), label: "history heading" },
    { locator: page.locator(".profile-history-motion p").first(), label: "history text" },
    { locator: page.locator(".case-card-summary").first(), label: "project description" },
  ];
  for (const sample of textSamples) {
    await expectRenderedTextContrast(sample.locator, sample.label);
  }

  const card = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await card.focus();
  await expect(card).toBeFocused();
  await expectRenderedFocusIndicator(card, "focused project card");
});

for (const viewport of viewports) {
  test(`${viewport.width}px keeps profile history and project layout inside the viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    const education = page.getByRole("region", { name: "教育经历", exact: true });
    const internship = page.getByRole("region", { name: "实习经历", exact: true });
    const [educationBox, internshipBox] = await Promise.all([
      education.boundingBox(),
      internship.boundingBox(),
    ]);
    expect(educationBox).not.toBeNull();
    expect(internshipBox).not.toBeNull();

    if (viewport.width >= 768) {
      const educationShare = educationBox!.width / (educationBox!.width + internshipBox!.width);
      expect(educationShare).toBeGreaterThanOrEqual(0.33);
      expect(educationShare).toBeLessThanOrEqual(0.39);
      expect(Math.abs(educationBox!.y - internshipBox!.y)).toBeLessThanOrEqual(2);
      expect(rectanglesOverlap(educationBox!, internshipBox!)).toBe(false);
    } else {
      expect(internshipBox!.y).toBeGreaterThanOrEqual(educationBox!.y + educationBox!.height);
    }

    const hint = page.locator("#cases-hint");
    const hintBox = await hint.boundingBox();
    expect(hintBox).not.toBeNull();
    expect(hintBox!.x).toBeGreaterThanOrEqual(0);
    expect(hintBox!.x + hintBox!.width).toBeLessThanOrEqual(viewport.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  });
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
]) {
  test(`${viewport.width}px exposes the project heading in the first screen`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    const headingBox = await page.getByRole("heading", { name: "个人项目" }).boundingBox();
    expect(headingBox).not.toBeNull();
    expect(headingBox!.y).toBeGreaterThan(0);
    expect(headingBox!.y).toBeLessThan(viewport.height);
  });
}

for (const viewport of viewports.filter(({ width }) => width >= 768)) {
  test(`${viewport.width}px keeps desktop experience identity fields on one row above their content`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    for (const row of await page.getByTestId("experience-row").all()) {
      const titleLine = row.getByTestId("experience-title-line");
      const fields = [
        titleLine.locator(".company-logo-slot"),
        titleLine.locator(".experience-organization"),
        titleLine.locator(".experience-role"),
        titleLine.locator(".experience-period"),
      ];
      const [titleBox, contentBox, ...fieldBoxes] = await Promise.all([
        titleLine.boundingBox(),
        row.locator(".experience-highlight").boundingBox(),
        ...fields.map((field) => field.boundingBox()),
      ]);
      expect(titleBox).not.toBeNull();
      expect(contentBox).not.toBeNull();
      expect(fieldBoxes.every(Boolean)).toBe(true);
      for (const fieldBox of fieldBoxes) {
        expect(fieldBox!.y).toBeGreaterThanOrEqual(titleBox!.y - 1);
        expect(fieldBox!.y + fieldBox!.height).toBeLessThanOrEqual(titleBox!.y + titleBox!.height + 1);
      }
      for (let index = 1; index < fieldBoxes.length; index += 1) {
        expect(fieldBoxes[index]!.x).toBeGreaterThanOrEqual(
          fieldBoxes[index - 1]!.x + fieldBoxes[index - 1]!.width - 1,
        );
      }
      expect(contentBox!.y).toBeGreaterThanOrEqual(titleBox!.y + titleBox!.height);
    }
  });
}

test("company logo failure preserves the successful row, slot, and company text geometry", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });

  const row = page.getByTestId("experience-row").first();
  const slot = row.locator(".company-logo-slot");
  const company = row.getByText("字节跳动", { exact: true });
  const logo = row.getByRole("img", { name: "字节跳动 Logo" });
  await expect(logo).toBeVisible();
  const imageState = await logo.evaluate((element) => {
    const image = element as HTMLImageElement;
    const effects = [];
    for (let node: Element | null = image; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      effects.push({
        nodeName: node === document.documentElement ? "html" : node.tagName.toLowerCase(),
        opacity: style.opacity,
        filter: style.filter,
        mixBlendMode: style.mixBlendMode,
      });
    }
    return {
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      objectFit: getComputedStyle(image).objectFit,
      effects,
    };
  });
  expect(imageState.complete).toBe(true);
  expect(imageState.naturalWidth).toBeGreaterThan(0);
  expect(imageState.objectFit).toBe("contain");
  expect(imageState.effects).not.toHaveLength(0);
  expect(imageState.effects.at(-1)?.nodeName).toBe("html");
  expect(imageState.effects.every(({ opacity }) => opacity === "1")).toBe(true);
  expect(imageState.effects.every(({ filter }) => filter === "none")).toBe(true);
  expect(imageState.effects.every(({ mixBlendMode }) => mixBlendMode === "normal")).toBe(true);

  const [loadedRowBox, loadedSlotBox, loadedCompanyBox] = await Promise.all([
    row.boundingBox(),
    slot.boundingBox(),
    company.boundingBox(),
  ]);
  expect(loadedRowBox).not.toBeNull();
  expect(loadedSlotBox).not.toBeNull();
  expect(loadedCompanyBox).not.toBeNull();
  expect(loadedSlotBox!.width).toBeCloseTo(72, 0);
  expect(loadedSlotBox!.height).toBeCloseTo(32, 0);

  let failedRequest = false;
  await page.route("**/companies/bytedance.svg", async (route) => {
    failedRequest = true;
    await route.abort("failed");
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect.poll(() => failedRequest).toBe(true);
  await expect(row.getByRole("img", { name: "字节跳动 Logo" })).toHaveCount(0);
  await expect(company).toBeVisible();

  const [failedRowBox, failedSlotBox, failedCompanyBox] = await Promise.all([
    row.boundingBox(),
    slot.boundingBox(),
    company.boundingBox(),
  ]);
  expect(failedRowBox).not.toBeNull();
  expect(failedSlotBox).not.toBeNull();
  expect(failedCompanyBox).not.toBeNull();
  expectRectClose(failedRowBox!, loadedRowBox!);
  expectRectClose(failedSlotBox!, loadedSlotBox!);
  expectRectClose(failedCompanyBox!, loadedCompanyBox!);
});

test("project instruction stays adjacent to its heading and wraps without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  const heading = page.getByRole("heading", { name: "个人项目" });
  const hint = page.locator("#cases-title + #cases-hint");
  await expect(heading).toBeVisible();
  await expect(hint).toHaveText("点击卡片任意位置，可查看详情");
  await expect(page.locator(".case-grid")).toHaveAttribute("aria-describedby", "cases-hint");

  const positions = await Promise.all([heading.boundingBox(), hint.boundingBox()]);
  expect(positions[0]).not.toBeNull();
  expect(positions[1]).not.toBeNull();
  expect(positions[1]!.y).toBeGreaterThanOrEqual(positions[0]!.y + positions[0]!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const viewport of viewports) {
  for (const count of [5, 6] as const) {
    test(`${viewport.width}px lays out ${count} real cards without overflow or placeholders`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport);
      await page.goto("/", { waitUntil: "networkidle" });
      await injectProjectFixtures(page, count);

      const cards = page.locator(".case-card");
      await expect(cards).toHaveCount(count);
      await expect(page.locator(".case-card-placeholder, [data-placeholder]")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

      const boxes = await cards.evaluateAll((nodes) => nodes.map((node) => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return { x, y, width, height };
      }));
      for (const box of boxes) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
      for (let rowStart = 0; rowStart < count; rowStart += viewport.columns) {
        const row = boxes.slice(rowStart, rowStart + viewport.columns);
        expect(Math.max(...row.map(({ y }) => y)) - Math.min(...row.map(({ y }) => y))).toBeLessThanOrEqual(1);
        for (let index = 1; index < row.length; index += 1) {
          expect(row[index].x).toBeGreaterThan(row[index - 1].x);
        }
      }
      for (let first = 0; first < boxes.length; first += 1) {
        for (let second = first + 1; second < boxes.length; second += 1) {
          expect(rectanglesOverlap(boxes[first], boxes[second]), `cards ${first + 1} and ${second + 1} overlap`).toBe(false);
        }
      }
      expect(boxes[viewport.columns].y).toBeGreaterThan(boxes[0].y);

      if (count === 5) {
        expect(Math.max(...boxes.map(({ width }) => width)) - Math.min(...boxes.map(({ width }) => width)))
          .toBeLessThanOrEqual(1);
        const lastRowStart = Math.floor((count - 1) / viewport.columns) * viewport.columns;
        expect(Math.abs(boxes[lastRowStart].x - boxes[0].x)).toBeLessThanOrEqual(1);
      }

      if (count === 6 && viewport.columns === 3) {
        expect(Math.max(...boxes.slice(0, 3).map(({ y }) => y)) - Math.min(...boxes.slice(0, 3).map(({ y }) => y)))
          .toBeLessThanOrEqual(1);
        expect(Math.max(...boxes.slice(3).map(({ y }) => y)) - Math.min(...boxes.slice(3).map(({ y }) => y)))
          .toBeLessThanOrEqual(1);
        expect(boxes[3].y).toBeGreaterThan(boxes[0].y);
      }
    });
  }
}

test("detail header owns the only source link and the close affordance uses a pointer cursor", async ({ page }) => {
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  const header = dialog.locator(".case-dialog-header");
  await expect(header.getByRole("link", { name: /查看源码/ })).toHaveCount(1);
  await expect(dialog.getByRole("link", { name: /查看源码/ })).toHaveCount(1);
  await expect(dialog.locator(".case-detail").getByRole("link", { name: /查看源码/ })).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "关闭秋招网申助手详情" })).toHaveCSS("cursor", "pointer");
});

test("detail background and goal are ordered standalone full-width sections without core problems", async ({ page }) => {
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  const detailGrid = dialog.locator(".case-detail-grid");
  const background = dialog.getByRole("region", { name: "背景" });
  const goal = dialog.getByRole("region", { name: "目标" });
  const [gridBox, backgroundBox, goalBox] = await Promise.all([
    detailGrid.boundingBox(),
    background.boundingBox(),
    goal.boundingBox(),
  ]);
  expect(gridBox).not.toBeNull();
  expect(backgroundBox).not.toBeNull();
  expect(goalBox).not.toBeNull();
  for (const [name, box] of [["background", backgroundBox!], ["goal", goalBox!]] as const) {
    expect(Math.abs(box.x - gridBox!.x), `${name} left edge`).toBeLessThanOrEqual(1);
    expect(Math.abs(box.width - gridBox!.width), `${name} width`).toBeLessThanOrEqual(1);
    expect(
      Math.abs((box.x + box.width) - (gridBox!.x + gridBox!.width)),
      `${name} right edge`,
    ).toBeLessThanOrEqual(1);
  }
  expect(goalBox!.y).toBeGreaterThanOrEqual(backgroundBox!.y + backgroundBox!.height);
  await expect(dialog.getByText("核心问题", { exact: true })).toHaveCount(0);
});

for (const project of [
  { slug: "interview-review", title: "面试复盘助手" },
  { slug: "resume-builder", title: "智能简历编辑工具" },
  { slug: "meeting-minutes", title: "智能会议纪要工具" },
]) {
  test(`${project.title} uses one near-full-width contained gallery image`, async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`/?project=${project.slug}`, { waitUntil: "networkidle" });
    const dialog = page.getByRole("dialog", { name: project.title });
    const gallery = dialog.getByRole("group", { name: `${project.title}真实产品界面` });
    const figures = gallery.locator("figure");
    const image = gallery.getByRole("img");
    await expect(figures).toHaveCount(1);
    await expect(image).toHaveCount(1);
    await expect(image).toHaveCSS("object-fit", "contain");
    const [figureBox, contentWidth] = await Promise.all([
      figures.boundingBox(),
      dialog.locator(".case-dialog-scroll").evaluate((node) => node.clientWidth),
    ]);
    expect(figureBox).not.toBeNull();
    expect(figureBox!.width / contentWidth).toBeGreaterThanOrEqual(0.9);
  });
}

for (const viewport of [
  { width: 1024, height: 768, stacked: false },
  { width: 767, height: 900, stacked: true },
  { width: 390, height: 844, stacked: true },
]) {
  test(`Job Application Helper gallery has ordered non-overlapping figures at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
    const figures = page.getByRole("group", { name: "秋招网申助手真实产品界面" }).locator("figure");
    await expect(figures).toHaveCount(2);
    const boxes = await figures.evaluateAll((nodes) => nodes.map((node) => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    }));
    expect(rectanglesOverlap(boxes[0], boxes[1])).toBe(false);
    if (viewport.stacked) {
      expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
    } else {
      expect(boxes[1].x).toBeGreaterThanOrEqual(boxes[0].x + boxes[0].width);
      expect(boxes[1].width * boxes[1].height).toBeGreaterThan(boxes[0].width * boxes[0].height);
    }
  });
}

test("detail gallery preserves the two approved Job Application Helper screenshots, features, and source link", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  const gallery = dialog.getByRole("group", { name: "秋招网申助手真实产品界面" });
  const galleryImages = gallery.getByRole("img");
  await expect(galleryImages).toHaveCount(2);
  await expect(gallery.getByRole("img", { name: "秋招网申助手点击扩展后打开的界面" })).toHaveCSS("object-fit", "contain");
  await expect(gallery.getByRole("img", { name: "秋招网申助手的个人信息设置页面" })).toHaveCSS("object-fit", "contain");

  const features = dialog.getByRole("region", { name: "已实现功能" }).getByRole("listitem");
  await expect(features).toHaveCount(10);
  await expect(features.first()).toHaveText("求职资料集中管理。");
  await expect(features.last()).toHaveText("版本化 JSON 备份与 WebDAV 双向同步。");
  const links = dialog.getByRole("link");
  await expect(links).toHaveCount(1);
  await expect(links.first()).toHaveAccessibleName(/查看源码\s*（新窗口）/);
  await expect(links.first()).toHaveAttribute("href", "https://github.com/aurostars/Job-Application-Helper");

  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  await expect(page.locator(".case-gallery img").first()).toHaveCSS("object-fit", "contain");
});

test("detail image failure keeps a stable 16:9 frame", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/projects/job-application-helper/extension-popup.png", (route) => route.abort());
  await page.goto("/?project=job-application-helper", { waitUntil: "networkidle" });
  const gallery = page.getByRole("group", { name: "秋招网申助手真实产品界面" });
  await expect(gallery.getByRole("img", { name: "秋招网申助手点击扩展后打开的界面加载失败" })).toBeVisible();
  await expect(gallery.getByRole("img", { name: "秋招网申助手的个人信息设置页面" })).toBeVisible();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog.getByRole("region", { name: "已实现功能" }).getByRole("listitem")).toHaveCount(10);
  await expect(dialog.getByRole("link", { name: /查看源码\s*（新窗口）/ })).toHaveAttribute(
    "href",
    "https://github.com/aurostars/Job-Application-Helper",
  );
  const box = await gallery.locator(".project-image-frame").first().boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(0);
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
});

test("centers the native dialog in the viewport at desktop widths", async ({ page }) => {
  for (const viewport of viewports.filter(({ width }) => width >= 768)) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();

    const dialog = page.locator("dialog.case-dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.x + box!.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(2);
    expect(Math.abs(box!.y + box!.height / 2 - viewport.height / 2)).toBeLessThanOrEqual(2);
  }
});

test("native dialog traps focus, Escape closes once, restores body styles, and forward reopens", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.body.style.overflow = "clip";
    document.body.style.paddingRight = "7px";
  });

  await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  const close = page.getByRole("button", { name: "关闭秋招网申助手详情" });
  const source = dialog.getByRole("link", { name: /查看源码/ });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(source).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect(source).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => ({
    overflow: document.body.style.overflow,
    paddingRight: document.body.style.paddingRight,
  }))).toEqual({ overflow: "clip", paddingRight: "7px" });

  await page.goForward();
  await expect(page).toHaveURL(/\?project=job-application-helper$/);
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
});

test("backdrop pointer down and up close the native dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "查看项目详情：秋招网申助手" }).click();
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();

  await page.mouse.move(2, 2);
  await page.mouse.down();
  await page.mouse.up();

  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
});

test("opens, deep-links, restores history, focus, and body scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "查看项目详情：秋招网申助手" });
  await trigger.click();
  await expect(page).toHaveURL(/\?project=job-application-helper$/);
  const dialog = page.getByRole("dialog", { name: "秋招网申助手" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("tagName", "DIALOG");
  await expect(dialog).toHaveJSProperty("open", true);
  await expect(dialog).toHaveAttribute("open", "");
  await expect(page.getByRole("button", { name: "关闭秋招网申助手详情" })).toBeFocused();
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("direct project URL closes to overview and focuses project heading", async ({ page }) => {
  await page.goto("/?project=meeting-minutes", { waitUntil: "networkidle" });
  await expect(page.getByRole("dialog", { name: "智能会议纪要工具" })).toBeVisible();
  await page.getByRole("button", { name: "关闭智能会议纪要工具详情" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "个人项目" })).toBeFocused();
});

test("mobile dialog honors inline safe-area margins at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: ".case-dialog { --case-dialog-safe-left: 24px; --case-dialog-safe-right: 20px; }",
  });

  const box = await page.getByRole("dialog", { name: "智能简历编辑工具" }).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(24);
  expect(box!.x + box!.width).toBeLessThanOrEqual(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("mobile dialog stays inside dynamic viewport and scrolls internally", async ({ page }) => {
  for (const viewport of viewports.filter(({ width }) => width <= 390)) {
    await page.setViewportSize(viewport);
    await page.goto("/?project=resume-builder", { waitUntil: "networkidle" });
    const dialog = page.getByRole("dialog", { name: "智能简历编辑工具" });
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.getByRole("button", { name: "关闭智能简历编辑工具详情" })).toBeVisible();

    const scrollMetrics = await dialog.locator(".case-dialog-scroll").evaluate((node) => ({
      clientHeight: node.clientHeight,
      overflowY: getComputedStyle(node).overflowY,
      scrollHeight: node.scrollHeight,
    }));
    expect(scrollMetrics.overflowY).toBe("auto");
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});
