# 组态系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在网络管理平台下新增单页双页签的组态系统，展示网关/设备拓扑、通信链路、报警位置和运行状态。

**Architecture:** 复用现有公共 app shell、菜单与抽屉组件；新页面以本地演示数据驱动，通过 SVG 绘制两种拓扑，使用页面状态统一驱动筛选、摘要、详情和告警定位。

**Tech Stack:** HTML、CSS、原生 JavaScript、SVG、Font Awesome、现有 `tob-ui.css` 与公共组件。

---

### Task 1: 扩展网络管理平台菜单

**Files:**
- Modify: `app/config/menu.js`

- [ ] 将现有 `service-center` 菜单项改为带 `children` 的菜单组，保留“网络管理平台”作为父级，并添加：

```js
{
  key: "service-center",
  label: "网络管理平台",
  icon: "fa-solid fa-server",
  children: [
    { key: "service-center.overview", label: "网络管理平台", href: "../service-center/service-center.html" },
    { key: "service-center.configuration", label: "组态系统", href: "../network/configuration.html" },
  ],
},
```

- [ ] 保持 `service-center` 图标和原页面入口不变，确保侧边栏递归渲染后父级可展开且当前页能正确高亮。

### Task 2: 创建组态系统页面骨架和视觉样式

**Files:**
- Create: `web/pages/network/configuration.html`

- [ ] 复制现有后台页面的 app shell 结构，设置 `data-menu-key="service-center.configuration"`、页面标题和公共脚本引用。
- [ ] 添加页面标题、刷新时间、页签按钮、复位/全屏操作、四个摘要卡片。
- [ ] 添加三栏工作区：左侧筛选和图例，中部 `#topologyCanvas` 深色 SVG 画布，右侧节点详情与告警队列。
- [ ] 使用 CSS 建立深色网格画布、蓝/绿/黄/红/灰状态色、节点脉冲告警、链路质量标签和窄屏堆叠布局；避免新增第三方依赖。

### Task 3: 实现拓扑数据、SVG 渲染和页签切换

**Files:**
- Modify: `web/pages/network/configuration.html`

- [ ] 定义 `gatewayNodes`、`deviceNodes`、`links`、`alarms` 演示数据，字段统一包含 `id/name/type/zone/status/links/alarm`。
- [ ] 实现 `state = { tab, zone, status, type, selectedId, scale }` 和 `filteredNodes()`。
- [ ] 实现 `renderTopology()`：根据当前页签筛选节点，绘制 SVG 链路、箭头、节点组、状态点和报警标识；点击节点写入 `selectedId` 并刷新详情。
- [ ] 实现 `renderSummary()`、`renderLegend()`、`renderStatusTable()`，保证页签/筛选改变时摘要和列表同步更新。
- [ ] 实现页签按钮切换、状态/区域/类型筛选、图层开关、画布缩放、复位和全屏操作。

### Task 4: 实现节点详情与告警定位

**Files:**
- Modify: `web/pages/network/configuration.html`

- [ ] 右侧详情面板展示节点名称、编码、类型、区域、当前状态、上下游连接、最近心跳和实时值。
- [ ] 告警队列按严重度显示位置、时间和摘要；点击告警调用 `focusNode(id)`，高亮对应 SVG 节点并滚动/居中视图。
- [ ] 对无选中节点显示当前页签的总览状态，对无匹配筛选显示空状态。
- [ ] 将“查看完整档案”接入 `window.openAppDrawer`，保持现有抽屉组件样式和关闭行为。

### Task 5: 添加交互验证并执行检查

**Files:**
- Create: `tests/configuration-system.test.mjs`

- [ ] 使用 Node 的文件读取与字符串断言验证菜单包含 `service-center.configuration` 和正确 href。
- [ ] 断言页面包含两个页签、`#topologyCanvas`、节点数据、`renderTopology`、`focusNode` 和抽屉调用。
- [ ] 运行 `node --test tests/configuration-system.test.mjs`，预期全部通过。
- [ ] 在浏览器中打开 `web/pages/network/configuration.html`，手动验证页签切换、节点详情、告警定位、筛选、复位和全屏；检查窄屏下三栏改为上下布局。

### Task 6: 提交实现

**Files:**
- Commit: `app/config/menu.js`, `web/pages/network/configuration.html`, `tests/configuration-system.test.mjs`

- [ ] 执行 `git diff --check` 检查空白错误。
- [ ] 执行测试命令并确认通过。
- [ ] 提交 `feat: add configuration topology system`。
