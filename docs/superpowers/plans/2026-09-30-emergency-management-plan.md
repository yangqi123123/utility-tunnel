# Emergency Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete emergency-management module with four persistent base-data pages, a full-map dispatch console, offline Tianditu tile support, and event-linked communication records.

**Architecture:** Add one shared browser-side emergency store backed by `localStorage`, with focused page controllers for personnel, resources, plans, events, dispatch, and calls. All pages reuse the existing application shell and drawer component; dispatch uses a locally vendored Leaflet runtime behind a small map adapter so missing offline tiles can fall back to a schematic basemap without changing business interactions.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, browser `localStorage`, Leaflet 1.9.4, Node.js built-in test runner, Playwright browser verification.

---

## File Map

### Shared navigation and data

- Modify `app/config/menu.js`: register the new top-level menu and six child routes.
- Modify `app/components/sidebar.js`: add the emergency-management navigation icon.
- Create `app/data/emergency-data.js`: seed data, persistence, IDs, CRUD, event timelines, call logging, and reset support.
- Create `app/components/emergency-common.js`: escaping, status tags, toast feedback, filters, pagination, drawer helpers, and cross-page navigation.

### Feature pages

- Create `web/pages/emergency/personnel.html` and `app/components/emergency-personnel.js`.
- Create `web/pages/emergency/resources.html` and `app/components/emergency-resources.js`.
- Create `web/pages/emergency/plans.html` and `app/components/emergency-plans.js`.
- Create `web/pages/emergency/events.html` and `app/components/emergency-events.js`.
- Create `web/pages/emergency/dispatch.html`, `app/components/emergency-map.js`, and `app/components/emergency-dispatch.js`.
- Create `web/pages/emergency/calls.html` and `app/components/emergency-calls.js`.
- Create `web/assets/css/emergency.css`: styles shared by all six emergency pages.

### Offline map runtime and test coverage

- Create `web/assets/vendor/leaflet/leaflet.js`, `leaflet.css`, and `images/*` from Leaflet 1.9.4.
- Create `web/assets/maps/tianditu/README.md`: exact expected tile paths and fallback behavior.
- Create `tests/emergency-store.test.mjs`: storage and cross-entity behavior.
- Create `tests/emergency-pages.test.mjs`: menu, page shell, script loading, and required UI contract checks.
- Create `tests/emergency-browser.mjs`: browser workflow checks for CRUD, dispatch, and call logging.

## Task 1: Add Contract Tests for Navigation and Page Shells

**Files:**
- Create: `tests/emergency-pages.test.mjs`
- Modify: `app/config/menu.js`
- Modify: `app/components/sidebar.js`

- [ ] **Step 1: Write failing navigation and page-contract tests**

Use Node's built-in test runner and filesystem assertions:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pages = ["dispatch", "events", "plans", "resources", "personnel", "calls"];

test("menu exposes emergency management as a top-level item", async () => {
  const source = await read("app/config/menu.js");
  assert.match(source, /key:\s*"emergency"[\s\S]*label:\s*"应急管理"/);
  for (const page of pages) assert.match(source, new RegExp(`emergency\\.${page}`));
});

for (const page of pages) {
  test(`${page} page uses the shared app shell`, async () => {
    const source = await read(`web/pages/emergency/${page}.html`);
    assert.match(source, /class="app-shell"/);
    assert.match(source, new RegExp(`data-menu-key="emergency\\.${page}"`));
    assert.match(source, /emergency-data\.js/);
    assert.match(source, /emergency-common\.js/);
  });
}
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/emergency-pages.test.mjs`

Expected: FAIL because `emergency` menu items and page files do not exist.

- [ ] **Step 3: Add the emergency menu and icon**

Insert after `smart-monitoring` in `app/config/menu.js`:

```js
{
  key: "emergency",
  label: "应急管理",
  icon: "fa-solid fa-truck-medical",
  children: [
    { key: "emergency.dispatch", label: "应急调度台", href: "../emergency/dispatch.html" },
    { key: "emergency.events", label: "应急事件", href: "../emergency/events.html" },
    { key: "emergency.plans", label: "应急预案", href: "../emergency/plans.html" },
    { key: "emergency.resources", label: "应急物资", href: "../emergency/resources.html" },
    { key: "emergency.personnel", label: "应急人员", href: "../emergency/personnel.html" },
    { key: "emergency.calls", label: "通话记录", href: "../emergency/calls.html" },
  ],
},
```

Add an `emergency` SVG path entry to `navIcons` in `app/components/sidebar.js`:

```js
emergency: '<path d="M3 21h18"></path><path d="M5 21v-7l7-4 7 4v7"></path><path d="M12 4v6"></path><path d="M9 7h6"></path><path d="M9 17h6"></path>',
```

- [ ] **Step 4: Create temporary page shells so the contract test can progress**

Create each page with the common shell, its exact `data-menu-key`, its page title, one root content element, and these shared scripts in order:

```html
<script src="../../../app/config/menu.js"></script>
<script src="../../../app/data/emergency-data.js"></script>
<script src="../../../app/components/sidebar.js"></script>
<script src="../../../app/components/header.js"></script>
<script src="../../../app/components/drawer.js"></script>
<script src="../../../app/components/emergency-common.js"></script>
```

- [ ] **Step 5: Run the contract test**

Run: `node --test tests/emergency-pages.test.mjs`

Expected: PASS for navigation and the six shared page-shell checks.

- [ ] **Step 6: Commit**

```powershell
git add app/config/menu.js app/components/sidebar.js web/pages/emergency tests/emergency-pages.test.mjs
git commit -m "feat: add emergency management navigation"
```

## Task 2: Build the Persistent Emergency Store

**Files:**
- Create: `app/data/emergency-data.js`
- Create: `tests/emergency-store.test.mjs`

- [ ] **Step 1: Write failing store tests**

Load the browser IIFE inside `node:vm` with a fake `window.localStorage`, then test reset, CRUD, cross-entity references, timeline updates, resource locking, and call logging:

```js
test("call logging links calls to an event timeline", () => {
  const { store } = loadStore();
  store.reset();
  const call = store.logCall({
    eventId: "EVT-20260930-001",
    callerId: "P-001",
    calleeIds: ["P-002"],
    type: "群呼",
    source: "调度台",
    result: "已接通",
  });
  assert.equal(call.eventId, "EVT-20260930-001");
  assert.ok(store.getEvent("EVT-20260930-001").timeline.some((item) => item.refId === call.callId));
});

test("resource locking rejects unavailable stock", () => {
  const { store } = loadStore();
  store.reset();
  assert.throws(() => store.lockResource("EVT-20260930-001", "R-001", 999), /库存不足/);
});
```

- [ ] **Step 2: Run the store tests and verify failure**

Run: `node --test tests/emergency-store.test.mjs`

Expected: FAIL because `window.EMERGENCY_STORE` is missing.

- [ ] **Step 3: Implement the store contract and seed scenario**

Expose one stable API:

```js
window.EMERGENCY_STORE = {
  keys,
  reset,
  listPersonnel,
  savePerson,
  getPerson,
  listResources,
  saveResource,
  lockResource,
  releaseResource,
  listPlans,
  savePlan,
  getPlan,
  listEvents,
  saveEvent,
  getEvent,
  transitionEvent,
  appendTimeline,
  matchPlans,
  listCalls,
  logCall,
  getDispatch,
  saveDispatch,
};
```

Seed the approved scenario IDs consistently:

```js
const seed = {
  events: [{ eventId: "EVT-20260930-001", title: "东段 K2+340 燃气泄漏", level: "P1", source: "报警中心", status: "待确认", planId: "PLAN-GAS-P1", longitude: 117.20342, latitude: 31.84318, timeline: [] }],
  plans: [{ planId: "PLAN-GAS-P1", name: "燃气泄漏一级响应预案", eventType: "燃气泄漏", level: "P1", status: "已发布", steps: [] }],
  personnel: [{ personId: "P-001", name: "周建国", unit: "管廊运维中心", type: "应急指挥员", onlineStatus: "在线", dispatchStatus: "可调度", longitude: 117.2028, latitude: 31.8427 }],
  resources: [{ resourceId: "R-001", name: "气体检测仪", category: "抢修工具", total: 6, available: 5, occupied: 1, status: "可用", longitude: 117.2018, latitude: 31.8419 }],
  calls: [],
  dispatch: [{ eventId: "EVT-20260930-001", selectedPersonIds: [], lockedResources: [], activeStepId: null }],
};
```

Every mutation must persist only its affected collection and return the updated entity. `reset()` restores a deep copy of seeds.

- [ ] **Step 4: Run store tests**

Run: `node --test tests/emergency-store.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/data/emergency-data.js tests/emergency-store.test.mjs
git commit -m "feat: add persistent emergency data store"
```

## Task 3: Add Shared Emergency UI Infrastructure

**Files:**
- Create: `app/components/emergency-common.js`
- Create: `web/assets/css/emergency.css`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Extend contract tests for shared utilities and CSS**

Assert that every emergency page loads `emergency.css`, and that `EMERGENCY_UI` exposes:

```js
window.EMERGENCY_UI = {
  escapeHtml,
  statusClass,
  renderStatus,
  renderPagination,
  showToast,
  openEntityDrawer,
  navigate,
  nowText,
};
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/emergency-pages.test.mjs`

Expected: FAIL because shared CSS and utilities are absent.

- [ ] **Step 3: Implement shared utilities**

Use one delegated event style and keep shared code business-neutral. `navigate(key, query)` must resolve these routes:

```js
const routes = {
  dispatch: "dispatch.html",
  events: "events.html",
  plans: "plans.html",
  resources: "resources.html",
  personnel: "personnel.html",
  calls: "calls.html",
};
```

`showToast(message, type)` creates one fixed toast, replaces any existing toast, and removes it after 2400 ms.

- [ ] **Step 4: Add shared emergency styles**

Define focused classes for metric strips, compact filters, status tags, list tables, detail grids, step timelines, empty states, and the dispatch workspace. Reuse existing design tokens and keep radii at 2-4 px.

Required responsive rules:

```css
@media (max-width: 1100px) {
  .emergency-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .emergency-metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .emergency-filter-grid,
  .emergency-metric-grid { grid-template-columns: 1fr; }
  .dispatch-bottom-panel { height: min(48vh, 420px); }
}
```

- [ ] **Step 5: Run tests**

Run: `node --test tests/emergency-pages.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add app/components/emergency-common.js web/assets/css/emergency.css tests/emergency-pages.test.mjs web/pages/emergency
git commit -m "feat: add shared emergency ui"
```

## Task 4: Implement Emergency Personnel

**Files:**
- Modify: `web/pages/emergency/personnel.html`
- Create: `app/components/emergency-personnel.js`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add personnel page contract assertions**

Assert IDs `personnelMetrics`, `personnelFilters`, `personnelBody`, `personnelCount`, and action markers `data-person-action="create|detail|edit|call"`.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="personnel"`

Expected: FAIL on missing personnel controls.

- [ ] **Step 3: Build the personnel list and drawers**

Render metrics, six filters, the approved columns, pagination, create/edit form, and detail tabs. A call action must use:

```js
const record = store.logCall({
  eventId: "",
  callerId: "P-001",
  calleeIds: [person.personId],
  type: "单呼",
  source: "应急人员",
  result: "已接通",
});
ui.showToast(`已呼叫 ${person.name}，记录 ${record.callId}`);
```

Validate name, unit, type, mobile, current status, dispatch status, and location before save.

- [ ] **Step 4: Run tests and browser smoke check**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="personnel"`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add web/pages/emergency/personnel.html app/components/emergency-personnel.js tests/emergency-pages.test.mjs
git commit -m "feat: add emergency personnel directory"
```

## Task 5: Implement Emergency Resources

**Files:**
- Modify: `web/pages/emergency/resources.html`
- Create: `app/components/emergency-resources.js`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add resource contract assertions**

Assert metrics and filters, columns for name/category/model/available/location/owner/status, and actions for create, detail, edit, inbound, outbound, transfer, lock, and release.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="resources"`

Expected: FAIL on missing resource controls.

- [ ] **Step 3: Implement resource CRUD and stock actions**

Use integer validation and enforce:

```js
if (quantity <= 0) throw new Error("数量必须大于 0");
if (action === "outbound" && quantity > item.available) throw new Error("可用库存不足");
if (item.available <= item.safetyStock) item.alert = "低库存";
```

Detail drawer includes stock summary, location, expiry, manager, and usage records. “地图定位” links to `dispatch.html?resourceId=<id>`.

- [ ] **Step 4: Run tests**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="resources"`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add web/pages/emergency/resources.html app/components/emergency-resources.js tests/emergency-pages.test.mjs
git commit -m "feat: add emergency resource inventory"
```

## Task 6: Implement Emergency Plans

**Files:**
- Modify: `web/pages/emergency/plans.html`
- Create: `app/components/emergency-plans.js`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add plan contract assertions**

Assert filters and list columns, plus drawer step editor markers `data-plan-step-add`, `data-plan-step-remove`, `data-plan-step-up`, and `data-plan-step-down`.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="plans"`

Expected: FAIL on missing plan editor.

- [ ] **Step 3: Implement plan versioning and ordered steps**

Create/edit drawer fields match the design spec. Each saved step has this exact shape:

```js
{
  stepId: crypto.randomUUID(),
  order: 1,
  name: "确认事件位置",
  type: "信息确认",
  role: "应急指挥员",
  required: true,
  timeoutMinutes: 5,
  prerequisiteStepId: "",
  notifyPersonType: "管廊运维",
  resourceRequirements: [],
  videoRadiusMeters: 300,
  completionRule: "人工确认",
}
```

Publishing requires at least one step, changes status to `已发布`, and increments the version only when editing an already published plan.

- [ ] **Step 4: Run tests**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="plans"`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add web/pages/emergency/plans.html app/components/emergency-plans.js tests/emergency-pages.test.mjs
git commit -m "feat: add emergency plan management"
```

## Task 7: Implement Emergency Events and Alarm Import

**Files:**
- Modify: `web/pages/emergency/events.html`
- Create: `app/components/emergency-events.js`
- Modify: `web/pages/alarm-center/alarm-info.html`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add event and alarm-transfer contract tests**

Assert event status actions and that the alarm page contains `data-alarm-action="emergency"` with a call to `EMERGENCY_STORE.saveEvent`.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="event|alarm"`

Expected: FAIL on missing event workflow and alarm transfer.

- [ ] **Step 3: Implement event list, detail, and transitions**

Only allow these transitions:

```js
const transitions = {
  "待确认": ["已确认", "误报关闭"],
  "已确认": ["处理中"],
  "处理中": ["待复核", "已升级", "处置失败"],
  "已升级": ["处理中"],
  "处置失败": ["处理中"],
  "待复核": ["已关闭", "处理中"],
};
```

Confirming an event calls `matchPlans(event)` and displays the recommended plan. “进入调度台” navigates to `dispatch.html?eventId=<id>`.

- [ ] **Step 4: Add alarm-to-emergency conversion**

For unprocessed alarms, add “转应急事件”. Map alarm fields to a new event, prevent duplicate conversion with `sourceAlarmId`, and navigate to the new event detail.

- [ ] **Step 5: Run tests**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="event|alarm"`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add web/pages/emergency/events.html app/components/emergency-events.js web/pages/alarm-center/alarm-info.html tests/emergency-pages.test.mjs
git commit -m "feat: add emergency event workflow"
```

## Task 8: Vendor Leaflet and Add the Offline Map Adapter

**Files:**
- Create: `web/assets/vendor/leaflet/leaflet.js`
- Create: `web/assets/vendor/leaflet/leaflet.css`
- Create: `web/assets/vendor/leaflet/images/*`
- Create: `web/assets/maps/tianditu/README.md`
- Create: `app/components/emergency-map.js`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add map adapter contract assertions**

Assert the local Leaflet files exist and `emergency-map.js` contains methods `create`, `setLayers`, `focusEvent`, `startCircleSelect`, `startPolygonSelect`, `clearSelection`, and `destroy`.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="map"`

Expected: FAIL because the adapter and vendor assets are absent.

- [ ] **Step 3: Vendor Leaflet 1.9.4 locally**

Use the official npm package and copy only runtime distribution assets:

```powershell
npm pack leaflet@1.9.4
tar -xf leaflet-1.9.4.tgz
New-Item -ItemType Directory -Force web/assets/vendor/leaflet/images | Out-Null
Copy-Item package/dist/leaflet.js web/assets/vendor/leaflet/leaflet.js
Copy-Item package/dist/leaflet.css web/assets/vendor/leaflet/leaflet.css
Copy-Item package/dist/images/* web/assets/vendor/leaflet/images/
```

Remove the extracted `package` folder and tarball only after verifying the copied files exist. Do not commit the extraction artifacts.

- [ ] **Step 4: Implement the adapter**

Expose:

```js
window.EMERGENCY_MAP = {
  create(element, config),
  setLayers({ events, personnel, resources, vehicles, cameras }),
  focusEvent(event),
  startCircleSelect(onComplete),
  startPolygonSelect(onComplete),
  clearSelection(),
  destroy(),
};
```

Use local tiles with `errorTileUrl` disabled and attach `tileerror` handling. After repeated tile failure, apply `.dispatch-map-fallback` and keep all markers and selection tools functional.

- [ ] **Step 5: Document tile layout**

`README.md` must state the supported paths and required `EPSG:3857` XYZ scheme:

```text
vec/{z}/{x}/{y}.png
cva/{z}/{x}/{y}.png
ter/{z}/{x}/{y}.png
cia/{z}/{x}/{y}.png
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="map"`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add web/assets/vendor/leaflet web/assets/maps/tianditu/README.md app/components/emergency-map.js tests/emergency-pages.test.mjs
git commit -m "feat: add offline emergency map adapter"
```

## Task 9: Implement the Dispatch Console

**Files:**
- Modify: `web/pages/emergency/dispatch.html`
- Create: `app/components/emergency-dispatch.js`
- Modify: `web/assets/css/emergency.css`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add dispatch contract tests**

Assert the full-map shell, layer panel, map tools, bottom tabs, plan step list, selected-object bar, and video grid. Assert local Leaflet loads before `emergency-map.js`.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="dispatch"`

Expected: FAIL on missing dispatch controls.

- [ ] **Step 3: Build the approved full-map layout**

Use this hierarchy:

```html
<section class="dispatch-workspace">
  <header class="dispatch-command-bar"></header>
  <div id="dispatchMap" class="dispatch-map"></div>
  <aside class="dispatch-layer-panel"></aside>
  <nav class="dispatch-map-tools"></nav>
  <section class="dispatch-bottom-panel">
    <div class="dispatch-tabs"></div>
    <div class="dispatch-tab-content"></div>
  </section>
</section>
```

Do not wrap the map in a decorative card. The bottom panel has a collapsed 56 px state and an expanded `min(36vh, 360px)` state.

- [ ] **Step 4: Implement event focus, layers, selection, and calls**

Circle or polygon completion must calculate selected personnel/vehicles, render a confirmation bar, and call `store.logCall()` only after the user confirms recipients and communication type.

- [ ] **Step 5: Implement plan execution and resource locking**

Track each step as `未开始`, `执行中`, `已完成`, `已跳过`, or `执行失败`. Require a reason for skip and failure; append every change to the event timeline. Resource steps call `lockResource` and release resources when the event closes.

- [ ] **Step 6: Implement video linkage**

Calculate camera distance from the event, select the four closest online cameras, and show deterministic Mock preview images or labeled offline states. “打开视频监控” links to `../monitoring/video-monitor.html?eventId=<id>`.

- [ ] **Step 7: Run tests**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="dispatch"`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add web/pages/emergency/dispatch.html app/components/emergency-dispatch.js web/assets/css/emergency.css tests/emergency-pages.test.mjs
git commit -m "feat: add emergency dispatch console"
```

## Task 10: Implement Communication Records

**Files:**
- Modify: `web/pages/emergency/calls.html`
- Create: `app/components/emergency-calls.js`
- Modify: `tests/emergency-pages.test.mjs`

- [ ] **Step 1: Add calls-page contract assertions**

Assert metrics, filters, approved table columns, detail drawer, event link, and recording Mock controls.

- [ ] **Step 2: Run test and verify failure**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="calls"`

Expected: FAIL on missing call-record controls.

- [ ] **Step 3: Implement call metrics, filters, and detail drawer**

Compute connected rate as `connected / total`, average duration from connected calls only, and expose types `单呼`, `群呼`, `视频呼叫`, `短信`, `广播`. Event-linked records navigate to `events.html?eventId=<id>`.

Recording playback is an explicit Mock state with play/pause/progress controls; it must not pretend that a real audio file exists.

- [ ] **Step 4: Run tests**

Run: `node --test tests/emergency-pages.test.mjs --test-name-pattern="calls"`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add web/pages/emergency/calls.html app/components/emergency-calls.js tests/emergency-pages.test.mjs
git commit -m "feat: add emergency communication records"
```

## Task 11: Add Browser Workflow Tests and Visual QA

**Files:**
- Create: `tests/emergency-browser.mjs`
- Modify: any emergency file with a verified defect

- [ ] **Step 1: Write browser workflow tests**

Cover these workflows with Playwright:

```text
1. Open personnel -> add a person -> reload -> person remains.
2. Open alarm information -> convert an alarm -> event appears once.
3. Open event -> confirm -> recommended plan is selected.
4. Enter dispatch -> event is focused -> nearest four cameras appear.
5. Circle-select -> confirm group call -> a call record is created.
6. Lock resource -> available quantity decreases -> event timeline updates.
7. Complete one plan step -> refresh -> completed state remains.
8. Open call records -> filter by event -> detail links back to event.
```

- [ ] **Step 2: Start a local server**

Run: `npx --yes http-server . -p 4173 -c-1`

Expected: server available at `http://127.0.0.1:4173`.

- [ ] **Step 3: Run all automated tests**

Run:

```powershell
node --test tests/emergency-store.test.mjs tests/emergency-pages.test.mjs
node tests/emergency-browser.mjs
```

Expected: all checks PASS with no browser console errors.

- [ ] **Step 4: Verify desktop and narrow viewports**

Capture and inspect at `1440x900` and `390x844`. Verify:

- Sidebar and all six child routes render correctly.
- No table action or filter label clips.
- Drawers fit the viewport and keep fixed headers/footers.
- Dispatch map is nonblank even without tile files.
- Bottom panel never covers the command bar or map tools.
- Circle/polygon selection remains usable at desktop width.
- Narrow layout retains event selection, plan progress, and call confirmation.

- [ ] **Step 5: Run final static checks**

Run:

```powershell
git diff --check
rg -n "TODO|TBD|lorem ipsum" app/data/emergency-data.js app/components/emergency-*.js web/pages/emergency web/assets/css/emergency.css
```

Expected: no whitespace errors and no placeholders.

- [ ] **Step 6: Commit verification fixes**

```powershell
git add app/config/menu.js app/data/emergency-data.js app/components/emergency-*.js web/pages/emergency web/assets/css/emergency.css web/assets/vendor/leaflet web/assets/maps/tianditu/README.md tests
git commit -m "test: verify emergency management workflows"
```

## Completion Criteria

- “应急管理” is a top-level menu immediately below “智能监测”.
- All six child pages are reachable and visually consistent with the existing platform.
- Personnel, resources, plans, and events support meaningful CRUD and persistent Mock data.
- Alarms can be converted to events without duplicates.
- Dispatch uses the approved full-map + bottom-event-workspace layout.
- Offline Tianditu tiles work through a local Leaflet adapter; missing tiles degrade gracefully.
- Map selection can call people and produce event-linked communication records.
- Plan execution, resource locks, video linkage, and event timelines persist.
- Communication records aggregate calls from personnel, events, plans, and dispatch.
- Automated contract, store, and browser workflow tests pass.
