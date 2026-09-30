# Corridor Project Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the project module to 管廊管理 and replace the single-project form with a functional project list plus reusable create, edit, detail, status, export, and map-location interactions.

**Architecture:** Keep the existing static HTML/CSS/JavaScript prototype architecture. The project page owns its mock records, filtering, rendering, and drawer form logic; shared shell, drawer, confirm, dictionary, and table styles continue to come from existing application components.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Font Awesome, existing `tob-ui.css`, `drawer.js`, menu/header/sidebar components.

---

### Task 1: Rename the primary navigation module

**Files:**
- Modify: `app/config/menu.js:10-18`

- [ ] **Step 1: Capture the current assertion**

Run:

```powershell
rg -n 'key: "project"|label: "项目管理"' app/config/menu.js
```

Expected: the primary `project` item and its first child are both labelled 项目管理.

- [ ] **Step 2: Change only the primary label**

Update the primary menu object to:

```javascript
{
  key: "project",
  label: "管廊管理",
  icon: "fa-solid fa-building",
  children: [
    { key: "project.manage", label: "项目管理", href: "../project/project-management.html" },
```

- [ ] **Step 3: Verify menu labels**

Run:

```powershell
rg -n 'label: "管廊管理"|key: "project.manage", label: "项目管理"' app/config/menu.js
```

Expected: one 管廊管理 primary label and one unchanged 项目管理 child label.

### Task 2: Rebuild the project page as a data list

**Files:**
- Modify: `web/pages/project/project-management.html`

- [ ] **Step 1: Replace the page body with established list-page structure**

Use the existing shell and create a filter card followed by a list card. The table header must be exactly:

```html
<tr>
  <th>项目编码</th><th>项目名称</th><th>项目类型</th><th>建设单位</th>
  <th>运营单位</th><th>所在区域</th><th>项目状态</th><th>管廊数量</th>
  <th>区段数量</th><th>设备数量</th><th>当前负责人</th><th>建设开始日期</th>
  <th>计划完工日期</th><th>最后更新时间</th><th>操作</th>
</tr>
```

Do not add 告警数量. Add keyword, type, and status filters, plus search, reset, and expand controls. Add 新增项目, refresh, fullscreen, and column-setting toolbar controls.

- [ ] **Step 2: Define complete mock records and escaping helpers**

Use records with this stable shape:

```javascript
const projects = [
  { id: 1, code: "PRJ-DH-001", name: "光谷科学岛综合管廊一期", shortName: "科学岛一期", type: "综合管廊", status: "建设中", region: "东湖高新区", addressRegion: "湖北省 / 武汉市", address: "东湖高新区科学岛大道", longitude: "114.447", latitude: "30.489", builder: "东湖高新区建设局", designer: "武汉市政设计研究院", constructor: "中建四局建设发展有限公司", supervisor: "武汉工程建设监理有限公司", operator: "光谷科学岛运维中心", owner: "张建国", phone: "13800001234", corridorCount: 2, sectionCount: 33, deviceCount: 286, startDate: "2023-03-01", plannedEndDate: "2026-12-31", actualEndDate: "", updatedAt: "2026-09-26 14:20", description: "服务科学岛片区的综合管廊工程。" },
  { id: 2, code: "PRJ-DH-002", name: "科学岛东区管廊延伸工程", shortName: "东区延伸工程", type: "综合管廊", status: "待完善", region: "东湖高新区", addressRegion: "湖北省 / 武汉市", address: "东湖高新区未来一路", longitude: "114.468", latitude: "30.501", builder: "东湖高新区建设局", designer: "武汉市政设计研究院", constructor: "中建四局建设发展有限公司", supervisor: "武汉工程建设监理有限公司", operator: "光谷科学岛运维中心", owner: "李涛", phone: "13900001234", corridorCount: 0, sectionCount: 0, deviceCount: 0, startDate: "2026-10-01", plannedEndDate: "2028-06-30", actualEndDate: "", updatedAt: "2026-09-22 09:10", description: "东区新增管廊建设项目。" }
];
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
```

- [ ] **Step 3: Implement rendering, filtering, reset, and refresh**

Create `renderRows(records)`, `applyFilters()`, and `resetFilters()` functions. Keyword matching checks both `code` and `name`; type and status are exact matches. Empty results render a single 15-column empty row. Update the count after every render.

- [ ] **Step 4: Verify list structure statically**

Run:

```powershell
rg -n "项目编码|最后更新时间|新增项目|告警数量|renderRows|applyFilters" web/pages/project/project-management.html
```

Expected: required headers and functions exist; `告警数量` returns no match.

### Task 3: Implement create, edit, detail, status, export, and location interactions

**Files:**
- Modify: `web/pages/project/project-management.html`

- [ ] **Step 1: Build one reusable drawer form**

Create `formBody(project)` containing exactly the approved fields. Address markup must preserve the existing composite controls:

```html
<label class="project-field full"><span class="form-label">项目地址</span>
  <span class="project-address"><select class="form-control" data-project-field="addressRegion"><option>湖北省 / 武汉市</option><option>福建省 / 厦门市</option></select><input class="form-control" data-project-field="address" placeholder="请输入详细地址"></span>
</label>
<label class="project-field full"><span class="form-label">经纬度</span>
  <span class="project-coordinates"><input class="form-control" data-project-field="longitude" placeholder="经度"><input class="form-control" data-project-field="latitude" placeholder="纬度"><button class="map-locate-btn" type="button" data-map-location title="地图定位" aria-label="地图定位"><i class="fa-solid fa-location-dot"></i></button></span>
</label>
```

Do not render a field labelled 行政区.

- [ ] **Step 2: Implement drawer modes and persistence**

Create `openProjectDrawer(mode, project)`, `readProjectForm()`, and `saveProject(mode, id)`. Detail mode renders the same approved information read-only. Create assigns the next numeric id and zero counts; edit preserves counts. Both update `updatedAt` and rerender the active filter result.

- [ ] **Step 3: Add map selection using the current component behavior**

Bind `[data-map-location]` to open the existing map-picker body. On confirmation, write `114.447` and `30.489` into the active form's longitude and latitude inputs and close the map drawer.

- [ ] **Step 4: Implement row actions**

Render actions as text buttons: 详情, 编辑, 停用/启用, 导出. Use `openAppConfirm` before changing status. Export opens a feedback drawer naming the selected project. Ensure event delegation resolves records by `data-project-id`.

- [ ] **Step 5: Validate required inputs before save**

Require project code, name, and type. If any are empty, add the existing `.error` class and show a concise validation message below the first invalid field; keep the drawer open. Successful validation closes the drawer and updates the table.

### Task 4: Align the page styling with the existing system

**Files:**
- Modify: `web/assets/css/project-management.css`

- [ ] **Step 1: Replace obsolete single-record styles with list styles**

Define page-local layout for `.project-filter-card`, `.project-list-card`, `.project-toolbar`, `.project-table`, `.project-drawer-grid`, `.project-address`, and `.project-coordinates`. Reuse CSS variables from `tob-ui.css`; use 2-4px radii, 8px-based gaps, 32px controls, white cards, and existing blue primary color.

- [ ] **Step 2: Preserve wide-table usability**

Set `.project-table { min-width: 1840px; }`, keep the existing `.table-wrap` horizontal scrolling, use nowrap for dates and action controls, and rely on `drawer.js` to mark the action column sticky.

- [ ] **Step 3: Size the complex form drawer and make it responsive**

Use:

```css
.project-page .drawer { width: min(880px, 92vw); }
.project-drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; }
@media (max-width: 760px) {
  .project-filter-grid, .project-drawer-grid { grid-template-columns: 1fr; }
  .project-field.full { grid-column: auto; }
}
```

- [ ] **Step 4: Run stylesheet checks**

Run:

```powershell
rg -n "project-tabs|project-actions|project-table|project-drawer-grid|project-coordinates" web/assets/css/project-management.css
```

Expected: obsolete single-project tabs/actions selectors are absent; list, drawer, and coordinate selectors exist.

### Task 5: Browser acceptance and regression verification

**Files:**
- Verify: `app/config/menu.js`
- Verify: `web/pages/project/project-management.html`
- Verify: `web/assets/css/project-management.css`

- [ ] **Step 1: Start a local server**

Run:

```powershell
python -m http.server 4173
```

Expected: server listens on `http://localhost:4173`.

- [ ] **Step 2: Verify the desktop list page**

Open `http://localhost:4173/web/pages/project/project-management.html` at 1440x900. Confirm primary menu says 管廊管理, child says 项目管理, all 15 columns are available through horizontal scroll, and no 告警数量 column exists.

- [ ] **Step 3: Exercise interactions**

Verify search and reset, create, detail, edit, map location, disable/enable confirmation, export feedback, refresh, and empty filter results. Confirm create/edit fields include 经纬度 and do not include 行政区.

- [ ] **Step 4: Verify responsive layouts**

Check 1024x768 and 390x844. Confirm controls do not overlap, the table scrolls horizontally, drawer content scrolls vertically, and button labels remain visible.

- [ ] **Step 5: Run final source checks**

Run:

```powershell
git diff --check
rg -n "告警数量|>行政区<" web/pages/project/project-management.html
```

Expected: `git diff --check` is clean and prohibited labels return no matches.
