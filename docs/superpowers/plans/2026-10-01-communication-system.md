# 通信系统功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在视频监控菜单后新增通信系统工作台，完成呼叫信息呈现、位置关联和通话记录查询的高保真原型。

**Architecture:** 沿用现有 `APP_MENU` 配置和静态页面路由；新增独立通信页面与专属 CSS，页面脚本以内存模拟数据实现筛选、选中联动、刷新、抽屉详情和记录查询，未来可将数据数组替换为第三方适配器。复用现有 `sidebar.js`、`header.js`、`drawer.js` 和 `tob-ui.css`。

**Tech Stack:** 原生 HTML、CSS、JavaScript、Font Awesome、Node 测试脚本。

---

### Task 1: 注册通信系统菜单

**Files:**
- Modify: `app/config/menu.js`

- [ ] **Step 1: 在视频监控菜单后加入一级菜单**

插入 `communication-system` 菜单项，使用 `fa-solid fa-phone-volume` 图标，默认链接为 `../communication/communication.html`，并确保它紧跟 `video-monitoring` 配置。

- [ ] **Step 2: 检查菜单语法和顺序**

运行 `node --check app/config/menu.js`，预期无输出且退出码为 0；用 `rg -n "video-monitoring|communication-system" app/config/menu.js` 确认顺序。

- [ ] **Step 3: 提交菜单变更**

运行 `git add app/config/menu.js && git commit -m "feat: add communication system menu"`。

### Task 2: 创建通信工作台页面结构和模拟数据

**Files:**
- Create: `web/pages/communication/communication.html`

- [ ] **Step 1: 创建页面骨架**

添加统一的 `app-shell`、侧边栏、顶部栏、`screen-frame`，设置 `data-menu-key="communication-system"`、`data-page-section="通信系统"`、`data-page-title="通信系统"`，加载 `tob-ui.css`、`communication.css`、公共组件脚本和页面脚本。

- [ ] **Step 2: 添加状态与统计区**

添加数据源状态徽标、最近同步时间、刷新按钮，以及呼叫总数、待处理、通话中、今日已完成 4 个统计卡片。

- [ ] **Step 3: 添加呼叫信息与位置关联区**

左侧放置关键字、状态、日期筛选和呼叫列表；右侧放置管廊定位画布、位置标记、终端信息和查看详情按钮。列表字段固定为呼叫编号、终端、呼叫类型、位置、开始时间、时长和状态。

- [ ] **Step 4: 添加通话记录查询区**

添加终端、通话类型、日期查询项和查询/导出按钮，下方表格展示通话记录，包含记录编号、呼叫编号、终端、位置、开始/结束时间、时长、处理结果、操作。

- [ ] **Step 5: 在页面脚本中定义本地模拟数据**

定义 `integration`、`calls`、`records` 三组对象，字段与设计说明保持一致，并预置在线、待处理、通话中、已完成等状态，保证首屏有可见数据。

### Task 3: 实现通信页面交互

**Files:**
- Modify: `web/pages/communication/communication.html`

- [ ] **Step 1: 实现呼叫筛选与列表渲染**

编写 `renderCalls()` 和 `filterCalls()`，根据关键字、状态、日期筛选 `calls`，无结果时输出统一空状态；统计卡片从筛选前的全量数据计算。

- [ ] **Step 2: 实现呼叫选中与位置联动**

编写 `selectCall(callId)`，更新列表 active 状态、定位标记样式、位置面板字段和通话记录的 `callId` 筛选；首次加载默认选中第一条。

- [ ] **Step 3: 实现记录查询与操作反馈**

编写 `renderRecords()` 和 `filterRecords()`，支持终端、类型、日期和当前呼叫筛选；查询后更新结果计数并调用 `window.showToast`，导出按钮给出“已生成导出文件”提示。

- [ ] **Step 4: 接入抽屉详情**

点击位置详情或记录操作时调用 `window.openAppDrawer`，展示完整位置/通话字段和关闭按钮。

- [ ] **Step 5: 实现同步刷新状态**

刷新按钮切换为同步中状态，短暂延迟后更新 `lastSyncAt`、恢复已连接徽标并提示同步完成；异常状态只展示提示，不清空现有数据。

- [ ] **Step 6: 运行页面脚本语法检查**

运行 `node --check web/pages/communication/communication.html` 不适用时，将内联脚本复制到临时 `.js` 文件后执行 `node --check`；预期无语法错误。

### Task 4: 添加通信页面视觉样式与响应式规则

**Files:**
- Create: `web/assets/css/communication.css`

- [ ] **Step 1: 定义工作台布局**

使用白色卡片、低圆角、蓝色主色和 8px 间距，桌面端采用 `communication-workspace` 两列布局，左侧列表与右侧定位面板高度一致。

- [ ] **Step 2: 定义定位画布**

用 CSS 网格和管廊区段线条构成静态示意图，定位点、方向线和状态色与呼叫状态一致，不引入外部地图依赖。

- [ ] **Step 3: 定义表格、徽标、空状态和抽屉触发器样式**

复用 `var(--primary)`、`var(--border)`、`var(--green)`、`var(--red)` 等已有变量，保持按钮、表格、标签和筛选项与监控页面一致。

- [ ] **Step 4: 添加窄屏规则**

在 980px 以下改为单列布局；在 640px 以下统计卡片单列、筛选项单列、表格横向滚动，确保无文字重叠。

### Task 5: 增加回归测试并验证

**Files:**
- Create: `tests/communication-system.test.mjs`

- [ ] **Step 1: 添加菜单断言**

读取 `app/config/menu.js`，断言包含 `communication-system`、链接指向 `communication/communication.html`，且其索引紧跟 `video-monitoring`。

- [ ] **Step 2: 添加页面结构断言**

读取通信页面，断言包含 `data-menu-key`、状态卡片、呼叫列表、定位画布、通话记录表、刷新按钮和抽屉脚本。

- [ ] **Step 3: 运行测试**

运行 `node --test tests/communication-system.test.mjs`，预期全部通过；再运行现有 `node --test tests/emergency-pages.test.mjs tests/data-storage-pages.test.mjs`，确认公共菜单和页面脚本未被破坏。

- [ ] **Step 4: 进行浏览器冒烟检查**

启动本地静态服务器打开 `web/pages/communication/communication.html`，确认菜单高亮、呼叫选中联动、筛选、详情抽屉、刷新提示和窄屏布局均可操作。

- [ ] **Step 5: 提交功能变更**

运行 `git add app/config/menu.js web/pages/communication/communication.html web/assets/css/communication.css tests/communication-system.test.mjs && git commit -m "feat: add communication system workspace"`。
