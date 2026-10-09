# GIS Fire Monitoring Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace unsupported fire-alarm and electrical-fire metrics in the GIS fire-monitoring tab with six data-backed operations modules while preserving the central map and the existing three-left/three-right layout.

**Architecture:** Keep the existing monolithic GIS page and add fire-tab-specific markup and scoped CSS only. Reuse the shared card, mini-stat, table, tag, and alarm-list primitives; copy the environment alarm module's structure into the fire tab and scope compact three-row layout rules under `#gisPanel2`.

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript already present in `one-map.html`, Node.js built-in test runner, Playwright-based browser verification where available.

---

## File Structure

- Modify `web/pages/gis/one-map.html`: replace only the `#gisPanel2` left and right rail content; retain the map, search, layer controls, band controls, and other GIS panels.
- Modify `web/assets/css/gis-one-map.css`: add `#gisPanel2`-scoped three-row rail sizing, internal scrolling, compact statistics, tables, and alarm-list rules.
- Create `tests/gis-fire-dashboard.test.mjs`: assert the six-module order, supported data fields, removal of unsupported metrics, and presence of scoped fire dashboard CSS.

### Task 1: Lock the fire dashboard contract with tests

**Files:**
- Create: `tests/gis-fire-dashboard.test.mjs`
- Read: `web/pages/gis/one-map.html`
- Read: `web/assets/css/gis-one-map.css`

- [ ] **Step 1: Write the failing structure test**

Create a Node test that extracts `#gisPanel2`, then checks card order and supported labels:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../web/pages/gis/one-map.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../web/assets/css/gis-one-map.css", import.meta.url), "utf8");
const start = html.indexOf('<div class="gis-panel " id="gisPanel2"');
const end = html.indexOf('<div class="gis-panel " id="gisPanel3"', start);
const panel = html.slice(start, end);

test("fire dashboard contains the approved six cards in rail order", () => {
  const titles = [...panel.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]);
  assert.deepEqual(titles.filter((title) => [
    "消防设备运行统计", "消防设施台账", "分区消防保障状态",
    "消防设备运行异常", "消防巡检维保", "设备报警"
  ].includes(title)), [
    "消防设备运行统计", "消防设施台账", "分区消防保障状态",
    "消防设备运行异常", "消防巡检维保", "设备报警"
  ]);
});

test("fire dashboard removes unsupported FAS and electrical measurements", () => {
  for (const label of ["火灾报警统计", "FAS 实时报警列表", "电气火灾监控", "剩余电流", "故障电弧"]) {
    assert.equal(panel.includes(label), false, label);
  }
});

test("fire dashboard exposes supported operational fields and scoped styles", () => {
  for (const label of ["在线", "离线", "状态未知", "有效期", "待巡检", "已逾期", "报警总数", "未处理", "已处理"]) {
    assert.ok(panel.includes(label), label);
  }
  assert.match(css, /#gisPanel2 \.gis-fire-rail/);
  assert.match(css, /#gisPanel2 \.gis-fire-alarm/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/gis-fire-dashboard.test.mjs`

Expected: FAIL because the current panel still contains the old titles and does not contain the `gis-fire-rail` or `gis-fire-alarm` scoped styles.

- [ ] **Step 3: Commit the failing test**

```powershell
git add -- tests/gis-fire-dashboard.test.mjs
git commit -m "test: define GIS fire dashboard contract"
```

### Task 2: Replace the fire-monitoring rail content

**Files:**
- Modify: `web/pages/gis/one-map.html:194`
- Test: `tests/gis-fire-dashboard.test.mjs`

- [ ] **Step 1: Replace the left rail with the approved three modules**

Keep the existing `aside.gis-float-left`, add `gis-fire-rail`, and create three `section.gis-card.gis-fire-card` elements in this exact order:

```html
<aside class="gis-float gis-float-left gis-fire-rail">
  <section class="gis-card gis-fire-card gis-fire-runtime">
    <div class="gis-card-head"><h3>消防设备运行统计</h3><span class="rt"><span class="gis-tag ok">在线率 98.9%</span></span></div>
    <div class="gis-card-body">
      <div class="gis-fire-summary">
        <div class="gis-mini"><div class="n"><i class="dot"></i>在线</div><strong>468</strong></div>
        <div class="gis-mini bad"><div class="n"><i class="dot"></i>离线</div><strong>3</strong></div>
        <div class="gis-mini"><div class="n"><i class="dot" style="background:#8A93A0"></i>状态未知</div><strong>2</strong></div>
      </div>
      <div class="gis-bars"><!-- five device-type online/total rows --></div>
    </div>
  </section>
  <section class="gis-card gis-fire-card gis-fire-ledger"><!-- retained facility ledger table --></section>
  <section class="gis-card gis-fire-card gis-fire-zones"><!-- zone status items with online/total, pending inspection, overdue maintenance --></section>
</aside>
```

Use representative values that reconcile with the displayed totals. The ledger must retain columns `设施`, `位置`, `数量`, and `有效期`, including green, yellow, red, and `—` expiry values. Zone items must visibly include `待巡检` and `逾期维保` wording and use normal, warning, and danger variants.

- [ ] **Step 2: Replace the right rail with the approved three modules**

Keep the existing `aside.gis-float-right`, add `gis-fire-rail`, and create three `section.gis-card.gis-fire-card` elements in this exact order:

```html
<aside class="gis-float gis-float-right gis-fire-rail">
  <section class="gis-card gis-fire-card gis-fire-exceptions"><!-- offline/stopped/unknown devices only --></section>
  <section class="gis-card gis-fire-card gis-fire-maintenance"><!-- monthly plan summary and task table --></section>
  <section class="gis-card gis-fire-card gis-fire-alarm">
    <div class="gis-card-head"><h3>设备报警</h3><span class="rt"><span class="gis-tag danger">未处理 3</span></span></div>
    <div class="gis-card-body">
      <div class="gis-fire-alarm-summary">
        <div class="gis-mini bad"><div class="n"><i class="dot"></i>报警总数</div><strong>5</strong></div>
        <div class="gis-mini warn"><div class="n"><i class="dot"></i>未处理</div><strong>3</strong></div>
        <div class="gis-mini"><div class="n"><i class="dot"></i>已处理</div><strong>2</strong></div>
      </div>
      <div class="gis-alarm"><!-- fire-device alarm rows using l3/l2/l1 and status tags --></div>
    </div>
  </section>
</aside>
```

Do not include remaining-current, temperature, arc-fault, FAS fire, supervision, or shield signal values. Keep operation exceptions limited to connectivity/enablement states so they do not duplicate the alarm list.

- [ ] **Step 3: Run the contract test**

Run: `node --test tests/gis-fire-dashboard.test.mjs`

Expected: the title and unsupported-content assertions pass; the CSS assertions still fail until Task 3.

- [ ] **Step 4: Commit the markup change**

```powershell
git add -- web/pages/gis/one-map.html tests/gis-fire-dashboard.test.mjs
git commit -m "feat: restructure GIS fire monitoring content"
```

### Task 3: Add fire-specific rail layout and verify the page

**Files:**
- Modify: `web/assets/css/gis-one-map.css`
- Test: `tests/gis-fire-dashboard.test.mjs`

- [ ] **Step 1: Add scoped three-row layout rules**

Append fire-only selectors after the environment dashboard block:

```css
/* 消防监控：左右三段式面板，列表在模块内滚动。 */
#gisPanel2 .gis-fire-rail { display:grid; grid-template-rows:repeat(3,minmax(0,1fr)); gap:8px; overflow:hidden !important; }
#gisPanel2 .gis-fire-card { min-height:0; overflow:hidden; }
#gisPanel2 .gis-fire-card .gis-card-head { flex:0 0 38px; min-height:38px; }
#gisPanel2 .gis-fire-card .gis-card-body { min-height:0; overflow:hidden; padding:9px 10px; }
#gisPanel2 .gis-fire-summary,
#gisPanel2 .gis-fire-alarm-summary { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
#gisPanel2 .gis-fire-ledger .gis-scroll,
#gisPanel2 .gis-fire-maintenance .gis-scroll,
#gisPanel2 .gis-fire-zones .gis-mini-grid,
#gisPanel2 .gis-fire-exceptions .gis-alarm,
#gisPanel2 .gis-fire-alarm .gis-alarm { height:100%; overflow:auto; scrollbar-width:thin; }
#gisPanel2 .gis-fire-alarm .gis-card-body { display:grid; grid-template-rows:38px minmax(0,1fr); gap:7px; }
#gisPanel2 .gis-fire-alarm .gis-alarm-item { min-height:52px; padding:5px; grid-template-columns:24px minmax(0,1fr) auto; }
```

Add specific row heights for the left and right rails based on their information density. Use `minmax(0,1fr)` for the flexible third row, and add a `max-height:760px` media query that reduces fixed rows without hiding content.

- [ ] **Step 2: Run focused and existing GIS tests**

Run: `node --test tests/gis-fire-dashboard.test.mjs tests/gis-system-home-dashboard.test.mjs`

Expected: PASS for every discovered test. If `tests/gis-system-home-dashboard.test.mjs` is absent in the current checkout, run the focused test alone and record that the optional regression file was unavailable.

- [ ] **Step 3: Start the local prototype server**

Run: `npx --yes http-server . -p 8090 -c-1`

Expected: output includes `Available on: http://127.0.0.1:8090` and the process remains running for browser checks.

- [ ] **Step 4: Verify desktop layout in a browser**

Open `http://127.0.0.1:8090/web/pages/gis/one-map.html`, select `消防监控`, and capture screenshots at `1920x1080` and `1366x768`. Verify:

- the central map remains visible and interactive;
- left and right rails each show three cards in the approved order;
- the ledger is left-center and device alarm is right-bottom;
- inner tables/lists scroll without moving the card header;
- no labels, numbers, tags, or table columns overlap;
- environment-monitoring alarm styles remain unchanged.

- [ ] **Step 5: Check browser errors and canvas/map visibility**

Confirm the console has no new JavaScript errors, the Leaflet map area has non-background pixels, and clicking a zone band item still changes selection without resizing the rails.

- [ ] **Step 6: Commit scoped styles and verification fixes**

```powershell
git add -- web/assets/css/gis-one-map.css tests/gis-fire-dashboard.test.mjs
git commit -m "style: fit GIS fire dashboard into three-row rails"
```

## Final Verification

- [ ] Run `node --test tests/gis-fire-dashboard.test.mjs` and confirm all tests pass.
- [ ] Run `git diff --check` and confirm it produces no output.
- [ ] Review `git diff -- web/pages/gis/one-map.html web/assets/css/gis-one-map.css tests/gis-fire-dashboard.test.mjs` to confirm no unrelated GIS panels changed.
- [ ] Leave the local server running and provide its URL for user review.
