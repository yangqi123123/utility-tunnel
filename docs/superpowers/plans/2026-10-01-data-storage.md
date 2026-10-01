# 数据存储 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有管廊后台原型中新增“数据存储”菜单及实时数据、历史数据、历史归档配置三个可交互静态页面。

**Architecture:** 使用三个独立 HTML 页面复用现有 app shell；`app/data/data-storage.js` 提供只读 mock 数据和可重置配置，`app/components/data-storage.js` 负责列表筛选、详情抽屉、Tab、指标卡片和归档配置交互。页面通过 `data-storage-mode` 选择渲染分支，不修改后端或现有设备管理页面。

**Tech Stack:** 原生 HTML/CSS/JavaScript、现有 `tob-ui.css`、`sidebar.js`、`header.js`、`drawer.js`、Node `node:test` 静态断言。

---

### Task 1: 注册数据存储菜单路由

**Files:**
- Modify: `app/config/menu.js`
- Modify: `app/components/sidebar.js` only if the new key needs a custom icon
- Test: `tests/data-storage-pages.test.mjs`

- [ ] **Step 1: Write the failing route assertions**

```js
test("menu exposes data storage with three child routes", async () => {
  const source = await read("app/config/menu.js");
  assert.match(source, /key:\s*["']data-storage["'][\s\S]*label:\s*["']数据存储["']/);
  for (const key of ["realtime", "history", "archive-config"]) {
    assert.match(source, new RegExp(`data-storage\\.${key}`));
  }
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/data-storage-pages.test.mjs`
Expected: FAIL because `data-storage` is absent from `app/config/menu.js`.

- [ ] **Step 3: Add the menu entry**

Insert after the existing `service-center` item in `app/config/menu.js`:

```js
{
  key: "data-storage",
  label: "数据存储",
  icon: "fa-solid fa-database",
  children: [
    { key: "data-storage.realtime", label: "实时数据", href: "../data-storage/realtime.html" },
    { key: "data-storage.history", label: "历史数据", href: "../data-storage/history.html" },
    { key: "data-storage.archive-config", label: "历史归档配置", href: "../data-storage/archive-config.html" },
  ],
},
```

Add an inline database icon path to `navIcons` in `app/components/sidebar.js` only if the fallback icon does not meet the existing icon convention:

```js
"data-storage": '<ellipse cx="12" cy="5" rx="7" ry="3"></ellipse><path d="M5 5v7c0 1.66 3.13 3 7 3s7-1.34 7-3V5"></path><path d="M5 12v7c0 1.66 3.13 3 7 3s7-1.34 7-3v-7"></path>',
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/data-storage-pages.test.mjs`
Expected: the menu route assertion passes; page assertions remain skipped or fail until later tasks add the pages.

- [ ] **Step 5: Commit**

```bash
git add app/config/menu.js app/components/sidebar.js tests/data-storage-pages.test.mjs
git commit -m "feat: add data storage navigation"
```

### Task 2: Add the mock data contract

**Files:**
- Create: `app/data/data-storage.js`
- Test: `tests/data-storage-store.test.mjs`

- [ ] **Step 1: Write the failing data contract test**

```js
test("data storage store exposes systems, devices, readings, and archive defaults", () => {
  const store = loadStore();
  assert.ok(store.systems.length >= 3);
  assert.ok(store.devices.every((device) => device.systemId && device.metrics?.length));
  assert.ok(store.historyReadings.every((item) => item.deviceId && item.metric && item.reportedAt));
  assert.equal(store.archiveConfig.retentionDays, 365);
  assert.equal(typeof store.resetArchiveConfig, "function");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/data-storage-store.test.mjs`
Expected: FAIL because `app/data/data-storage.js` does not exist.

- [ ] **Step 3: Implement the store**

Expose `window.DATA_STORAGE_STORE` from an IIFE with these stable fields:

```js
window.DATA_STORAGE_STORE = {
  systems: [{ id: "env", name: "环境监测" }, { id: "power", name: "电力运行监测平台" }, { id: "fire", name: "消防监控系统" }],
  devices: [{ id, name, code, systemId, type, project, location, status, latestReportedAt, info, files, metrics }],
  historyReadings: [{ id, deviceId, metric, value, unit, reportedAt, quality, source, rawPayload }],
  archiveConfig: { enabled: true, retentionDays: 365, retentionUnit: "天", schedule: "每天", executeAt: "02:00", cron: "0 0 2 * * ?", retryTimes: 3 },
  archiveTasks: [{ id, name, schedule, lastRunAt, result, nextRunAt }],
  resetArchiveConfig() { this.archiveConfig = { ...defaultArchiveConfig }; },
};
```

Use at least four devices across three systems, at least two metrics per device, and at least three historical readings per metric so list, card, date filtering, and empty states can be exercised.

- [ ] **Step 4: Run the store test and verify it passes**

Run: `node --test tests/data-storage-store.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/data/data-storage.js tests/data-storage-store.test.mjs
git commit -m "feat: add data storage mock store"
```

### Task 3: Build the shared data-storage component

**Files:**
- Create: `app/components/data-storage.js`
- Modify: `web/assets/css/tob-ui.css` only for shared data-storage classes that cannot be scoped in page styles
- Test: `tests/data-storage-component.test.mjs`

- [ ] **Step 1: Write the failing component contract test**

```js
test("component source contains the shared rendering and validation contract", async () => {
  const source = await read("app/components/data-storage.js");
  for (const name of ["renderDeviceRows", "openDeviceDetail", "renderRealtimeMetrics", "renderHistoryRows", "validateHistoryRange", "saveArchiveConfig"]) {
    assert.match(source, new RegExp(`function\\s+${name}`));
  }
  assert.match(source, /data-detail-tab/);
  assert.match(source, /data-metric-detail|data-reading-detail/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/data-storage-component.test.mjs`
Expected: FAIL because the component file is missing.

- [ ] **Step 3: Implement shared component functions**

Implement these functions with the exact contracts used by the pages:

```js
function renderDeviceRows(devices, mode) {}
function openDeviceDetail(deviceId, mode) {}
function renderRealtimeMetrics(device) {}
function renderHistoryRows(deviceId, range) {}
function validateHistoryRange(start, end) { return !start || !end || start <= end; }
function saveArchiveConfig(values) {}
```

`openDeviceDetail` must call `window.openAppDrawer({ title, body, footer })`, render three buttons with `data-detail-tab="info|data|files"`, and switch panels without navigating away. Realtime data uses cards with `data-metric-detail`; history data uses rows with `data-reading-detail`. Use `window.openAppConfirm` for invalid date range and invalid archive retention values. Keep all text escaped through a local `escapeHtml` helper.

- [ ] **Step 4: Run the component test and verify it passes**

Run: `node --test tests/data-storage-component.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/data-storage.js web/assets/css/tob-ui.css tests/data-storage-component.test.mjs
git commit -m "feat: add shared data storage interactions"
```

### Task 4: Add the three data storage pages

**Files:**
- Create: `web/pages/data-storage/realtime.html`
- Create: `web/pages/data-storage/history.html`
- Create: `web/pages/data-storage/archive-config.html`
- Modify: `tests/data-storage-pages.test.mjs`

- [ ] **Step 1: Add page shell and failing page assertions**

Each page must include the shared shell and scripts:

```html
<div class="app-shell"><aside id="app-sidebar" class="sidebar"></aside><header id="app-header" class="header"></header><main class="main">...</main></div>
<script src="../../../app/config/menu.js"></script>
<script src="../../../app/data/data-storage.js"></script>
<script src="../../../app/components/sidebar.js"></script>
<script src="../../../app/components/header.js"></script>
<script src="../../../app/components/drawer.js"></script>
<script src="../../../app/components/data-storage.js"></script>
```

Add page assertions for `data-menu-key`, `data-storage-mode`, `data-system-filter`, `deviceTable`, and the archive fields `retentionDays`, `schedule`, `executeAt`, `retryTimes`.

- [ ] **Step 2: Run page assertions and verify they fail**

Run: `node --test tests/data-storage-pages.test.mjs`
Expected: FAIL because the three HTML files do not exist.

- [ ] **Step 3: Implement `realtime.html`**

Use `data-storage-mode="realtime"`, a system select, keyword/status filters, a table body with `id="deviceTable"`, and a card grid container rendered by `data-storage.js`. Include a live update badge with static “最近更新” text and an empty state row.

- [ ] **Step 4: Implement `history.html`**

Use `data-storage-mode="history"`, the same device table structure, plus `<input type="datetime-local" data-history-start>` and `<input type="datetime-local" data-history-end>`. Ensure the query button calls `validateHistoryRange` before rendering.

- [ ] **Step 5: Implement `archive-config.html`**

Use `data-storage-mode="archive"` and fields `[data-archive-field="enabled|retentionDays|retentionUnit|schedule|executeAt|cron|retryTimes"]`; add buttons with `data-archive-action="save|reset|run"` and a task table body `id="archiveTaskTable"`.

- [ ] **Step 6: Add scoped styles**

Use each page’s `<style>` block for layout-specific rules: realtime metric cards should use `grid-template-columns:repeat(3,minmax(220px,1fr))`; history table should have a `min-width` and horizontal scrolling; archive form should collapse to one column below 760px. Keep card radius at the existing `var(--radius-md)` and use existing primary/status variables.

- [ ] **Step 7: Run page assertions and verify they pass**

Run: `node --test tests/data-storage-pages.test.mjs`
Expected: PASS for all menu and page contract assertions.

- [ ] **Step 8: Commit**

```bash
git add web/pages/data-storage tests/data-storage-pages.test.mjs
git commit -m "feat: add data storage pages"
```

### Task 5: Run end-to-end checks and visual QA

**Files:**
- Modify: `tests/data-storage-pages.test.mjs` only if assertions need to reflect the final DOM contract
- Create: `tests/data-storage-browser.mjs` if browser automation is available in the repository

- [ ] **Step 1: Run all focused Node tests**

Run: `node --test tests/data-storage-pages.test.mjs tests/data-storage-store.test.mjs tests/data-storage-component.test.mjs`
Expected: PASS with no unhandled exceptions.

- [ ] **Step 2: Serve the static workspace**

Run: `npx --yes http-server . -p 4173`
Expected: server listening at `http://127.0.0.1:4173`.

- [ ] **Step 3: Verify the three routes in a browser**

Open:

```text
http://127.0.0.1:4173/web/pages/data-storage/realtime.html
http://127.0.0.1:4173/web/pages/data-storage/history.html
http://127.0.0.1:4173/web/pages/data-storage/archive-config.html
```

Check: menu expansion, system switching, empty-result state, realtime metric card detail, history date validation, device detail Tabs, file list, archive save/reset/run feedback, and browser back/forward URL behavior.

- [ ] **Step 4: Check responsive layout**

At 1440px and 768px widths verify the table scrolls instead of overlapping, metric cards wrap, the drawer remains within the viewport, and archive fields remain readable.

- [ ] **Step 5: Commit test updates if needed**

```bash
git add tests
git commit -m "test: verify data storage workflows"
```
