# 管线管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在管廊管理菜单下新增管线管理列表页，复用现有蓝色轻量后台、表格和右侧抽屉交互。

**Architecture:** 在 `app/config/menu.js` 增加同级二级路由；新建 `web/pages/project/pipeline.html`，页面使用现有 `tob-ui.css`、侧栏、头部和抽屉组件，静态数组驱动筛选、增删改查。

**Tech Stack:** HTML、CSS、原生 JavaScript、现有 `tob-ui.css` 与 `openAppDrawer/openAppConfirm`。

---

### Task 1: 菜单路由

**Files:**
- Modify: `app/config/menu.js`

- [ ] 在 `project.children` 中添加 `{ key: "project.pipeline", label: "管线管理", href: "../project/pipeline.html" }`。

### Task 2: 管线列表页

**Files:**
- Create: `web/pages/project/pipeline.html`

- [ ] 创建标准 app-shell，加入关键词、分类、状态筛选，工具栏新增管线按钮和刷新按钮。
- [ ] 用静态数据渲染截图字段：编码、名称、类型、所属管廊、所属舱室、起始/结束区段、管径、材质、长度、权属单位、状态、投运日期、操作。
- [ ] 实现搜索、重置、详情、编辑、删除及新增；详情为只读信息抽屉，新增/编辑为表单抽屉，删除使用确认弹窗。
- [ ] 抽屉字段覆盖截图：管线编码、名称、类型、介质类型、权属单位、运营单位、所属管廊、起点、终点、起始区段、结束区段、管径、壁厚、材质、设计压力、运行压力、设计温度、埋设或安装方式、长度、维保单位、联系人、状态、备注。

### Task 3: 验证

**Files:**
- Test: `web/pages/project/pipeline.html` in browser

- [ ] 启动本地静态服务，验证菜单跳转、筛选结果、抽屉滚动、编辑/删除后表格更新。
- [ ] 检查窄屏下抽屉宽度和表格横向滚动，确保无文字重叠。
