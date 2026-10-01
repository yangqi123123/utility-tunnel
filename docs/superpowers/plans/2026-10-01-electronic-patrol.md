# 电子巡更列表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有管廊后台原型中新增“电子巡更”菜单及只读巡更记录列表页。

**Architecture:** 菜单在 `app/config/menu.js` 注册单页路由；`app/data/electronic-patrol.js` 暴露第三方记录 Mock 数据；`app/components/electronic-patrol.js` 负责筛选、表格渲染、详情抽屉和导出反馈；HTML 页面复用现有 TOB shell 与公共样式。

**Tech Stack:** 原生 HTML/CSS/JavaScript、现有 `tob-ui.css`、`monitoring.css`、`sidebar.js`、`header.js`、`drawer.js`、Node `node:test` 静态断言。

---

### Task 1: 注册电子巡更路由

**Files:**
- Modify: `app/config/menu.js`
- Modify: `app/components/sidebar.js`
- Test: `tests/electronic-patrol-pages.test.mjs`

- [ ] 在菜单配置中新增 `electronic-patrol` 一级菜单，链接到 `../monitoring/electronic-patrol.html`。
- [ ] 在侧栏图标映射中增加巡更图标路径，确保菜单在展开和收起状态都有稳定图标。
- [ ] 增加静态断言，验证菜单标签、菜单顺序和页面路由。

### Task 2: 建立第三方巡更数据适配层

**Files:**
- Create: `app/data/electronic-patrol.js`
- Test: `tests/electronic-patrol-store.test.mjs`

- [ ] 暴露 `window.ELECTRONIC_PATROL_STORE`，包含至少 8 条记录和 `records`、`getRecords()` 字段。
- [ ] 每条记录包含 `id/person/route/point/patrolAt/method/result/exception/source/syncedAt`，同时覆盖正常与异常结果。
- [ ] 让 `getRecords()` 返回新数组，避免筛选过程中修改原始数据。

### Task 3: 实现列表交互组件

**Files:**
- Create: `app/components/electronic-patrol.js`
- Modify: `web/assets/css/monitoring.css`
- Test: `tests/electronic-patrol-component.test.mjs`

- [ ] 实现 `renderRecords(list)`、`filterRecords(records, filters)`、`openPatrolDetail(record)`、`showExportFeedback()` 四个函数。
- [ ] 筛选按日期前缀、人员/点位关键字和结果精确匹配；重置清空所有字段并恢复全量列表。
- [ ] 详情使用 `window.openAppDrawer`，展示巡更时间、人员、路线、点位、方式、结果、异常说明、数据来源和同步时间。
- [ ] 增加表格横向滚动、状态颜色、详情信息栅格和移动端筛选样式。

### Task 4: 创建电子巡更页面

**Files:**
- Create: `web/pages/monitoring/electronic-patrol.html`
- Modify: `tests/electronic-patrol-pages.test.mjs`

- [ ] 复用 `app-shell`、`app-sidebar`、`app-header` 和 `screen-frame stack` 页面结构，设置 `data-menu-key="electronic-patrol"`。
- [ ] 添加巡更时间、人员、点位、结果筛选控件，以及重置、搜索和导出按钮。
- [ ] 添加表格容器 `recordBody`、计数 `recordCount`、分页区域和详情操作按钮。
- [ ] 按既有脚本顺序加载菜单、数据、侧栏、头部、抽屉、组件和需求标记脚本。

### Task 5: 验证页面与回归

**Files:**
- Test: `tests/electronic-patrol-*.test.mjs`

- [ ] 运行电子巡更相关 Node 测试，确认菜单、数据契约和组件函数全部通过。
- [ ] 启动静态服务器并检查页面加载、筛选、详情抽屉、导出反馈和菜单高亮。
- [ ] 在桌面和窄屏尺寸确认表格不重叠，抽屉不超出视口。
