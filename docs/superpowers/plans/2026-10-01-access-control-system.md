# 门禁系统人员通行记录 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在视频监控菜单后新增门禁系统入口，并提供第三方人员通行记录的只读列表页面。

**Architecture:** 复用现有 `monitoring-page` 页面壳、`monitoring.css` 表格样式和 `drawer.js` 抽屉能力。菜单通过 `app/config/menu.js` 配置，页面数据在单页脚本中以 mock 形式模拟第三方结果，筛选和详情均在浏览器内完成。

**Tech Stack:** 原生 HTML、CSS、JavaScript、Node.js 内置 `node:test`。

---

### Task 1: Add regression coverage for the new route

**Files:**
- Create: `tests/access-control-system.test.mjs`

- [ ] **Step 1: Add menu and page contract tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("menu exposes access control directly below video monitoring", async () => {
  const source = await read("app/config/menu.js");
  assert.match(source, /key:\s*["']video-monitoring["'][\s\S]*?key:\s*["']access-control["'][\s\S]*?key:\s*["']communication-system["']/);
  assert.match(source, /label:\s*["']门禁系统["']/);
  assert.match(source, /\.\.\/monitoring\/access-control\.html/);
});

test("access control page exposes the shared read-only record table", async () => {
  const source = await read("web/pages/monitoring/access-control.html");
  assert.match(source, /class="app-shell"/);
  assert.match(source, /data-menu-key="access-control"/);
  for (const field of ["date", "result"]) assert.match(source, new RegExp(`data-filter="${field}"`));
  for (const heading of ["序号", "姓名", "通行方式", "门禁设备", "通行位置", "通行时间", "通行方向", "通行结果"]) assert.match(source, new RegExp(heading));
  assert.match(source, /id="recordBody"/);
  assert.match(source, /data-action="export"/);
  assert.match(source, /data-view-photo/);
});
```

- [ ] **Step 2: Run the focused test to verify it fails before implementation**

Run: `node --test tests/access-control-system.test.mjs`

Expected: FAIL because the menu route and page do not exist yet.

### Task 2: Register the menu item and implement the page

**Files:**
- Modify: `app/config/menu.js`
- Modify: `app/components/sidebar.js`
- Create: `web/pages/monitoring/access-control.html`

- [ ] **Step 1: Register the top-level route**

Insert an `access-control` item immediately after the `video-monitoring` menu block and before `communication-system`:

```js
{
  key: "access-control",
  label: "门禁系统",
  icon: "fa-solid fa-id-card-clip",
  href: "../monitoring/access-control.html",
},
```

- [ ] **Step 2: Add a dedicated sidebar icon path**

Add an `access-control` SVG path to `navIcons` in `app/components/sidebar.js` so the new route uses the same line-icon family as the rest of the main navigation.

- [ ] **Step 3: Create the shared-shell access control page**

Build the page with the existing styles and scripts. The page must include:

```html
<body class="monitoring-page access-control-page" data-menu-key="access-control" data-page-section="门禁系统" data-page-title="门禁系统">
  <section class="card monitoring-filter-card pedestrian-filter-card">
    <div class="filter-actions">
      <label class="form-field"><span class="form-label">通行时间</span><input class="form-control" type="date" data-filter="date"></label>
      <label class="form-field"><span class="form-label">通行结果</span><select class="form-control" data-filter="result"><option value="">全部</option><option>成功</option><option>失败</option></select></label>
      <button class="btn btn-secondary" type="button" data-action="reset">重置</button>
      <button class="btn btn-primary" type="button" data-action="search">搜索</button>
    </div>
  </section>
  <section class="card monitoring-list-card">
    <div class="card-title-row monitoring-toolbar"><h1 class="card-title">门禁系统</h1><button class="btn btn-secondary" type="button" data-action="export"><i class="fa-solid fa-download"></i> 导出</button></div>
    <div class="table-wrap"><table class="table monitoring-table"><thead><tr><th>序号</th><th>姓名</th><th>通行方式</th><th>门禁设备</th><th>通行位置</th><th>通行时间</th><th>通行方向</th><th>通行结果</th><th>操作</th></tr></thead><tbody id="recordBody"></tbody></table></div>
    <div class="pagination"><span>共 <strong id="recordCount">0</strong> 条，每页 10 条</span><span class="page-item active">1</span></div>
  </section>
</body>
```

Use eight records copied from the existing pedestrian-record mock shape, render escaped text, filter by date/result, and reuse `window.openAppDrawer` for export feedback and read-only photo metadata.

- [ ] **Step 4: Run the focused test after implementation**

Run: `node --test tests/access-control-system.test.mjs`

Expected: PASS with 2 tests.

### Task 3: Run the broader regression checks

**Files:**
- Test: `tests/access-control-system.test.mjs`

- [ ] **Step 1: Run all repository tests**

Run: `node --test tests/*.test.mjs`

Expected: existing tests and the new access-control tests pass; unrelated pre-existing dirty-worktree changes are not modified.

- [ ] **Step 2: Perform a static route and layout smoke check**

Run: `rg -n "access-control|门禁系统|recordBody|通行结果" app/config/menu.js app/components/sidebar.js web/pages/monitoring/access-control.html tests/access-control-system.test.mjs`

Expected: the new key, label, route, icon, page metadata, table body, and filter hooks are all present.

- [ ] **Step 3: Commit only the feature files**

```bash
git add app/config/menu.js app/components/sidebar.js web/pages/monitoring/access-control.html tests/access-control-system.test.mjs
git commit -m "feat: add access control passage records"
```
