import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1024, 1440]) {
  test(`${width}px aligns history copy without timeline or clipped text`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "networkidle" });

    const rows = page.getByTestId("experience-row");
    await expect(rows).toHaveCount(6);
    const roleStarts: number[] = [];
    for (const row of await rows.all()) {
      const geometry = await row.evaluate((element) => {
        const box = (selector: string) => {
          const node = element.querySelector<HTMLElement>(selector)!;
          const { x, y, width, height } = node.getBoundingClientRect();
          return { x, y, width, height, clipped: node.scrollWidth > node.clientWidth };
        };
        return {
          before: getComputedStyle(element, "::before").content,
          after: getComputedStyle(element, "::after").content,
          logo: box(".company-logo-slot"),
          company: box(".experience-organization"),
          role: box(".experience-role"),
          description: box(".experience-highlight"),
          roleAlignment: getComputedStyle(element.querySelector(".experience-role")!).textAlign,
        };
      });
      expect(["none", "normal"]).toContain(geometry.before);
      expect(["none", "normal"]).toContain(geometry.after);
      expect(geometry.logo.width).toBeGreaterThanOrEqual(48);
      expect(geometry.logo.height).toBe(geometry.logo.width);
      expect(Math.abs(geometry.company.x - geometry.description.x)).toBeLessThanOrEqual(1);
      expect(geometry.company.x).toBeGreaterThan(geometry.logo.x + geometry.logo.width);
      expect(geometry.company.clipped).toBe(false);
      expect(geometry.role.clipped).toBe(false);
      expect(geometry.roleAlignment).toBe("left");
      roleStarts.push(geometry.role.x);
    }
    expect(Math.max(...roleStarts) - Math.min(...roleStarts)).toBeLessThanOrEqual(1);

    for (const row of await page.getByTestId("education-row").all()) {
      const logo = (await row.locator(".school-logo-slot").boundingBox())!;
      const copy = (await row.locator(".education-copy").boundingBox())!;
      const rowBox = (await row.boundingBox())!;
      expect(logo.width).toBe(64);
      expect(logo.height).toBe(64);
      const availableStart = logo.x + logo.width + 8;
      const availableEnd = rowBox.x + rowBox.width;
      expect(copy.width).toBeCloseTo(Math.min(160, availableEnd - availableStart), 0);
      expect(copy.x + copy.width / 2).toBeCloseTo((availableStart + availableEnd) / 2, 0);
      await expect(row.locator(".education-copy")).toHaveCSS("text-align", "left");
    }
    const faculty = page.getByText("劳动人事学院", { exact: true });
    const degree = page.getByText("经济学 学士", { exact: true });
    await expect(degree).toBeVisible();
    const facultyBox = (await faculty.boundingBox())!;
    const degreeBox = (await degree.boundingBox())!;
    expect(degreeBox.y).toBeGreaterThanOrEqual(facultyBox.y + facultyBox.height);
    expect(degreeBox.x).toBeCloseTo(facultyBox.x, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const image of await page.locator("#experience img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      await image.evaluate((node: HTMLImageElement) => node.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath(`history-${width}.png`), fullPage: true });
  });
}

test("company logos are loaded and contain enough pixels for their slots", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const image of await page.locator(".company-logo").all()) {
    const state = await image.evaluate((node: HTMLImageElement) => ({
      loaded: node.complete && node.naturalWidth > 0,
      width: node.naturalWidth,
      height: node.naturalHeight,
    }));
    expect(state.loaded).toBe(true);
    expect(state.width / state.height).toBeGreaterThanOrEqual(0.8);
    const isWordmark = await image.getAttribute("alt") === "字节跳动 Logo";
    expect(state.width / state.height).toBeLessThanOrEqual(isWordmark ? 4 : 1.25);
    expect(state.width).toBeGreaterThanOrEqual(48);
  }
});

test("wide desktop balances the role column between the longest description and dates", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const spacing = await page.locator(".experience-list").evaluate(list => {
    const textBox = (node: Element) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return range.getBoundingClientRect();
    };
    const right = Math.max(...Array.from(list.querySelectorAll(".experience-highlight"), node => textBox(node).right));
    const roles = Array.from(list.querySelectorAll(".experience-role"), textBox);
    const dateLeft = Math.min(...Array.from(list.querySelectorAll(".experience-period"), node => textBox(node).left));
    return { left: Math.min(...roles.map(box => box.left)) - right, right: dateLeft - Math.max(...roles.map(box => box.right)) };
  });
  expect(spacing.left).toBeGreaterThan(24);
  expect(spacing.right).toBeGreaterThan(24);
  expect(Math.abs(spacing.left - spacing.right)).toBeLessThan(24);
  const logo = page.getByRole("img", { name: "字节跳动 Logo", exact: true });
  await expect(logo.locator("..")).toHaveAttribute("data-logo-plate", "dark");
  expect(await logo.evaluate((node: HTMLImageElement) => node.naturalWidth / node.naturalHeight)).toBeGreaterThan(3);
});

test("updated internship summaries and the high-resolution institute asset render", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByText("多模态心脏超声智能报告系统的构建与迭代", { exact: true })).toBeVisible();
  await expect(page.getByText("供应链质量管理与产品优化", { exact: true })).toBeVisible();
  const institute = page.getByRole("img", { name: "国研大数据研究院 Logo", exact: true });
  await institute.scrollIntoViewIfNeeded();
  await expect.poll(() => institute.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThanOrEqual(512);
});
