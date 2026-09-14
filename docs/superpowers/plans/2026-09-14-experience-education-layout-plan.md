# 实习与教育经历布局微调实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为实习与教育经历补充清晰品牌图标，并按已确认的列结构改善信息对齐和空间利用率。

**Architecture:** 保持现有单页组件结构，在 `page.tsx` 的经历数据中补充本地图片路径和教育字段，通过 Tailwind 响应式网格完成布局。所有图片放在 `public/logos/`，不引入新依赖，也不改变其他主页区块。

**Tech Stack:** Next.js 16.2.10、React 19.2.4、TypeScript、Tailwind CSS 4、Next.js `Image`

## Global Constraints

- 保留现有深色玻璃拟态视觉语言和全部经历描述内容。
- 实习卡片左侧固定 Logo，右侧第一行依次为公司、岗位、日期。
- 岗位名称在中间列左对齐，工作描述与公司名称左边界一致。
- 删除实习区时间轴线、圆点及其占位。
- 中国人民大学的“劳动人事学院”和“经济学 学士”分别独占一行。
- 所有 Logo 与校徽使用本地清晰素材，不使用易失效的远程图片。
- 不新增运行时依赖。

---

### Task 1: 添加品牌图片素材

**Files:**
- Create: `public/logos/iflytek.png`
- Create: `public/logos/meituan.png`
- Create: `public/logos/drc-big-data.png`
- Create: `public/logos/boss-zhipin.png`
- Create: `public/logos/pacific-securities.png`
- Create: `public/logos/bnu.png`
- Create: `public/logos/ruc.png`

**Interfaces:**
- Produces: 供 `next/image` 使用的 `/logos/<filename>` 本地静态路径。
- Consumes: 各组织公开发布的清晰官方 Logo 或校徽素材。

- [ ] **Step 1: 收集并保存素材**

将五家公司和两所学校的清晰 Logo/校徽分别保存为上述固定文件名。优先保留透明背景；不对图形做非等比拉伸。

- [ ] **Step 2: 检查文件格式与尺寸**

Run:

```bash
file public/logos/*
```

Expected: 七个文件均被识别为有效 PNG 图片，不出现空文件或 HTML 文档。

- [ ] **Step 3: 检查素材可被 Git 跟踪**

Run:

```bash
git status --short public/logos
```

Expected: 七个 Logo 文件均显示为新增文件。

- [ ] **Step 4: Commit**

```bash
git add public/logos
git commit -m "assets: add experience and education logos"
```

### Task 2: 重排实习经历

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Task 1 提供的 `/logos/*.png` 路径。
- Produces: `Home` 页面内无时间轴、带 Logo 的响应式实习卡片。

- [ ] **Step 1: 建立修改前验证基线**

Run:

```bash
npm ci
npm run lint
npm run build
```

Expected: 依赖安装完成，现有代码通过 ESLint 和生产构建。

- [ ] **Step 2: 补充图片组件与经历字段**

在 `src/app/page.tsx` 顶部加入：

```tsx
import Image from "next/image";
```

为五条实习数据分别增加：

```tsx
logo: "/logos/iflytek.png"
logo: "/logos/meituan.png"
logo: "/logos/drc-big-data.png"
logo: "/logos/boss-zhipin.png"
logo: "/logos/pacific-securities.png"
```

- [ ] **Step 3: 删除时间轴结构**

将实习列表外层的 `relative mt-8 pl-10` 改为无左侧占位的 `mt-8`，删除 `timeline-line` 元素、每条记录的绝对定位圆点，以及数据中的 `color` 字段。

从 `src/app/globals.css` 删除 `.timeline-line` 和 `.timeline-dot` 样式块，避免遗留无用样式。

- [ ] **Step 4: 实现卡片两列布局**

每条卡片采用以下结构：

```tsx
<div className="glass grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 rounded-2xl p-5 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-5">
  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 sm:h-16 sm:w-16">
    <Image
      src={item.logo}
      alt={`${item.company} Logo`}
      width={64}
      height={64}
      className="h-full w-full object-contain"
    />
  </div>
  <div className="min-w-0">
    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(8rem,0.8fr)_auto] sm:items-center">
      <p className="font-semibold text-slate-200">{item.company}</p>
      <p className="text-sm text-slate-300 sm:text-left">{item.role}</p>
      <p className="text-xs font-medium text-blue-400 sm:text-right">{item.date}</p>
    </div>
    <ul className="mt-3 space-y-1">
      {/* 保留现有 highlights 渲染 */}
    </ul>
  </div>
</div>
```

桌面宽度下公司、岗位、日期严格同排；窄屏下三项允许纵向排列，避免长公司名压缩岗位和日期。

- [ ] **Step 5: 验证实习区**

Run:

```bash
npm run lint
npm run build
```

Expected: 两条命令均成功；构建中没有无效图片路径、TypeScript 或 ESLint 错误。

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "style: align internship experience cards"
```

### Task 3: 重排教育经历

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Task 1 提供的 `/logos/bnu.png` 与 `/logos/ruc.png`。
- Produces: 带放大校徽、紧凑文字布局和独立学院/学位行的教育卡片。

- [ ] **Step 1: 扩展教育数据**

将教育数据改为独立文本行，避免补充未经确认的院系信息：

```tsx
{
  school: "北京师范大学",
  details: ["理论经济学 硕士"],
  period: "2024.09 - 2027.06",
  logo: "/logos/bnu.png",
},
{
  school: "中国人民大学",
  details: ["劳动人事学院", "经济学 学士"],
  period: "2020.09 - 2024.06",
  logo: "/logos/ruc.png",
},
```

- [ ] **Step 2: 实现紧凑教育卡片**

将卡片内部改成校徽与文字并排布局：

```tsx
<div className="glass flex h-full items-center gap-4 rounded-2xl p-5 sm:gap-5 sm:p-6">
  <div className="flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
    <Image
      src={edu.logo}
      alt={`${edu.school}校徽`}
      width={96}
      height={96}
      className="h-full w-full object-contain"
    />
  </div>
  <div className="min-w-0">
    <div className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-medium text-white">
      {edu.period}
    </div>
    <h3 className="mt-3 text-lg font-semibold text-slate-100">{edu.school}</h3>
    <div className="mt-1 space-y-1">
      {edu.details.map((detail) => (
        <p key={detail} className="text-sm text-slate-400">{detail}</p>
      ))}
    </div>
  </div>
</div>
```

- [ ] **Step 3: 验证教育区**

Run:

```bash
npm run lint
npm run build
```

Expected: 两条命令均成功；教育数据字段和图片渲染没有类型或构建错误。

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "style: tighten education card layout"
```

### Task 4: 响应式与最终验证

**Files:**
- Modify if required: `src/app/page.tsx`
- Modify if required: `src/app/globals.css`

**Interfaces:**
- Consumes: Task 2 与 Task 3 的页面布局。
- Produces: 在桌面端和移动端均无溢出的最终页面。

- [ ] **Step 1: 启动本地预览**

Run:

```bash
npm run dev
```

Expected: Next.js 本地开发服务器正常启动，主页无运行时错误。

- [ ] **Step 2: 检查桌面布局**

在约 `1280px` 宽度检查：

- 公司、岗位、日期位于同一行。
- 岗位列左对齐，日期靠右。
- 描述与公司名称左边界一致。
- 左侧仅显示 Logo，不再有时间轴竖线和圆点。
- 两张教育卡片的校徽尺寸醒目，文字紧邻校徽。

- [ ] **Step 3: 检查移动布局**

在约 `390px` 宽度检查：

- 长公司名称、岗位和日期不重叠、不溢出。
- Logo 不被压缩，描述仍与右侧内容列对齐。
- 教育卡片无横向滚动，学院与学位仍各占一行。

- [ ] **Step 4: 最终自动验证**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected: 全部命令退出码为 `0`，无空白错误。

- [ ] **Step 5: Commit**

如视觉检查需要响应式微调：

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "fix: refine responsive resume layout"
```

若无需额外修改，则跳过本提交。
