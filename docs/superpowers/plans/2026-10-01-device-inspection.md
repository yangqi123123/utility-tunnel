# Device Inspection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a high-fidelity, locally interactive device inspection module with Standard Works, Inspection Plans, and Inspection Tasks pages.

**Architecture:** Extend the existing static HTML admin shell. Add one menu branch, one inspection data module, one shared behavior module, one scoped stylesheet, and three thin page entry points. Keep all mutations in memory and reuse the existing sidebar, header, drawer, confirm, and toast APIs.

**Tech Stack:** Static HTML, vanilla JavaScript, existing TOB CSS tokens, Font Awesome, Node-based tests in `tests/`.

---

### Task 1: Add the menu branch and inspection data model

**Files:**
- Modify: `app/config/menu.js`
- Create: `app/data/inspection-data.js`
- Test: `tests/inspection-pages.test.mjs`

- [ ] **Step 1: Add the menu entry above emergency management**

Insert a new object before the existing `emergency` object:

```js
{
  key: "inspection",
  label: "设备巡检",
  icon: "fa-solid fa-clipboard-check",
  children: [
    { key: "inspection.standard-works", label: "标准作业", href: "../inspection/standard-works.html" },
    { key: "inspection.plans", label: "巡检计划", href: "../inspection/plans.html" },
    { key: "inspection.tasks", label: "巡检任务", href: "../inspection/tasks.html" },
  ],
},
```

- [ ] **Step 2: Add deterministic local fixture data**

Create `window.INSPECTION_DATA` with arrays named `standardWorks`, `inspectionItems`, `plans`, `tasks`, and `devices`. Include at least 8 standard works, 3 inspection items for the first work, 2 plans, 10 tasks, and 4 devices. Each object must include stable `id` values and the fields used by the spec tables and drawers.

- [ ] **Step 3: Add structural tests**

Create a Node test that reads `app/config/menu.js` and `app/data/inspection-data.js`, asserts the inspection key occurs before emergency, and asserts the fixture contains all five arrays.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/inspection-pages.test.mjs`

Expected: PASS after the menu and fixture are present.

- [ ] **Step 5: Commit**

```bash
git add app/config/menu.js app/data/inspection-data.js tests/inspection-pages.test.mjs
git commit -m "feat: add device inspection menu and fixtures"
```

### Task 2: Create the scoped inspection page stylesheet

**Files:**
- Create: `web/assets/css/inspection.css`

- [ ] **Step 1: Define page-level tokens and layout rules**

Add styles scoped to `.inspection-page` for the compact filter bar, page toolbar, tab strip, table wrapper, fixed action column, status tags, dropdown menu, empty state, detail grid, inspection item list, and large drawer tabs. Use the existing variables from `tob-ui.css`, 8px spacing, 2px/4px radii, and horizontal overflow for dense tables.

- [ ] **Step 2: Define responsive behavior**

At widths below 900px, make filter fields wrap, keep action buttons visible, and set `.inspection-table-wrap { overflow-x: auto; }`. Set the large task drawer width to `min(720px, 92vw)` and the normal form drawer width to `min(560px, 92vw)`.

- [ ] **Step 3: Verify stylesheet parses in the existing pages**

Run: `node --test tests/configuration-system.test.mjs`

Expected: PASS; no global CSS file is modified.

- [ ] **Step 4: Commit**

```bash
git add web/assets/css/inspection.css
git commit -m "feat: add inspection page styles"
```

### Task 3: Add the three HTML page entry points

**Files:**
- Create: `web/pages/inspection/standard-works.html`
- Create: `web/pages/inspection/plans.html`
- Create: `web/pages/inspection/tasks.html`
- Test: `tests/inspection-pages.test.mjs`

- [ ] **Step 1: Build the shared shell for each page**

Each document must include the Font Awesome stylesheet, `tob-ui.css`, `inspection.css`, an `.app-shell` with `#app-sidebar`, `#app-header`, and `.main`, and the scripts in this order: `menu.js`, `inspection-data.js`, `sidebar.js`, `header.js`, `drawer.js`, `inspection.js`.

- [ ] **Step 2: Build the standard works markup**

Use `data-menu-key="inspection.standard-works"`, a filter section for operation mode/device category/template name, segmented tabs, a toolbar with `新增` and utility buttons, and a table body target `#standardWorksBody` with pagination target `#standardWorksPagination`.

- [ ] **Step 3: Build the plans markup**

Use `data-menu-key="inspection.plans"`, filters for plan name/code/project, a toolbar with `新增`, and a table body target `#plansBody` with pagination target `#plansPagination`.

- [ ] **Step 4: Build the tasks markup**

Use `data-menu-key="inspection.tasks"`, filters for keyword/task code/plan name, a toolbar with `设为免扫码执行`, `删除`, refresh, fullscreen, and column settings controls, and a table body target `#tasksBody` with pagination target `#tasksPagination`.

- [ ] **Step 5: Add structural page tests**

Assert each page contains the correct `data-menu-key`, the expected Chinese page title, `inspection.css`, `inspection-data.js`, `inspection.js`, and the expected table body id.

- [ ] **Step 6: Run the focused test**

Run: `node --test tests/inspection-pages.test.mjs`

Expected: PASS for all three page documents.

- [ ] **Step 7: Commit**

```bash
git add web/pages/inspection tests/inspection-pages.test.mjs
git commit -m "feat: add inspection page shells"
```

### Task 4: Implement shared inspection rendering and interactions

**Files:**
- Create: `app/components/inspection.js`
- Modify: `web/assets/css/inspection.css` (only when a state needs a scoped style)

- [ ] **Step 1: Implement page detection and state**

Read `document.body.dataset.menuKey`, clone the relevant fixture array, and maintain `{ filters, page, pageSize: 10 }` per page. Escape all fixture values before inserting them into HTML.

- [ ] **Step 2: Implement standard works rendering**

Render the table, filters, pagination, and row action menu. Wire `新增`/`编辑` to a drawer with category, name, radio mode, and notes. Wire `详情` to a drawer with template metadata and items. Wire `作业配置` to a drawer with item rows and an item create/edit form. Confirm before delete and update the in-memory list.

- [ ] **Step 3: Implement plans rendering**

Render the plan table and pagination. Wire the add/edit drawer fields from the spec. Wire more-menu actions: toggle status, generate a task using the selected plan/device data, and confirm before delete. Refresh both plan and task state after generation.

- [ ] **Step 4: Implement tasks rendering**

Render task status, execution, result, overdue, and device/check-item tags. Wire batch selection and delete confirmation. Wire `设为免扫码执行` to update selected tasks' execution mode. Wire `详情` to a large drawer with the three tabs and their table/empty-state content.

- [ ] **Step 5: Implement shared feedback and utility actions**

Use `window.openAppDrawer`, `window.openAppConfirm`, and the existing message helper when available. Add refresh to rerender the active page, and make fullscreen/settings buttons show a concise confirmation message without changing global layout.

- [ ] **Step 6: Run existing and new tests**

Run: `node --test tests/inspection-pages.test.mjs tests/emergency-pages.test.mjs tests/configuration-system.test.mjs`

Expected: PASS with no changes to emergency or configuration behavior.

- [ ] **Step 7: Commit**

```bash
git add app/components/inspection.js web/assets/css/inspection.css
git commit -m "feat: add inspection interactions"
```

### Task 5: Browser verification and final regression check

**Files:**
- No new files; adjust only the inspection files if verification finds a defect.

- [ ] **Step 1: Start the static server**

Run the repository's existing local server command or serve the workspace root with a simple static server on an unused port.

- [ ] **Step 2: Verify the navigation path**

Open `web/pages/inspection/standard-works.html`, confirm the sidebar order and active state, then navigate to plans and tasks.

- [ ] **Step 3: Verify the interaction matrix**

Check filters/reset, pagination, standard works more menu, work-item configuration, plan status toggle, plan task generation, task batch execution-mode update, task deletion, and the three task-detail tabs.

- [ ] **Step 4: Verify layout at desktop and narrow widths**

Check a desktop viewport around 1440x900 and a narrow viewport around 390x844. Confirm no clipped labels, overlapping text, or inaccessible drawer footer buttons.

- [ ] **Step 5: Run the full regression suite**

Run: `node --test tests/*.test.mjs`

Expected: PASS for all tests.

- [ ] **Step 6: Commit any final fixes**

```bash
git add app/config/menu.js app/data/inspection-data.js app/components/inspection.js web/assets/css/inspection.css web/pages/inspection tests/inspection-pages.test.mjs
git commit -m "feat: complete device inspection prototype"
```

