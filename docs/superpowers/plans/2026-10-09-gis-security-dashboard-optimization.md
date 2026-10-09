# GIS Security Dashboard Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the GIS security tab side rails with the requested video, access-control, alarm, and key-area monitoring modules, while opening the existing pedestrian-record page in a query-scoped embedded modal.

**Architecture:** Add a `gisPanel3` enhancement block to the existing one-map page, following the established panel-specific enhancement pattern used by the home, environment, and fire tabs. Add embedded-mode detection inside the existing pedestrian-record page so only `?embedded=1` hides the shared shell; keep all business handlers and the normal route unchanged.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Font Awesome, Node.js built-in test runner, Playwright browser verification.

---

## File Structure

- Modify `web/pages/gis/one-map.html`: inject panel-scoped security dashboard markup, modal markup, and open/close behavior.
- Modify `web/assets/css/gis-one-map.css`: style security rail sizing, metrics, records, video grids, alarm rows, and the access-record modal.
- Modify `web/pages/monitoring/pedestrian-record.html`: detect `embedded=1`, hide only shared navigation in that mode, and adapt the content container to iframe dimensions.
- Create `tests/gis-security-dashboard.test.mjs`: assert requested module content, scoped embedded behavior, and modal wiring.

### Task 1: Lock the requested structure with failing tests

**Files:**
- Create: `tests/gis-security-dashboard.test.mjs`

- [ ] **Step 1: Add the content and interaction contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const oneMap = () => readFile(new URL("../web/pages/gis/one-map.html", import.meta.url), "utf8");
const styles = () => readFile(new URL("../web/assets/css/gis-one-map.css", import.meta.url), "utf8");
const records = () => readFile(new URL("../web/pages/monitoring/pedestrian-record.html", import.meta.url), "utf8");

test("security tab renders requested modules and camera metrics", async () => {
  const html = await oneMap();
  for (const text of ["视频设备概览", "摄像机总数", "433", "枪式摄像机", "132", "半球摄像机", "290", "球型摄像机", "11", "门禁系统", "视频监控系统", "系统告警记录", "关键区域监控"]) {
    assert.match(html, new RegExp(text));
  }
  assert.match(html, /data-security-access-records/);
  assert.match(html, /pedestrian-record\.html\?embedded=1/);
});

test("security titles remove subtitle text and remain panel scoped", async () => {
  const html = await oneMap();
  const css = await styles();
  assert.match(html, /panel\.querySelectorAll\('\.gis-card-sub'\)/);
  assert.match(css, /#gisPanel3 \.gis-security-rail/);
});

test("pedestrian records embed mode hides only the shared shell", async () => {
  const html = await records();
  assert.match(html, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(html, /get\("embedded"\) === "1"/);
  assert.match(html, /pedestrian-record-embedded #app-sidebar/);
  assert.match(html, /pedestrian-record-embedded #app-header/);
  assert.doesNotMatch(html, /<body class="[^"]*pedestrian-record-embedded/);
  for (const action of ["reset", "search", "export"]) assert.match(html, new RegExp(`data-action="${action}"`));
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run: `node --test tests/gis-security-dashboard.test.mjs`

Expected: FAIL because the security enhancement, access-record modal, and pedestrian-record embedded mode are not implemented.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- tests/gis-security-dashboard.test.mjs
git commit -m "test: define GIS security dashboard contract"
```

### Task 2: Add isolated embedded mode to pedestrian records

**Files:**
- Modify: `web/pages/monitoring/pedestrian-record.html`
- Test: `tests/gis-security-dashboard.test.mjs`

- [ ] **Step 1: Add query-scoped embedded styles**

Add styles in the page head that apply only after JavaScript sets the root class:

```css
.pedestrian-record-embedded .layout {
  display: block;
  min-height: 100vh;
}
.pedestrian-record-embedded #app-sidebar,
.pedestrian-record-embedded #app-header {
  display: none;
}
.pedestrian-record-embedded .main {
  min-height: 100vh;
  padding: 16px;
  overflow: auto;
}
```

- [ ] **Step 2: Detect the query before shared components render**

Insert this inline script before the closing `head` tag so the shell does not flash:

```html
<script>
  if (new URLSearchParams(window.location.search).get("embedded") === "1") {
    document.documentElement.classList.add("pedestrian-record-embedded");
  }
</script>
```

Keep existing sidebar, header, drawer, requirement, filter, table, export, view, and pagination code unchanged.

- [ ] **Step 3: Run the focused test**

Run: `node --test tests/gis-security-dashboard.test.mjs`

Expected: the embedded-mode assertions PASS; dashboard assertions still FAIL.

- [ ] **Step 4: Commit the embedded mode**

```powershell
git add -- web/pages/monitoring/pedestrian-record.html tests/gis-security-dashboard.test.mjs
git commit -m "feat: add embedded pedestrian records mode"
```

### Task 3: Build the security dashboard modules and modal

**Files:**
- Modify: `web/pages/gis/one-map.html`
- Test: `tests/gis-security-dashboard.test.mjs`

- [ ] **Step 1: Add the panel-specific enhancement block**

Append an IIFE after the existing panel enhancements. It must select only `gisPanel3`, add `gis-security-rail` to both rails, remove `.gis-card-sub` nodes within that panel, and replace the two rail contents.

Use these exact module titles and metrics:

```js
var cameras = [
  ["fa-video", "摄像机总数", "433", "total"],
  ["fa-camera", "枪式摄像机", "132", "bullet"],
  ["fa-camera-retro", "半球摄像机", "290", "dome"],
  ["fa-bullseye", "球型摄像机", "11", "ptz"]
];
```

Build the left rail as:

```html
<section class="gis-card gis-security-card gis-security-camera-card">
  <div class="gis-card-head"><h3>视频设备概览</h3></div>
  <div class="gis-card-body"><div class="gis-security-camera-metrics"><!-- four metrics --></div></div>
</section>
<section class="gis-card gis-security-card gis-security-access-card">
  <div class="gis-card-head"><h3>门禁系统</h3><button type="button" class="gis-security-record-button" data-security-access-records><i class="fa-solid fa-list" aria-hidden="true"></i>通行记录</button></div>
  <div class="gis-card-body">
    <div class="gis-security-access-summary"><!-- 设备总数 198、设备故障率 0%、在线 198、离线 0 --></div>
    <h4 class="gis-security-subtitle">通行记录</h4>
    <div class="gis-security-record-list"><!-- 姓名、时间、方式、设备、位置 --></div>
  </div>
</section>
```

Build the right rail in this order:

```html
<section class="gis-card gis-security-card"><div class="gis-card-head"><h3>视频监控系统</h3></div><!-- live overview --></section>
<section class="gis-card gis-security-card"><div class="gis-card-head"><h3>系统告警记录</h3></div><!-- alarm rows --></section>
<section class="gis-card gis-security-card gis-security-key-video"><div class="gis-card-head"><h3>关键区域监控</h3></div><!-- reuse home video feed markup/data --></section>
```

- [ ] **Step 2: Add and wire the access-record modal**

Append one modal with a unique id and the existing monitoring page as its source:

```html
<div class="gis-access-modal" id="gisAccessModal" hidden>
  <div class="gis-access-modal-panel" role="dialog" aria-modal="true" aria-labelledby="gisAccessModalTitle">
    <div class="gis-access-modal-head">
      <h2 id="gisAccessModalTitle">人行通行记录</h2>
      <button type="button" class="gis-access-modal-close" data-security-access-close aria-label="关闭通行记录"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    </div>
    <iframe title="人行通行记录" src="../monitoring/pedestrian-record.html?embedded=1"></iframe>
  </div>
</div>
```

Bind `[data-security-access-records]` to open it. Close it from the close button, backdrop click, and Escape. Toggle `gis-access-modal-open` on `body` to prevent background scrolling.

- [ ] **Step 3: Run the focused test**

Run: `node --test tests/gis-security-dashboard.test.mjs`

Expected: all tests PASS.

- [ ] **Step 4: Commit dashboard behavior**

```powershell
git add -- web/pages/gis/one-map.html tests/gis-security-dashboard.test.mjs
git commit -m "feat: optimize GIS security dashboard content"
```

### Task 4: Style the security rails and modal

**Files:**
- Modify: `web/assets/css/gis-one-map.css`
- Test: `tests/gis-security-dashboard.test.mjs`

- [ ] **Step 1: Add panel-scoped rail sizing and card styles**

Add `#gisPanel3`-scoped rules for two left rows and three right rows. Use compact 4px-radius cards, 8px spacing, 12-14px labels, and fixed grid tracks so dynamic content does not resize the rails.

```css
#gisPanel3 .gis-float-left.gis-security-rail { grid-template-rows:170px minmax(0,1fr); }
#gisPanel3 .gis-float-right.gis-security-rail { grid-template-rows:190px 178px minmax(0,1fr); }
#gisPanel3 .gis-security-camera-metrics { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
#gisPanel3 .gis-security-access-summary { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
#gisPanel3 .gis-security-key-video .gis-home-video-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
```

Style semantic states with the existing `--primary`, `--ok`, `--warn`, and `--danger` variables. Ensure long device and location text truncates with ellipsis rather than overlapping.

- [ ] **Step 2: Add responsive modal styles**

```css
.gis-access-modal { position:fixed; inset:0; z-index:1600; display:grid; place-items:center; padding:24px; background:rgba(15,27,45,.58); }
.gis-access-modal[hidden] { display:none; }
.gis-access-modal-panel { width:min(1500px,96vw); height:min(900px,92vh); display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--line); border-radius:6px; background:#f5f7fc; box-shadow:0 24px 64px rgba(15,27,45,.28); }
.gis-access-modal-head { flex:0 0 48px; display:flex; align-items:center; justify-content:space-between; padding:0 16px; border-bottom:1px solid var(--divider); background:#fff; }
.gis-access-modal iframe { width:100%; flex:1; min-height:0; border:0; background:#f5f7fc; }
body.gis-access-modal-open { overflow:hidden; }
```

At widths below 900px, make both security rails flow as normal full-width columns and use `padding:8px; height:96vh` for the modal.

- [ ] **Step 3: Run automated regression tests**

Run: `node --test tests/gis-security-dashboard.test.mjs tests/gis-system-home-dashboard.test.mjs`

Expected: all tests PASS, including the existing system-home dashboard checks.

- [ ] **Step 4: Commit styles**

```powershell
git add -- web/assets/css/gis-one-map.css tests/gis-security-dashboard.test.mjs
git commit -m "style: refine GIS security dashboard layout"
```

### Task 5: Browser verification and final regression

**Files:**
- Verify: `web/pages/gis/one-map.html`
- Verify: `web/pages/monitoring/pedestrian-record.html`

- [ ] **Step 1: Start the local static server**

Run: `python -m http.server 8000`

Expected: server remains available at `http://localhost:8000/`.

- [ ] **Step 2: Verify the GIS security tab at desktop size**

Open `http://localhost:8000/web/pages/gis/one-map.html`, select “安防监控”, and capture a 1440x900 screenshot. Confirm module order, all four camera metrics, readable access rows, three right-side modules, no subtitle text, and no overlap.

- [ ] **Step 3: Verify the embedded modal workflow**

Click “通行记录”. Confirm the modal title and close controls, verify the iframe has no shared sidebar/header, exercise search and reset, open one “查看” action, and close with both the button and Escape.

- [ ] **Step 4: Verify the normal subsystem route**

Open `http://localhost:8000/web/pages/monitoring/pedestrian-record.html` without a query string. Confirm the shared sidebar and header are visible, and repeat search, reset, export, view, and pagination checks.

- [ ] **Step 5: Run the complete Node test suite**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

- [ ] **Step 6: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only the planned feature files and any pre-existing user changes are present.

