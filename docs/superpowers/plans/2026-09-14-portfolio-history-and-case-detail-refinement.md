# Portfolio History and Case Detail Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将个人主页履历区改为校徽教育卡与紧凑实习时间轴，并按已确认规则重组项目详情、图片和首屏密度。

**Architecture:** 保持现有 Next.js 单页、集中式 `portfolio.ts` 内容模型、原生 dialog 与 CSS 视觉系统。先调整数据契约和本地资源，再分别修改履历与项目详情组件，最后使用 Vitest 和 Playwright 固化 36/64 布局、首屏露出、媒体数量及交互回归。

**Tech Stack:** Next.js 16.2.10、React 19.2.4、TypeScript 5、原生 CSS/Tailwind 4 基础设施、Motion 13.2.0、Vitest 3.2.4、Testing Library、Playwright 1.62.1、Sharp 0.34.5。

## Global Constraints

- 桌面端履历比例为教育 36%、实习 64%；仅 767px 及以下堆叠。
- 延续现有 B1 冰白/雾蓝、低饱和电蓝和克制磨砂体系，不引入新视觉语言。
- 项目图片使用 `object-fit: contain`，不得裁切产品界面。
- “查看源码”是每个项目唯一外部项目链接，并移动到 dialog header 右上角。
- 删除所有“核心问题”；“背景”和“目标”必须各占一整行。
- 秋招网申助手保留 2 张图；面试复盘、智能简历编辑、智能会议纪要各保留 1 张图。
- 不改变邮箱、GitHub、dialog 深链、History、焦点恢复、Reduced Motion 和无 JavaScript 能力。
- 生产代码必须遵循 TDD：先写失败测试并确认失败，再写最小实现。
- 不新增运行时依赖，不进行框架迁移或无关重构。

## File Structure

- Modify: `src/content/portfolio.ts` — 扩展教育数据、更新实习文案、裁剪项目媒体与来源说明。
- Create: `src/components/school-logo.tsx` — 学校校徽与失败降级，职责独立于公司 Logo。
- Create: `src/components/school-logo.test.tsx` — 校徽正常及失败行为。
- Modify: `src/components/profile-history.tsx` — 三行教育条目与单行实习标题。
- Modify: `src/components/case-dialog.tsx` — header 右上角源码链接与关闭操作区。
- Modify: `src/components/case-detail.tsx` — 删除核心问题、拆分背景/目标、媒体布局标记。
- Modify: `src/app/globals.css` — 首屏密度、36/64 履历、时间轴、header 操作区和图片布局。
- Create: `public/schools/beijing-normal-university.svg` — 北京师范大学正式校徽本地资源。
- Create: `public/schools/renmin-university-of-china.svg` — 中国人民大学正式校徽本地资源。
- Modify: `src/content/portfolio.test.ts` — 内容和媒体契约。
- Modify: `src/components/home-page.test.tsx` — 履历结构与详情内容。
- Modify: `src/components/case-dialog.test.tsx` — header 操作区、链接与关闭按钮。
- Modify: `tests/browser/compact-portfolio.spec.ts` — 履历几何、首屏、dialog 与图片布局。
- Modify: `tests/browser/visual-assets.spec.ts` — 校徽/Logo/项目图片可辨识与失败降级。

---

### Task 1: 内容契约、校徽资源与项目媒体

**Files:**
- Create: `public/schools/beijing-normal-university.svg`
- Create: `public/schools/renmin-university-of-china.svg`
- Modify: `src/content/portfolio.ts:7-226`
- Modify: `src/content/portfolio.test.ts`

**Interfaces:**
- Produces: `SchoolLogo = ProjectMedia`。
- Produces: `EducationItem { school, schoolLogo, faculty, major, degree, period }`。
- Produces: 每个 `ProjectCase.media` 的最终媒体数组；保留 `background`、`goal`，移除 `userProblems`；`provenance` 改为可选字段，并在智能简历编辑工具对象中省略。
- Consumes: 现有 `ProjectMedia`、`CompanyLogo` 和四个 `ProjectSlug`。

- [ ] **Step 1: 写内容契约失败测试**

在 `src/content/portfolio.test.ts` 增加以下等价断言：

```ts
expect(education).toEqual([
  expect.objectContaining({
    school: "北京师范大学",
    faculty: "经济与工商管理学院",
    major: "经济学",
    degree: "硕士",
    period: "2024 - 2027",
    schoolLogo: expect.objectContaining({ src: "/schools/beijing-normal-university.svg" }),
  }),
  expect.objectContaining({
    school: "中国人民大学",
    faculty: "劳动人事学院",
    major: "经济学",
    degree: "学士",
    period: "2020 - 2024",
    schoolLogo: expect.objectContaining({ src: "/schools/renmin-university-of-china.svg" }),
  }),
]);

expect(experiences).toEqual(expect.arrayContaining([
  expect.objectContaining({ organization: "美团", highlight: "供应链质量管理" }),
  expect.objectContaining({ organization: "国务院发展研究中心大数据研究院", highlight: "大数据平台产品构建" }),
  expect.objectContaining({ organization: "BOSS 直聘", highlight: "行业研究与产品优化" }),
]));

expect(Object.fromEntries(portfolioCases.map((item) => [item.slug, item.media.length]))).toEqual({
  "job-application-helper": 2,
  "interview-review": 1,
  "resume-builder": 1,
  "meeting-minutes": 1,
});
expect(portfolioCases.every((item) => !("userProblems" in item))).toBe(true);
expect(portfolioCases.find((item) => item.slug === "resume-builder")?.provenance ?? "").not.toContain("JOYCEQL/magic-resume");
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/content/portfolio.test.ts`  
Expected: FAIL，指出 `faculty`、`schoolLogo` 缺失，实习文案和媒体数量仍为旧值，且 `userProblems` 仍存在。

- [ ] **Step 3: 添加正式校徽静态资源**

将两所学校正式校徽保存为上述本地 SVG 路径；保留官方比例和品牌色，删除外部脚本、字体引用和不必要 metadata。使用 `viewBox`，不要写固定页面背景。

- [ ] **Step 4: 最小修改数据模型与内容**

在 `src/content/portfolio.ts` 定义：

```ts
export type SchoolLogo = ProjectMedia;

export interface EducationItem {
  school: string;
  schoolLogo: SchoolLogo;
  faculty: string;
  major: string;
  degree: string;
  period: string;
}
```

删除 `ProjectCase.userProblems`。将四个媒体数组精确收敛为：

```ts
jobApplicationHelper.media = [extensionPopup, profileManager];
interviewReview.media = [analysis];
resumeBuilder.media = [workspace];
meetingMinutes.media = [input];
```

更新三处实习文案；将 `ProjectCase.provenance` 改为可选字段，智能简历编辑工具对象中删除该字段，其余三个项目保留现有来源说明。

- [ ] **Step 5: 运行内容测试并确认 GREEN**

Run: `npm test -- src/content/portfolio.test.ts`  
Expected: PASS。

- [ ] **Step 6: 提交**

```bash
git add src/content/portfolio.ts src/content/portfolio.test.ts public/schools
git commit -m "feat: refine portfolio history content"
```

---

### Task 2: 校徽教育列表与紧凑实习时间轴

**Files:**
- Create: `src/components/school-logo.tsx`
- Create: `src/components/school-logo.test.tsx`
- Modify: `src/components/profile-history.tsx:1-54`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css:94-190`

**Interfaces:**
- Consumes: Task 1 的 `EducationItem.schoolLogo/faculty/major/degree`。
- Produces: `<SchoolLogo logo={SchoolLogo}>`，图片失败后隐藏图片但保留 `.school-logo-slot`。
- Produces: `.education-entry`、`.education-copy`、`.education-meta`、`.experience-title-line` 供 CSS 与 Playwright 定位。

- [ ] **Step 1: 写组件结构失败测试**

在 `home-page.test.tsx` 和新建 `school-logo.test.tsx` 中增加等价测试：

```tsx
const educationRows = screen.getAllByTestId("education-row");
expect(within(educationRows[0]).getByAltText("北京师范大学校徽")).toBeInTheDocument();
expect(within(educationRows[0]).getByText("经济与工商管理学院")).toBeInTheDocument();
expect(within(educationRows[0]).getByText("经济学")).toBeInTheDocument();
expect(within(educationRows[0]).getByText("硕士")).toBeInTheDocument();

const meituan = screen.getAllByTestId("experience-row").find((row) => within(row).queryByText("美团"));
expect(meituan).toBeDefined();
expect(within(meituan!).getByText("供应链质量管理")).toBeInTheDocument();
expect(within(meituan!).getByTestId("experience-title-line")).toContainElement(within(meituan!).getByText(/AI 产品经理|产品经理|研究助理/));
```

`SchoolLogo` 测试触发 `error` 后断言图片被移除、占位仍存在且学校名文本不消失。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/components/school-logo.test.tsx src/components/home-page.test.tsx`  
Expected: FAIL，指出组件不存在、校徽和新行结构缺失。

- [ ] **Step 3: 实现 `SchoolLogo`**

沿用 `CompanyLogo` 的失败降级模式，组件仅负责图片加载和隐藏：

```tsx
export function SchoolLogo({ logo }: { logo: SchoolLogoData }) {
  const [failed, setFailed] = useState(false);
  return failed ? null : (
    <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} onError={() => setFailed(true)} />
  );
}
```

- [ ] **Step 4: 重构履历语义结构**

教育条目使用：

```tsx
<li className="education-entry" data-testid="education-row">
  <div className="school-logo-slot"><SchoolLogo logo={item.schoolLogo} /></div>
  <div className="education-copy">
    <strong>{item.school}</strong>
    <p className="education-meta"><span>{item.faculty}</span><span>{item.major}</span><span>{item.degree}</span></p>
    <time>{item.period}</time>
  </div>
</li>
```

实习条目第一行使用 `.experience-title-line`，顺序为 Logo、公司名、职位、时间；工作内容在第二行 `.experience-highlight`。

- [ ] **Step 5: 实现 36/64 与紧凑首屏 CSS**

关键 CSS 契约：

```css
.identity-bar { padding-block: clamp(1rem, 2vw, 1.5rem) clamp(0.5rem, 1vw, 0.75rem); }
.profile-history { padding-block: 0 clamp(1.25rem, 2vw, 2rem); }
.profile-history-motion { grid-template-columns: minmax(0, 36fr) minmax(0, 64fr); }
.education-entry { display: grid; grid-template-columns: 3rem minmax(0, 1fr); }
.experience-title-line { display: grid; grid-template-columns: auto minmax(0, auto) minmax(0, 1fr) auto; }
@media (max-width: 767px) { .profile-history-motion { grid-template-columns: 1fr; } }
```

不得增加固定高度；让履历内容自然决定高度。

- [ ] **Step 6: 运行聚焦和全量单元测试**

Run: `npm test -- src/components/school-logo.test.tsx src/components/home-page.test.tsx`  
Expected: PASS。  
Run: `npm test`  
Expected: 全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/components/school-logo.tsx src/components/school-logo.test.tsx src/components/profile-history.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: add compact branded profile history"
```

---

### Task 3: Dialog 顶部操作区与详情信息结构

**Files:**
- Modify: `src/components/case-dialog.tsx:1-149`
- Modify: `src/components/case-detail.tsx:1-84`
- Modify: `src/components/case-dialog.test.tsx`
- Modify: `src/components/home-page.test.tsx`
- Modify: `src/app/globals.css:360-578`

**Interfaces:**
- Consumes: `ProjectCase.repositoryUrl/background/goal/features/workflow/media`。
- Produces: `.case-dialog-actions`，含唯一 `.case-source-link` 与 `.case-dialog-close`。
- Produces: `.case-background` 和 `.case-goal` 两个整行 section。
- Produces: `data-gallery-layout="job-helper-duo" | "single"`。

- [ ] **Step 1: 写详情结构失败测试**

在 `case-dialog.test.tsx` 和 `home-page.test.tsx` 增加：

```tsx
const dialog = await screen.findByRole("dialog", { name: project.title });
const header = dialog.querySelector(".case-dialog-header")!;
expect(within(header).getByRole("link", { name: /查看源码/ })).toHaveAttribute("href", project.repositoryUrl);
expect(within(dialog).getAllByRole("link", { name: /查看源码/ })).toHaveLength(1);
expect(within(dialog).queryByText("核心问题")).not.toBeInTheDocument();
expect(dialog.querySelector(".case-background")).toHaveTextContent(project.background);
expect(dialog.querySelector(".case-goal")).toHaveTextContent(project.goal);
expect(dialog.querySelector(".case-detail-links")).not.toBeInTheDocument();
```

对关闭按钮断言 class 保留，浏览器层再验证 cursor。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/components/case-dialog.test.tsx src/components/home-page.test.tsx`  
Expected: FAIL，源码链接仍在详情底部，“核心问题”仍存在，背景/目标没有独立 class。

- [ ] **Step 3: 将源码链接移动到 dialog header**

在标题/简介右侧新增：

```tsx
<div className="case-dialog-actions">
  <a className="case-source-link" href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
    查看源码<span className="sr-only">（新窗口）</span>
  </a>
  <button className="case-dialog-close" type="button" onClick={handleClose}>关闭</button>
</div>
```

保持按钮既有可访问名称和关闭生命周期，不改变 Escape/backdrop/History 逻辑。

- [ ] **Step 4: 重组 `CaseDetail`**

删除核心问题 section 和底部 `.case-detail-links`。将背景与目标改为：

```tsx
<div className="case-detail-grid">
  <section className="case-background"><h4>背景</h4><p>{project.background}</p></section>
  <section className="case-goal"><h4>目标</h4><p>{project.goal}</p></section>
</div>
```

每个 section 单独一行。图库按媒体数和 slug 输出：

```ts
const galleryLayout = project.slug === "job-application-helper" ? "job-helper-duo" : "single";
```

- [ ] **Step 5: 更新 CSS**

- `.case-dialog-header` 使用标题区 + `.case-dialog-actions` 两列布局。
- `.case-dialog-actions` 设置 `display:flex; align-items:center; gap`。
- `.case-dialog-close { cursor: pointer; }`，保留 hover/active/focus-visible。
- `.case-detail-grid { grid-template-columns: 1fr; }`。
- `.case-gallery[data-gallery-layout="single"] { grid-template-columns: 1fr; }`，figure 和图片占满可用宽度。
- `.case-gallery[data-gallery-layout="job-helper-duo"]` 使用非对称双栏，让第二张图获得更大面积；767px 及以下堆叠。

- [ ] **Step 6: 运行单元测试并确认 GREEN**

Run: `npm test -- src/components/case-dialog.test.tsx src/components/home-page.test.tsx`  
Expected: PASS。  
Run: `npm test`  
Expected: 全部 PASS。

- [ ] **Step 7: 提交**

```bash
git add src/components/case-dialog.tsx src/components/case-detail.tsx src/components/case-dialog.test.tsx src/components/home-page.test.tsx src/app/globals.css
git commit -m "feat: refine project detail presentation"
```

---

### Task 4: 响应式几何、首屏露出与视觉资源浏览器覆盖

**Files:**
- Modify: `tests/browser/compact-portfolio.spec.ts`
- Modify: `tests/browser/visual-assets.spec.ts`
- Modify only if tests expose a defect: `src/app/globals.css`

**Interfaces:**
- Consumes: Tasks 1–3 的 class 和 `data-gallery-layout` 契约。
- Produces: 36/64、首屏、校徽/Logo、cursor 和图库几何回归保护。

- [ ] **Step 1: 写响应式几何失败测试**

参数化 1440、1024、768px，断言：

```ts
const educationBox = await page.getByRole("heading", { name: "教育经历" }).locator("..").boundingBox();
const internshipBox = await page.getByRole("heading", { name: "实习经历" }).locator("..").boundingBox();
const ratio = educationBox!.width / (educationBox!.width + internshipBox!.width);
expect(ratio).toBeGreaterThan(0.33);
expect(ratio).toBeLessThan(0.39);
expect(Math.abs(educationBox!.y - internshipBox!.y)).toBeLessThanOrEqual(2);
```

在 767、390、320px 断言实习 `y` 大于教育底部且 `document.scrollWidth <= innerWidth`。在 1440×900 和 1024×768 断言“个人项目”标题的顶部小于 viewport 高度。

- [ ] **Step 2: 写 dialog 与图库失败测试**

- hover 关闭按钮后 `getComputedStyle(button).cursor === "pointer"`。
- header 内存在唯一源码链接。
- 不存在“核心问题”。
- 背景和目标 bounding boxes 纵向排列、宽度接近详情可用宽度。
- 单图项目图库只有一个 figure 且宽度占滚动区至少 90%。
- 秋招网申助手第二张图面积大于第一张，移动端两图纵向不重叠。

- [ ] **Step 3: 写资源与降级失败测试**

- 两所学校校徽成功加载，`naturalWidth > 0`，`object-fit: contain`。
- 拦截一个 `/schools/*.svg` 请求失败，比较成功/失败前后的条目、slot 和学校名 bounding boxes，误差不超过 1px。
- 公司 Logo 资源仍全部成功加载。

- [ ] **Step 4: 运行测试并确认 RED**

Run: `npm run test:browser:portfolio -- --reporter=dot`  
Run: `npm run test:browser:assets -- --reporter=dot`  
Expected: 新增断言至少一项因旧布局/旧详情结构失败。

- [ ] **Step 5: 仅修复测试暴露的必要 CSS 缺陷**

不得放宽 36/64、首屏露出或 90% 单图宽度阈值来掩盖问题；修复实际间距、grid 或 max-width。

- [ ] **Step 6: 运行浏览器套件并确认 GREEN**

Run: `npm run test:browser:portfolio -- --reporter=dot`  
Expected: PASS。  
Run: `npm run test:browser:assets -- --reporter=dot`  
Expected: PASS。  
Run: `npm run test:browser:reduced -- --reporter=dot`  
Expected: PASS。  
Run: `npm run test:browser:no-js -- --reporter=dot`  
Expected: PASS。

- [ ] **Step 7: 提交**

```bash
git add tests/browser/compact-portfolio.spec.ts tests/browser/visual-assets.spec.ts src/app/globals.css
git commit -m "test: cover refined portfolio layout"
```

---

### Task 5: 最终审查、生产构建与重新部署

**Files:**
- Review: 本计划涉及的全部文件。
- Modify only for审查修复: 对应源文件与测试。

**Interfaces:**
- Consumes: Tasks 1–4 的完整实现。
- Produces: 可发布静态站点 `out/` 与验证后的部署 URL。

- [ ] **Step 1: 逐条核对设计规范**

对照 `docs/superpowers/specs/2026-09-14-portfolio-history-and-case-detail-refinement-design.md`，确认每项内容、布局、媒体和交互要求均有实现或自动化证据。

- [ ] **Step 2: 运行完整发布门禁**

```bash
npm test
npm run lint
npm run typecheck
npm run test:browser:portfolio -- --reporter=dot
npm run test:browser:assets -- --reporter=dot
npm run test:browser:reduced -- --reporter=dot
npm run test:browser:no-js -- --reporter=dot
npm run build
npm audit --omit=dev --audit-level=high
git diff --check
```

Expected: 所有命令 exit 0；`out/index.html` 存在；生产依赖 0 个 high/critical 漏洞。

- [ ] **Step 3: 请求独立代码审查**

审查范围从 `f880194` 的下一提交到当前 HEAD，按 Critical/Important/Minor 分类。任何 Critical/Important 必须先修复并做 scoped re-review。

- [ ] **Step 4: 提交最终修复（仅在必要时）**

```bash
git add src/content/portfolio.ts src/components/profile-history.tsx src/components/case-dialog.tsx src/components/case-detail.tsx src/app/globals.css src/components/*.test.tsx tests/browser/*.spec.ts public/schools/*.svg
git commit -m "fix: close portfolio refinement review"
```

- [ ] **Step 5: 部署静态产物并做部署后视觉验证**

使用部署工具发布绝对路径 `.../portfolio-density-redesign/out`。部署后检查身份卡、校徽教育区、实习时间轴、首屏项目标题、四个项目 dialog、源码链接、所有图片和控制台错误。

- [ ] **Step 6: 保留分支并提供集成选项**

不得自动 push、merge 或删除工作树。向用户提供：本地合并到 main、push 并创建 PR、保留分支三种选项。
