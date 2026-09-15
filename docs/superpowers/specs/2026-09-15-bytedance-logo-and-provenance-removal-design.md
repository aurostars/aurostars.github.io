# 字节跳动 Logo 与项目来源说明清理设计

## 范围

本次仅调整字节跳动 Logo 和项目详情中的来源说明，不改变实习经历布局、项目顺序、项目正文或弹窗交互。

## 字节跳动 Logo

- 将用户提供的 `/Users/bytedance/Downloads/bytedance-color.svg` 原样复制为站点本地资源 `public/companies/bytedance-color.svg`。
- `portfolio.ts` 引用该 SVG，并使用其 `24 × 24` viewBox 对应的方形尺寸元数据。
- 彩色图形 Logo 使用现有白色底板，保持 48px 槽位、内边距、圆角和 `object-fit: contain`。
- 删除当前不再使用的 `bytedance-original.png`；历史方形 `bytedance.svg` 继续作为未引用素材保留。
- 更新素材说明，记录新 SVG 来自用户上传文件。

## 项目来源说明

- 从 `ProjectCaseBase` 中删除 `provenance` 字段。
- 删除三个现有项目中的全部来源说明数据。
- 从 `CaseDetail` 删除 `.case-provenance` 渲染。
- 从全局样式删除 `.case-provenance` 规则。
- 更新测试，明确所有六个项目均不包含 `provenance`，详情弹窗也不渲染来源说明。

## 验证与交付

- 先运行现有测试，证明旧 Logo 路径和来源说明仍被检测到。
- 更新内容、组件与浏览器测试，验证新 SVG 自包含、无脚本、无外链且正常显示。
- 执行单元测试、lint、类型检查、生产构建及浏览器测试。
- 重新生成并离线验证 `/Users/bytedance/Downloads/github/exports/aurostars-homepage.html`。
- 推送 `main`，等待 GitHub Pages 部署成功，并验证线上 Logo 路径及来源说明已消失。
