# 入侵报警系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在视频监控菜单下新增入侵报警系统页面，展示第三方入侵信号列表、入侵位置和设备状态。

**Architecture:** 新增独立 HTML 页面和页面专属 CSS，页面复用公共 app-shell、侧栏、顶部栏和 drawer。第三方数据以页面内适配器 mock 返回，筛选、选中、刷新和详情均在前端完成；未来替换适配器即可接入真实接口。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Node `node:test`、现有 `tob-ui.css` 与公共组件。

---

### Task 1: 添加菜单入口与页面结构测试

**Files:**
- Modify: `app/config/menu.js`
- Create: `tests/intrusion-alarm-pages.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const menu = fs.readFileSync("app/config/menu.js", "utf8");
const page = fs.existsSync("web/pages/monitoring/intrusion-alarm.html")
  ? fs.readFileSync("web/pages/monitoring/intrusion-alarm.html", "utf8")
  : "";

test("视频监控下方提供入侵报警系统一级菜单", () => {
  assert.match(menu, /key: "video-monitoring"/);
  assert.match(menu, /key: "intrusion-alarm"/);
  assert.match(menu, /label: "入侵报警系统"/);
  assert.match(menu, /\.\.\/monitoring\/intrusion-alarm\.html/);
});

test("入侵报警页面使用共享壳层并包含核心字段", () => {
  assert.match(page, /class="app-shell"/);
  assert.match(page, /data-menu-key="intrusion-alarm"/);
  for (const field of ["报警事件", "报警主机ID", "报警类型", "报警级别", "报警时间", "入侵位置", "设备状态"]) {
    assert.match(page, new RegExp(field));
  }
  assert.match(page, /openAppDrawer/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/intrusion-alarm-pages.test.mjs`

Expected: FAIL because the menu route and page do not exist yet.

- [ ] **Step 3: Add the top-level menu item**

Insert immediately after the `video-monitoring` object in `app/config/menu.js`:

```js
{
  key: "intrusion-alarm",
  label: "入侵报警系统",
  icon: "fa-solid fa-shield-halved",
  href: "../monitoring/intrusion-alarm.html",
},
```

- [ ] **Step 4: Run the test again**

Run: `node --test tests/intrusion-alarm-pages.test.mjs`

Expected: FAIL only on page assertions.

- [ ] **Step 5: Commit the navigation and test scaffold**

```bash
git add app/config/menu.js tests/intrusion-alarm-pages.test.mjs
git commit -m "feat: add intrusion alarm navigation route"
```

### Task 2: Build the third-party list and detail workspace

**Files:**
- Create: `web/pages/monitoring/intrusion-alarm.html`

- [ ] **Step 1: Add shared shell and toolbar markup**

Create the standard app shell with `data-menu-key="intrusion-alarm"`, shared CSS/component scripts, and a page header containing the data-source label, last-sync timestamp, and a refresh button with `data-action="refresh"`.

- [ ] **Step 2: Add filter and summary markup**

Add four summary values with IDs `alarmTotal`, `criticalTotal`, `onlineTotal`, and `offlineTotal`. Add filter controls with `data-filter` values `event`, `hostId`, `type`, `level`, `time`, and `status`, plus `data-action="search"` and `data-action="reset"` buttons.

- [ ] **Step 3: Add list and detail markup**

Add a horizontally scrollable table with `id="intrusionTableBody"`; render columns for event, host ID, type, level, time, location, device status, handling status, and a detail button. Add a right detail panel with IDs `selectedEventTitle`, `selectedLocation`, `selectedDeviceStatus`, `selectedTimeline`, and `locationCanvas`.

- [ ] **Step 4: Add the mock adapter and rendering functions**

Define an `intrusionEvents` array using the spec model and implement these functions in the page script:

```js
function getIntrusionEvents() {
  return intrusionEvents.map((item) => ({ ...item, location: { ...item.location }, device: { ...item.device } }));
}

function filterIntrusionEvents(list, filters) {
  return list.filter((item) =>
    (!filters.event || item.event.includes(filters.event)) &&
    (!filters.hostId || item.hostId === filters.hostId) &&
    (!filters.type || item.type === filters.type) &&
    (!filters.level || item.level === filters.level) &&
    (!filters.time || item.time.startsWith(filters.time)) &&
    (!filters.status || item.status === filters.status)
  );
}

function renderIntrusionList(list) {
  const body = document.getElementById("intrusionTableBody");
  body.innerHTML = list.length ? list.map((item) => rowMarkup(item)).join("") : emptyRowMarkup();
  body.querySelectorAll("[data-intrusion-id]").forEach((row) => {
    row.addEventListener("click", () => {
      selectedId = row.dataset.intrusionId;
      renderIntrusionList(currentList);
      renderDetail(currentList.find((item) => String(item.id) === selectedId));
    });
  });
}

function renderSummary(list) {
  document.getElementById("alarmTotal").textContent = list.length;
  document.getElementById("criticalTotal").textContent = list.filter((item) => item.level === "一级").length;
  document.getElementById("onlineTotal").textContent = list.filter((item) => item.device.status === "在线").length;
  document.getElementById("offlineTotal").textContent = list.filter((item) => item.device.status !== "在线").length;
}

function renderDetail(item) {
  if (!item) return;
  document.getElementById("selectedEventTitle").textContent = item.event;
  document.getElementById("selectedLocation").textContent = [item.location.corridor, item.location.cabin, item.location.section || "待定位", item.location.zone || "待定位"].join(" / ");
  document.getElementById("selectedDeviceStatus").textContent = `${item.device.name} · ${item.device.status}`;
  document.getElementById("selectedTimeline").innerHTML = item.timeline.map((entry) => `<li><strong>${entry.time}</strong><span>${entry.label}</span></li>`).join("");
}
```

Keep the adapter read-only: no add/edit/delete/control action is allowed.

- [ ] **Step 5: Add interactions and credible states**

Wire row click to `renderDetail`, detail buttons to `window.openAppDrawer`, search/reset to the filter functions, and refresh to update the sync timestamp. Render a no-results row when filtering returns no items; render `待定位` when `location.section` or `location.zone` is absent; show a sync error banner while preserving the previous list when the adapter throws.

- [ ] **Step 6: Run page tests**

Run: `node --test tests/intrusion-alarm-pages.test.mjs`

Expected: PASS for the shell, route, filters, table fields, detail panel, and drawer hook.

### Task 3: Add page-specific TOB styling and responsive behavior

**Files:**
- Create: `web/assets/css/intrusion-alarm.css`
- Modify: `web/pages/monitoring/intrusion-alarm.html`

- [ ] **Step 1: Add layout tokens and desktop layout**

Style `.intrusion-workspace` as a two-column grid, with the table workspace using white low-radius panels and `.intrusion-detail` as the fixed-width right column. Use existing TOB variables, 8px spacing, table row height near 56px, status colors, and a compact location schematic.

- [ ] **Step 2: Add list, status, and empty/error states**

Style selected rows, `.intrusion-level--critical|major|minor`, `.intrusion-device--online|offline|fault`, `.intrusion-empty`, and `.intrusion-sync-error`. Ensure status is communicated by both text and color.

- [ ] **Step 3: Add narrow-screen rules**

At `max-width: 980px`, collapse the workspace to one column and place the detail panel below the list. Keep the table horizontally scrollable and constrain the detail schematic so labels do not overlap.

- [ ] **Step 4: Run the existing and new tests**

Run: `node --test tests/intrusion-alarm-pages.test.mjs tests/configuration-system.test.mjs tests/data-storage-pages.test.mjs`

Expected: PASS with no changes to unrelated pages.

### Task 4: Browser verification and final commit

**Files:**
- Modify: `tests/intrusion-alarm-pages.test.mjs` only if an observed markup contract needs a stable assertion.

- [ ] **Step 1: Start a static server**

Run: `python -m http.server 4173` from the repository root.

- [ ] **Step 2: Verify the page in a browser**

Open `http://127.0.0.1:4173/web/pages/monitoring/intrusion-alarm.html` and verify menu order, default selected event, filter/reset, row selection, refresh timestamp, detail drawer, offline state, and no-result state.

- [ ] **Step 3: Verify responsive layout**

Check a desktop viewport around 1440px wide and a narrow viewport around 768px wide. Confirm no clipped labels, overlapping text, or inaccessible table columns.

- [ ] **Step 4: Commit the implementation**

```bash
git add app/config/menu.js web/pages/monitoring/intrusion-alarm.html web/assets/css/intrusion-alarm.css tests/intrusion-alarm-pages.test.mjs
git commit -m "feat: add intrusion alarm system workspace"
```
