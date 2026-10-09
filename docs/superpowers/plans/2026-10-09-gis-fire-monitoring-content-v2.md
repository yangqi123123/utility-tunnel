# GIS Fire Monitoring V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the GIS fire-monitoring dashboard with three-state device bars, binary zone cards, a complete inspection task module, an interactive inspection analysis chart, and an environment-aligned alarm card.

**Architecture:** Continue using the existing `fire dashboard enhancement` script to rebuild only `#gisPanel2` at runtime. Keep all styling scoped to `#gisPanel2`, render the mixed bar/line chart with native SVG and local period datasets, and expand the existing Node structure test to protect module order, labels, data rules, and chart interaction hooks.

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript, native SVG, Node.js built-in test runner, Codex in-app browser for visual verification.

---

## File Structure

- Modify `web/pages/gis/one-map.html`: revise the fire enhancement markup, add period datasets, SVG chart rendering, switching, and hover tooltip behavior.
- Modify `web/assets/css/gis-one-map.css`: add stacked status bars, binary zone cards, seven-metric inspection layout, mixed chart styling, and alarm-card parity rules.
- Modify `tests/gis-fire-dashboard.test.mjs`: replace V1 contract assertions with V2 content, calculation, and interaction assertions.

### Task 1: Update the V2 dashboard contract

**Files:**
- Modify: `tests/gis-fire-dashboard.test.mjs`
- Read: `web/pages/gis/one-map.html`
- Read: `web/assets/css/gis-one-map.css`

- [ ] **Step 1: Replace the six-card and field assertions**

Update the expected right rail titles and remove the V1 operation-exception title:

```js
const expected = [
  "消防设备运行统计",
  "消防设施台账",
  "分区消防保障状态",
  "消防设备巡检",
  "消防设备巡检状态分析",
  "设备报警",
];

assert.equal(dashboard.includes("消防设备运行异常"), false);
for (const label of ["在线", "离线", "报警", "待巡检", "设备异常", "应急事件", "逾期巡检"]) {
  assert.ok(dashboard.includes(label), label);
}
```

- [ ] **Step 2: Add inspection table and analysis interaction assertions**

```js
test("fire inspection exposes seven metrics and five table columns", () => {
  for (const label of ["本月任务", "待巡检", "巡检中", "验收中", "已完成", "已关闭", "已逾期"]) {
    assert.ok(dashboard.includes(label), label);
  }
  for (const heading of ["任务", "设备", "计划执行", "状态", "逾期状态"]) {
    assert.ok(dashboard.includes(`<th>${heading}</th>`), heading);
  }
});

test("inspection analysis supports period switching and completion rate", () => {
  for (const period of ["day", "month", "year"]) assert.ok(dashboard.includes(`${period}:`));
  assert.ok(dashboard.includes("data-fire-period"));
  assert.ok(dashboard.includes("renderFireInspectionChart"));
  assert.ok(dashboard.includes("closed"));
  assert.ok(dashboard.includes("completed"));
});
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run: `node --test tests/gis-fire-dashboard.test.mjs`

Expected: FAIL because the current dashboard still contains `消防设备运行异常`, lacks the analysis card, and uses only four inspection statistics.

### Task 2: Replace fire-dashboard content and add chart behavior

**Files:**
- Modify: `web/pages/gis/one-map.html:2199`
- Test: `tests/gis-fire-dashboard.test.mjs`

- [ ] **Step 1: Replace the runtime statistics and device rows**

Use three summary tiles and a stacked bar row per type:

```html
<div class="gis-fire-summary">
  <div class="gis-mini"><div class="n"><i class="dot"></i>在线</div><strong>463</strong></div>
  <div class="gis-mini"><div class="n"><i class="dot offline"></i>离线</div><strong>5</strong></div>
  <div class="gis-mini bad"><div class="n"><i class="dot"></i>报警</div><strong>5</strong></div>
</div>
<div class="gis-fire-device-row">
  <div class="gis-fire-device-meta"><span>感烟 / 感温探测器</span><b>168</b></div>
  <div class="gis-fire-stack" aria-label="在线 164，离线 2，报警 2">
    <i class="online" style="width:97.62%"></i><i class="offline" style="width:1.19%"></i><i class="alarm" style="width:1.19%"></i>
  </div>
  <div class="gis-fire-device-counts"><span>在线 164</span><span>离线 2</span><span>报警 2</span></div>
</div>
```

Repeat the complete row for every device type and ensure each row's three values sum to its total.

- [ ] **Step 2: Replace zone cards with the binary red/white rule**

```html
<div class="gis-mini gis-fire-zone">
  <div class="n"><i class="dot"></i>F0101 防火分区</div>
  <div class="gis-fire-zone-stats"><span>待巡检 <b>0</b></span><span>设备异常 <b>1</b></span><span>应急事件 <b>0</b></span><span>逾期巡检 <b>0</b></span></div>
</div>
<div class="gis-mini gis-fire-zone overdue">
  <div class="n"><i class="dot"></i>F0102 防火分区</div>
  <div class="gis-fire-zone-stats"><span>待巡检 <b>2</b></span><span>设备异常 <b>1</b></span><span>应急事件 <b>0</b></span><span>逾期巡检 <b>1</b></span></div>
</div>
```

Do not use `warn` or yellow zone cards. Keep the list vertically scrollable.

- [ ] **Step 3: Replace the right rail's first two cards**

Remove `gis-fire-exceptions`. Build `gis-fire-inspection` with seven statistic cells and a five-column table. Build `gis-fire-analysis` with period buttons and a chart host:

```html
<section class="gis-card gis-fire-card gis-fire-analysis">
  <div class="gis-card-head">
    <h3>消防设备巡检状态分析</h3>
    <div class="gis-fire-periods" role="group" aria-label="巡检状态分析时间范围">
      <button class="active" data-fire-period="day">今日</button>
      <button data-fire-period="month">本月</button>
      <button data-fire-period="year">本年</button>
    </div>
  </div>
  <div class="gis-card-body"><div class="gis-fire-chart" id="gisFireInspectionChart"><div class="gis-fire-chart-tooltip" hidden></div></div></div>
</section>
```

- [ ] **Step 4: Add the complete period datasets and SVG renderer**

Define consistent keys for every period and zone:

```js
var fireInspectionPeriods = {
  day: [
    { zone:"F0101", pending:1, inspecting:0, accepting:0, completed:2, closed:0 },
    { zone:"F0102", pending:2, inspecting:1, accepting:0, completed:1, closed:0 },
    { zone:"F0103", pending:1, inspecting:0, accepting:1, completed:1, closed:0 },
    { zone:"F0104", pending:0, inspecting:1, accepting:0, completed:2, closed:0 },
    { zone:"F0201", pending:2, inspecting:0, accepting:1, completed:0, closed:1 },
    { zone:"F0202", pending:0, inspecting:0, accepting:0, completed:2, closed:0 }
  ],
  month: [
    { zone:"F0101", pending:3, inspecting:1, accepting:1, completed:12, closed:1 },
    { zone:"F0102", pending:4, inspecting:2, accepting:1, completed:10, closed:0 },
    { zone:"F0103", pending:2, inspecting:2, accepting:2, completed:11, closed:1 },
    { zone:"F0104", pending:1, inspecting:1, accepting:1, completed:14, closed:0 },
    { zone:"F0201", pending:5, inspecting:1, accepting:1, completed:8, closed:2 },
    { zone:"F0202", pending:2, inspecting:1, accepting:0, completed:13, closed:0 }
  ],
  year: [
    { zone:"F0101", pending:8, inspecting:3, accepting:2, completed:126, closed:4 },
    { zone:"F0102", pending:10, inspecting:4, accepting:3, completed:118, closed:5 },
    { zone:"F0103", pending:7, inspecting:3, accepting:4, completed:121, closed:3 },
    { zone:"F0104", pending:5, inspecting:2, accepting:2, completed:132, closed:2 },
    { zone:"F0201", pending:12, inspecting:5, accepting:3, completed:104, closed:8 },
    { zone:"F0202", pending:6, inspecting:2, accepting:2, completed:128, closed:3 }
  ]
};
```

Implement `renderFireInspectionChart(period)` to:

1. calculate `total = pending + inspecting + accepting + completed + closed`;
2. calculate `rate = completed / (total - closed) * 100`, or `null` when the denominator is zero;
3. draw five grouped SVG bars against the left count axis;
4. draw a completion-rate polyline and points against a 0%-100% right axis, skipping null points;
5. render legend, grid lines, zone labels, and transparent hover hit areas;
6. update `.gis-fire-chart-tooltip` on pointer enter and hide it on pointer leave.

- [ ] **Step 5: Wire period buttons without touching other modules**

```js
panel.querySelectorAll('[data-fire-period]').forEach(function(button){
  button.addEventListener('click', function(){
    panel.querySelectorAll('[data-fire-period]').forEach(function(item){
      item.classList.toggle('active', item === button);
    });
    renderFireInspectionChart(button.dataset.firePeriod);
  });
});
renderFireInspectionChart('day');
```

- [ ] **Step 6: Run the focused test**

Run: `node --test tests/gis-fire-dashboard.test.mjs`

Expected: PASS for card order, labels, removed exception card, period hooks, and calculation keys. CSS selectors may still fail until Task 3.

### Task 3: Style the V2 modules and align device alarms

**Files:**
- Modify: `web/assets/css/gis-one-map.css:307`
- Test: `tests/gis-fire-dashboard.test.mjs`

- [ ] **Step 1: Replace obsolete V1 exception and task-summary rules**

Remove selectors for `.gis-fire-exceptions` and `.gis-fire-task-summary`. Add scoped styles for `.gis-fire-stack`, `.gis-fire-zone`, `.gis-fire-inspection-summary`, `.gis-fire-analysis`, `.gis-fire-periods`, `.gis-fire-chart`, and `.gis-fire-chart-tooltip`.

Use these required status colors:

```css
#gisPanel2 .gis-fire-stack .online { background:#14C9BA; }
#gisPanel2 .gis-fire-stack .offline { background:#8A93A0; }
#gisPanel2 .gis-fire-stack .alarm { background:#F53F57; }
#gisPanel2 .gis-fire-zone { border-color:var(--line); background:#fff; }
#gisPanel2 .gis-fire-zone .dot { background:var(--ok); }
#gisPanel2 .gis-fire-zone.overdue { border-color:rgba(245,63,87,.42); background:rgba(245,63,87,.06); }
#gisPanel2 .gis-fire-zone.overdue .dot { background:var(--danger); }
```

- [ ] **Step 2: Match the environment alarm geometry**

At the desktop low-height breakpoint, give the right-bottom fire alarm row the same `minmax(202px,1fr)` allocation as `#gisPanel1 .gis-float-right.gis-env-rail`. Use the same 38px summary row, 7px body gap, 52px alarm row minimum, 5px row padding, 24px level icon column, 10px title, 9px metadata, and thin scrollbar.

- [ ] **Step 3: Add chart and tooltip styling**

```css
#gisPanel2 .gis-fire-chart { position:relative; width:100%; height:100%; min-height:0; }
#gisPanel2 .gis-fire-chart svg { width:100%; height:100%; display:block; overflow:visible; }
#gisPanel2 .gis-fire-chart .grid { stroke:#E7EDF5; stroke-width:1; stroke-dasharray:3 3; }
#gisPanel2 .gis-fire-chart .rate-line { fill:none; stroke:#F59A00; stroke-width:2; }
#gisPanel2 .gis-fire-chart-tooltip { position:absolute; z-index:4; min-width:126px; padding:7px 9px; border:1px solid #DBE3EF; border-radius:4px; background:#fff; box-shadow:0 8px 22px rgba(26,28,31,.14); pointer-events:none; }
#gisPanel2 .gis-fire-chart-tooltip[hidden] { display:none; }
```

- [ ] **Step 4: Run focused and regression tests**

Run: `node --test tests/gis-fire-dashboard.test.mjs tests/gis-system-home-dashboard.test.mjs`

Expected: all tests pass.

### Task 4: Browser verification

**Files:**
- Verify: `web/pages/gis/one-map.html`
- Verify: `web/assets/css/gis-one-map.css`

- [ ] **Step 1: Reload the existing local prototype**

Open `http://127.0.0.1:8090/web/pages/gis/one-map.html`, reload, and select `消防监控`.

- [ ] **Step 2: Verify chart interaction**

Click `今日`, `本月`, and `本年`; verify bars, rate line, points, axes, and labels change. Hover each zone's chart hit area and verify the tooltip contains five status counts plus completion rate.

- [ ] **Step 3: Verify both desktop viewports**

At `1920x1080` and `1366x768`, verify six visible non-overlapping cards, readable seven-metric inspection summary, internal table/zone/alarm scrolling, intact map, and unchanged zone-band selection.

- [ ] **Step 4: Compare alarm geometry**

Measure the environment and fire alarm cards at the low-height viewport. Confirm equal card height, 38px summary row, 7px summary/list gap, matching row height, and the same scrollbar treatment.

- [ ] **Step 5: Run final static checks**

Run: `git diff --check -- web/pages/gis/one-map.html web/assets/css/gis-one-map.css tests/gis-fire-dashboard.test.mjs`

Expected: no output.

Run: `node --test tests/gis-fire-dashboard.test.mjs tests/gis-system-home-dashboard.test.mjs`

Expected: all tests pass.

## Commit Safety

The implementation files already contain user-owned uncommitted changes. Do not commit the shared HTML or CSS unless the user explicitly asks for a commit after reviewing the final diff. Commit only newly created documentation files during planning.
