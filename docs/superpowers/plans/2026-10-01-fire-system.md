# 消防系统综合列表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在视频监控菜单下新增消防系统综合列表页，统一展示六类第三方消防子系统的设备状态、报警、运行参数，并提供报警点附近视频复核入口。

**Architecture:** 新建独立的 `fire-system.html` 页面，沿用现有 app shell、共享 sidebar/header/drawer 和 TOB CSS。页面内用本地 mock 数据建立统一设备模型，筛选只作用于列表，详情与附近视频使用右侧抽屉；保留现有 `fire-alarm.html` 不做破坏性迁移。

**Tech Stack:** HTML、CSS、原生 JavaScript、Node.js `node:test`、现有 Font Awesome 与共享 TOB 样式。

---

## 文件边界

- Modify: `app/config/menu.js`，在视频监控后新增 `fire-system` 一级菜单项。
- Modify: `app/components/sidebar.js`，增加 `fire-system` 线性导航图标。
- Create: `web/pages/monitoring/fire-system.html`，页面结构、mock 数据、筛选、抽屉交互。
- Create: `web/assets/css/fire-system.css`，仅负责消防综合页样式和响应式布局。
- Create: `tests/fire-system-pages.test.mjs`，验证菜单、页面壳层、六类数据和只读辅助视频入口。

### Task 1: 先写页面契约测试

**Files:**
- Create: `tests/fire-system-pages.test.mjs`

- [ ] **Step 1: 写菜单与页面结构断言**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("menu exposes fire system after video monitoring", async () => {
  const source = await read("app/config/menu.js");
  const videoIndex = source.indexOf('key: "video-monitoring"');
  const fireIndex = source.indexOf('key: "fire-system"');
  assert.ok(videoIndex >= 0 && fireIndex > videoIndex);
  assert.match(source, /label:\s*"消防系统"/);
  assert.match(source, /href:\s*"\.\.\/monitoring\/fire-system\.html"/);
});

test("sidebar provides a fire system icon", async () => {
  const source = await read("app/components/sidebar.js");
  assert.match(source, /"fire-system":\s*['"][\s\S]*?<path/);
});

test("fire system page uses shared shell and read-only markers", async () => {
  const source = await read("web/pages/monitoring/fire-system.html");
  assert.match(source, /class="app-shell"/);
  assert.match(source, /data-menu-key="fire-system"/);
  assert.match(source, /fire-system\.css/);
  assert.match(source, /第三方接入[^<]*只读/);
  assert.match(source, /附近视频/);
  assert.doesNotMatch(source, /data-action="(start|stop|reset|silence|configure)"/);
});
```

- [ ] **Step 2: 写六类系统和交互锚点断言**

```js
test("fire system page includes all six subsystem types", async () => {
  const source = await read("web/pages/monitoring/fire-system.html");
  for (const name of [
    "火灾自动报警系统",
    "防火门监控系统",
    "消防电源监控系统",
    "电气火灾监控系统",
    "应急照明与疏散指示系统",
    "感温光纤系统",
  ]) assert.match(source, new RegExp(name));
  for (const id of ["systemFilter", "deviceStatus", "alarmLevel", "zoneFilter", "deviceSearch", "deviceTableBody"]) {
    assert.match(source, new RegExp(`id="${id}"`));
  }
  assert.match(source, /data-action="refresh"/);
  assert.match(source, /data-action="reset"/);
  assert.match(source, /data-action="search"/);
});
```

- [ ] **Step 3: 运行测试确认当前失败**

Run: `node --test tests/fire-system-pages.test.mjs`

Expected: FAIL because `fire-system.html` and the new menu key/icon do not exist yet.

### Task 2: 接入新一级菜单

**Files:**
- Modify: `app/config/menu.js` immediately after the `video-monitoring` menu block.
- Modify: `app/components/sidebar.js` inside `navIcons`.

- [ ] **Step 1: 添加菜单项**

Insert after the video-monitoring block:

```js
{
  key: "fire-system",
  label: "消防系统",
  icon: "fa-solid fa-fire-flame-curved",
  href: "../monitoring/fire-system.html",
},
```

- [ ] **Step 2: 添加 SVG 导航图标**

Add this entry beside the existing fire alarm icon:

```js
"fire-system": '<path d="M12 22c4.42 0 8-2.91 8-7.2 0-3.03-1.52-5.54-4.5-7.8.05 2.27-.59 3.88-1.82 4.83.14-3.3-1.58-6.18-4.9-8.63.17 2.9-1.2 4.8-2.64 6.56C4.98 11.43 4 13.09 4 15.2 4 19.49 7.58 22 12 22Z"></path><path d="M9.5 17.1c0-1.18.64-2.13 2.08-3.5-.02 1.4.4 2.3 1.17 2.8.06-.7.31-1.22.75-1.57.55.8 1 1.6 1 2.52 0 1.44-1.1 2.45-2.5 2.45s-2.5-1.01-2.5-2.7Z"></path>',
```

- [ ] **Step 3: 运行契约测试**

Run: `node --test tests/fire-system-pages.test.mjs`

Expected: menu/icon tests pass; page tests still fail until Task 3.

### Task 3: 构建消防系统综合列表页面

**Files:**
- Create: `web/pages/monitoring/fire-system.html`

- [ ] **Step 1: 添加共享壳层和摘要区域**

Create the page with these fixed anchors:

```html
<body class="fire-system-page" data-menu-key="fire-system" data-page-section="消防系统" data-page-title="消防系统">
  <div class="app-shell">
    <aside id="app-sidebar" class="sidebar"></aside>
    <header id="app-header" class="header"></header>
    <main class="main">
      <div class="screen-frame stack">
        <section class="fire-system-head">
          <div>
            <div class="eyebrow"><span class="sync-dot"></span>第三方接入 · 只读展示</div>
            <h1>消防系统</h1>
            <p>统一查看六类消防子系统的设备状态、报警信息与运行参数。</p>
          </div>
          <div class="fire-system-head-actions"><span>最近同步 <strong id="lastSync">刚刚</strong></span><button class="btn btn-secondary" type="button" data-action="refresh"><i class="fa-solid fa-rotate-right"></i>刷新数据</button></div>
        </section>
        <section class="fire-summary-grid" aria-label="消防系统概览">
          <article class="fire-summary"><span>接入状态</span><strong id="summaryConnection">正常</strong><small id="summarySync">第三方接口 · 刚刚同步</small></article>
          <article class="fire-summary"><span>消防设备</span><strong id="summaryDevices">0</strong><small>六类系统合计</small></article>
          <article class="fire-summary"><span>当前报警</span><strong id="summaryAlarms">0</strong><small>未恢复火警、故障、监管</small></article>
          <article class="fire-summary"><span>在线率</span><strong id="summaryOnlineRate">0%</strong><small id="summaryOnlineNote">0 / 0 台在线</small></article>
        </section>
```

- [ ] **Step 2: 添加筛选工具栏和列表字段**

Use native selects and a search input with IDs `systemFilter`, `deviceStatus`, `alarmLevel`, `zoneFilter`, and `deviceSearch`. The table header must contain `系统类型`, `设备名称 / 编码`, `精确位置`, `当前状态`, `运行参数`, `最近报警`, `更新时间`, `操作`, and the body ID must be `deviceTableBody`.

- [ ] **Step 3: 添加 mock 数据与统一字段**

Define at least 12 devices with each of the six system names represented. Every record must contain:

```js
{
  id, name, system, systemCode, deviceType, zone, location,
  status, statusLabel, parameters: [{ label, value, unit }],
  latestAlarm: { type, level, message, time, restored } | null,
  updatedAt, source: "第三方消防平台"
}
```

Include realistic samples for smoke/heat/manual alarm devices, fire doors, pump/fan power, residual current/temperature, emergency lights/indicators, and fiber temperature zones. Include at least one `warn`, one `fault`, and one `offline` device for state verification.

- [ ] **Step 4: 添加基础渲染函数**

Implement `renderSummary()`, `renderFilters()`, `filteredDevices()`, `renderTable()`, and `renderEmptyState()`. `renderSummary()` must always read the full `devices` array, while `renderTable()` reads only `filteredDevices()`.

- [ ] **Step 5: 添加筛选、刷新和回车搜索交互**

Use a state object `{ system: "all", status: "all", level: "all", zone: "all", query: "" }`. Search copies current control values into state; reset restores defaults and rerenders; refresh updates `lastSync` and rerenders without changing filters; pressing Enter in `deviceSearch` triggers the same search handler.

- [ ] **Step 6: 运行页面契约测试**

Run: `node --test tests/fire-system-pages.test.mjs`

Expected: all structural tests pass.

### Task 4: 实现设备详情和辅助视频抽屉

**Files:**
- Modify: `web/pages/monitoring/fire-system.html`

- [ ] **Step 1: 实现设备详情抽屉数据模板**

Add `openDeviceDetail(id)` that calls `window.openAppDrawer()` with sections for device summary, location/parameters, latest alarm, data source, and update time. For offline devices render `暂无实时参数`. Footer contains only a close button.

- [ ] **Step 2: 实现附近视频抽屉数据模板**

Add `openNearbyVideo(id)` using a local `nearbyCameras` map keyed by device ID. Render alarm context, a video preview placeholder with online/offline state, camera rows sorted by `distance`, and a link button to `../monitoring/video-monitor.html`. Do not add any alarm acknowledgement, reset, silence, start, stop, or configuration action.

- [ ] **Step 3: 绑定行操作**

Use delegated click handling on `#deviceTableBody`: row click opens detail unless the click target has `data-device-action="nearby-video"`; the nearby video button opens `openNearbyVideo(row.dataset.deviceId)`.

- [ ] **Step 4: 验证抽屉锚点和只读约束**

Run: `node --test tests/fire-system-pages.test.mjs`

Expected: all tests pass, including `附近视频` and absence of write-action markers.

### Task 5: 添加消防综合页样式和响应式规则

**Files:**
- Create: `web/assets/css/fire-system.css`

- [ ] **Step 1: 定义页面布局与状态令牌**

Use existing CSS variables from `tob-ui.css`; create styles for `.fire-system-head`, `.fire-summary-grid`, `.fire-summary`, `.fire-filter-card`, `.fire-table-card`, `.fire-status`, `.fire-parameter`, `.fire-empty`, `.fire-video-preview`, and `.fire-camera-row`. Keep card radius at 4px, 8px-based gaps, white cards, and semantic green/yellow/red/gray states.

- [ ] **Step 2: 保证列表和抽屉在窄屏可用**

Set `.fire-table-wrap { overflow-x: auto; }`, give the table a `min-width`, collapse the summary grid below 960px, stack filter fields below 760px, and set drawer content width to `min(560px, 90vw)` without clipping labels or action buttons.

- [ ] **Step 3: 手工检查视觉约束**

Run the local static server, open `web/pages/monitoring/fire-system.html`, and verify sidebar active state, summary alignment, table horizontal scroll, empty-state text, detail drawer, and nearby video drawer at desktop and narrow viewport widths.

### Task 6: 完成回归验证

**Files:**
- Modify: none unless validation finds a concrete issue.

- [ ] **Step 1: 运行消防页面测试**

Run: `node --test tests/fire-system-pages.test.mjs`

Expected: PASS.

- [ ] **Step 2: 运行现有页面测试集**

Run: `node --test tests/*.test.mjs`

Expected: all existing tests remain PASS; pre-existing unrelated failures must be recorded rather than hidden.

- [ ] **Step 3: 检查工作区差异**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors in changed files; unrelated pre-existing modifications remain untouched.

- [ ] **Step 4: 提交实现**

```bash
git add app/config/menu.js app/components/sidebar.js web/pages/monitoring/fire-system.html web/assets/css/fire-system.css tests/fire-system-pages.test.mjs
git commit -m "feat: add fire system monitoring list"
```

## Self-review

- Spec coverage: navigation, six subsystem filters, full-data summaries, unified table, device detail drawer, nearby video drawer, third-party read-only boundary, empty/loading/error-compatible rendering, responsive behavior, and tests are covered by Tasks 1-6.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain; all commands and required IDs are explicit.
- Type consistency: the device model uses `system`, `status`, `latestAlarm`, `parameters`, and `updatedAt` consistently across rendering and drawers; filter state names match the control IDs and `filteredDevices()` predicates.
