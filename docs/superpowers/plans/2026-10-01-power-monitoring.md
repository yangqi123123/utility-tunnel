# 电力监测系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有管廊监控后台新增电力监测系统菜单和运行总览页，展示第三方电力运行数据、一次系统链路、关键设备、告警与事件。

**Architecture:** 沿用 `app/config/menu.js` + `app/components/sidebar.js` 的导航配置和现有 app shell。新增独立的 `power-monitoring.html`、`power-monitoring.css` 和 `power-monitoring.js`，mock 数据放在 `app/data/power-monitoring.js`，页面仅消费展示数据，不写入第三方系统。

**Tech Stack:** 原生 HTML/CSS/JavaScript、现有 `tob-ui.css` 设计令牌、Node.js `node:test`。

---

### Task 1: Add navigation and data contract

**Files:**
- Modify: `app/config/menu.js`
- Modify: `app/components/sidebar.js`
- Create: `app/data/power-monitoring.js`
- Test: `tests/power-monitoring-pages.test.mjs`

- [ ] Add the `power-monitoring` top-level item directly after `video-monitoring`, with `overview`, `devices`, and `events` child routes pointing to `../monitoring/power-monitoring.html`.
- [ ] Add an SVG lightning/power icon path under the `power-monitoring` key in `navIcons`.
- [ ] Define `window.POWER_MONITORING_DATA` with `summary`, `systemLines`, `devices`, `alarms`, and `events` arrays. Each status object must contain a stable `key`, `label`, and `tone` (`ok`, `warn`, `alarm`, `standby`, or `recovered`).
- [ ] Add tests asserting menu order, icon presence, data keys, and the new page route.
- [ ] Run `node --test tests/power-monitoring-pages.test.mjs`; it should fail until the page is created in Task 2.

### Task 2: Build the shared app-shell page markup

**Files:**
- Create: `web/pages/monitoring/power-monitoring.html`

- [ ] Create the standard `app-shell` with `data-menu-key="power-monitoring.overview"`, shared sidebar/header mounts, `tob-ui.css`, `monitoring.css`, and `power-monitoring.css`.
- [ ] Add a header section with title, description, third-party connection badge, and update time.
- [ ] Add four metric containers (`#powerSummary`) and two-column workspace containers (`#powerSystemDiagram`, `#powerDevices`).
- [ ] Add alert and event containers (`#powerAlarms`, `#powerEvents`) with visible “查看全部” and “近 24 小时” affordances.
- [ ] Load scripts in dependency order: menu, power data, sidebar, header, drawer, power component, requirement.

### Task 3: Implement rendering and interactions

**Files:**
- Create: `app/components/power-monitoring.js`

- [ ] Render summary cards, status badges, system-line nodes with wires, devices, alarms, and events from `window.POWER_MONITORING_DATA`.
- [ ] Keep the page read-only; clicking “查看全部” should update the browser route tab title or open a lightweight drawer containing the corresponding list, but must not expose write/control actions.
- [ ] Render empty/error-safe states when a data array is missing or empty, while preserving the page grid.
- [ ] Escape user-facing data before inserting HTML.
- [ ] Bind events once on `DOMContentLoaded` and expose no global mutable state beyond the data object.

### Task 4: Style desktop and responsive states

**Files:**
- Create: `web/assets/css/power-monitoring.css`

- [ ] Use existing TOB tokens, low-radius panels, 8px spacing, semantic status colors, and medium-high data density.
- [ ] Style the system diagram as a grid of nodes and directional wires, with clear normal/attention/alarm states.
- [ ] Keep device and event rows stable in height so status changes cannot shift layout.
- [ ] At `max-width: 1100px`, collapse metrics to two columns and workspace to one column; at `max-width: 640px`, collapse metrics and event lists to one column with horizontal overflow only for the diagram when necessary.

### Task 5: Verify page and regression coverage

**Files:**
- Modify: `tests/power-monitoring-pages.test.mjs`

- [ ] Run `node --test tests/power-monitoring-pages.test.mjs tests/configuration-system.test.mjs` and confirm all pass.
- [ ] Start the existing local static server or open the page through the project entry point and verify the sidebar order, active state, diagram, devices, alarms, and events.
- [ ] Check a narrow viewport in the browser and confirm no text overlaps or clipped labels.
- [ ] Review `git diff --check` and `git status --short`; do not modify unrelated user changes.
