# Task 2 报告 — DONE

日期：2026-09-11

## 结论

Task 2 已补齐全部 13 个要求的 PNG，并为 `portfolioCases` 的每个媒体路径增加存在性与大于 1KB 的测试。所有界面媒体均来自真实仓库资产或真实运行应用截图；未在作品集内重绘界面，也未编造业务结果。

## TDD RED 证据

在复制任何资产前，先修改 `src/content/portfolio.test.ts`，新增逐项解析 `public` 路径、断言文件存在且大小大于 1024 字节的测试。

首次运行：

```text
npm test -- src/content/portfolio.test.ts
Test Files  1 failed (1)
Tests       1 failed | 4 passed (5)
/projects/job-application-helper/profile-manager.png should exist under public
```

该失败来自首个缺失媒体文件，符合预期 RED。

## 资产来源

### 批准的仓库直接复制

- `public/projects/job-application-helper/icon.png`
  - 来源：`case-job-application-helper/public/icons/icon128.png`
- `public/projects/resume-builder/workspace.png`
  - 来源：`case-resume-builder/public/web-shot.png`
- `public/projects/resume-builder/modern-template.png`
  - 来源：`case-resume-builder/public/template-snapshots/zh/modern.png`
- `public/projects/resume-builder/polish.png`
  - 来源：`case-resume-builder/public/features/polish.png`

### AIME 云端浏览器真实运行截图

本地浏览器未连接，因此截图全部通过 AIME 云端浏览器执行；没有使用 Playwright、Puppeteer、Selenium 或独立 Chrome。云端浏览器仅访问以下本地运行地址：

- `http://127.0.0.1:4173` — 秋招网申助手构建产物
  - `profile-manager.png`：真实 Options 资料管理界面。
  - `application-records.png`：真实投递记录界面。
  - `visual-fill.png`：真实 popup React bundle 渲染结果，包含应用原有的“AI 框选补填”入口。由于云端浏览器不能加载 Manifest V3 解压扩展，在页面运行时注入最小 `chrome.runtime`、`chrome.storage`、`chrome.tabs`、`chrome.windows` 与 `chrome.scripting` API shim，并重新加载真实构建 bundle；资料数据结构取自项目测试 fixture。未修改源仓库、未重绘组件。截图为真实 popup 组件边界，尺寸 360×480。
- `http://127.0.0.1:8080` — 面试复盘助手
  - `upload.png`：真实上传界面。
  - `analysis.png`：使用应用允许的文本输入路径生成的真实逐题分析页面，无私人数据。
  - `patterns.png`：真实“至少需要 2 场已分析面试”的空状态。
- `http://127.0.0.1:8899` — 会议纪要工具
  - 输入使用仓库 `demo_data/simple_meeting.txt`。
  - `input.png`：真实转写输入界面。
  - `pipeline.png`：真实 `/api/process` 请求返回 HTTP 200 `text/event-stream` 后的处理中界面。为克服阶段切换快于截图延迟的问题，仅在浏览器运行时将真实 SSE 流暂停在首个阶段事件之后；截图时应用状态为 `processingState=running`、`currentStage=1`，页面显示“阶段1 参会人识别中”。未修改源仓库、未合成状态或结果。
  - `review.png`：真实执行完整六阶段降级流程所得的 0 分低置信度结果；没有配置 LLM Key，也没有编造业务结果。

除 popup 组件截图外，云端浏览器截图尺寸为 1920×1563；浏览器技能未提供视口调整接口，因此保留实际视口而未伪装为偏好的 1440×900。

## 验证结果

### 目标测试

```text
npm test -- src/content/portfolio.test.ts
Test Files  1 passed (1)
Tests       5 passed (5)
```

### 图片可读性与大小

通过 Pillow 打开并验证 `public/projects/**/*.png`：共 13 个 PNG，全部可读且每个大于 1024 字节。最小文件为 `icon.png`（3011 bytes）。

### Diff 与源仓库保护

- `git diff --check`：通过（无输出）。
- 四个源项目仓库 `git status --short`：均为空。
- 未修改四个源项目仓库。
- 未 push。

## Commit

- Subject：`assets: add verified project media`
- SHA：本报告与媒体位于同一提交中；最终不可自引用 SHA 以 `git rev-parse HEAD` 和任务交付消息为准。

## Task 2 审查修复（2026-09-11）

### TDD RED → GREEN

先加强 `src/content/portfolio.test.ts`，以 13 个字面量路径锁定批准资产集合，并直接读取 PNG 文件验证：8 字节 PNG 签名、首个 `IHDR` chunk、文件大于 1KB，以及 IHDR 宽高与 `ProjectMedia.width/height` 一致。

修复数据前执行目标测试，得到预期 RED：

```text
Test Files  1 failed (1)
Tests       1 failed | 4 passed (5)
expected [ …(12) ] to deeply equal [ …(13) ]
- "/projects/job-application-helper/icon.png"
```

随后仅修复内容数据：将真实的 `icon.png` 作为 Job Application Helper 的 `ProjectMedia`（128×128，描述为浏览器扩展图标）加入，并按各文件 IHDR 校正 13 项媒体元数据。未重采样或修改 PNG。

修复后目标测试：

```text
Test Files  1 passed (1)
Tests       5 passed (5)
```

### 四个直接复制资源 SHA-256 对照

| Source | Target | Source SHA-256 | Target SHA-256 |
| --- | --- | --- | --- |
| `case-job-application-helper/public/icons/icon128.png` | `public/projects/job-application-helper/icon.png` | `5b7ee669470d6b60ae3e1735894d2cf4e0042eecbdc375ea52912078e9188084` | `5b7ee669470d6b60ae3e1735894d2cf4e0042eecbdc375ea52912078e9188084` |
| `case-resume-builder/public/web-shot.png` | `public/projects/resume-builder/workspace.png` | `174796a4e2d2afaff73fdfe17ee994b37754d248f44a5e5af7cdbc0552502169` | `174796a4e2d2afaff73fdfe17ee994b37754d248f44a5e5af7cdbc0552502169` |
| `case-resume-builder/public/template-snapshots/zh/modern.png` | `public/projects/resume-builder/modern-template.png` | `9160d832c225d1ae15e0deb1f7aeaf065a47b5eb63d0dc1c7b5525a4ee2e82f1` | `9160d832c225d1ae15e0deb1f7aeaf065a47b5eb63d0dc1c7b5525a4ee2e82f1` |
| `case-resume-builder/public/features/polish.png` | `public/projects/resume-builder/polish.png` | `bd9874028cbcdb88b654c90d4ed3d4a05bc8374bd237e8d8e24dbfcf16021d31` | `bd9874028cbcdb88b654c90d4ed3d4a05bc8374bd237e8d8e24dbfcf16021d31` |
