# 管廊管理页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将项目管理中的楼栋管理原型替换为符合截图的管廊管理页面。

**Architecture:** 保留现有单页 HTML、内嵌本地数据和 `openAppDrawer/openAppConfirm` 交互，仅替换页面配置、表格渲染、抽屉字段和筛选逻辑。同步更新菜单与需求说明中的页面描述。

**Tech Stack:** HTML、原生 JavaScript、现有 `tob-ui.css`、`building-management.css`、Font Awesome。

---

### Task 1: Replace page identity and list UI

**Files:**
- Modify: `web/pages/project/building.html`
- Modify: `app/config/menu.js`

- [ ] 将 title、`data-menu-key`、`data-page-title`、筛选标签、列表标题和表格 aria-label 改为管廊管理。
- [ ] 将筛选项改为关键词、管廊类型、运行状态，并保留搜索/重置/展开交互。
- [ ] 将表头、示例数据和 `renderRows` 改为设计文档中的 13 个业务字段。
- [ ] 操作列仅渲染详情、编辑、删除。
- [ ] 更新菜单显示名称和页面键对应的标题，保持下游楼层页面链接不受影响。

### Task 2: Replace drawer and deletion behavior

**Files:**
- Modify: `web/pages/project/building.html`

- [ ] 将详情字段改为管廊字段并沿用现有状态 tag。
- [ ] 将新增/编辑表单改为双列管廊字段，使用截图中的必填标记、选择框、日期输入和备注文本域。
- [ ] 将抽屉标题、副标题和导出提示改为管廊管理。
- [ ] 删除确认文案改为管廊；移除楼层/房源关联阻断逻辑，使用本地记录删除。

### Task 3: Update requirement metadata and verify

**Files:**
- Modify: `app/components/requirement.js`

- [ ] 将 `project.building` 的页面描述、筛选字段、抽屉字段、列表字段和状态流转改为管廊管理语义。
- [ ] 搜索残留的“楼栋管理”页面专属文案，确认只保留楼层/房源关联所需的楼栋引用。
- [ ] 使用浏览器打开 `web/pages/project/building.html`，检查页面标题、字段、操作列和抽屉；确认控制台无脚本错误。
- [ ] 运行 `git diff --check`，提交实现变更。
