# GIS 设备巡检看板实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 改造现有 `gis-inspection.html` 为具备六个巡检模块和统一数据适配层的 GIS 设备巡检看板。

**Architecture:** 保留现有单文件页面和 GIS 公共样式，在页面脚本中增加 `inspectionApi` 与 `inspectionState`。接口优先读取项目已有模拟服务，失败时回退内置数据；渲染函数按模块拆分，事件委托统一处理时间、筛选、分页和抽屉。

**Tech Stack:** HTML、CSS、原生 JavaScript、现有 Tailwind CDN、Font Awesome、SVG 图表、现有 Playwright 测试工具。

---

### Task 1: 建立巡检数据适配层与页面状态

**Files:**
- Modify: `web/pages/gis/gis-inspection.html`（脚本区与页面主内容）
- Test: `tests/gis-inspection-dashboard.test.mjs`

- [ ] **Step 1: 写测试断言页面模块和时间切换入口存在**

```js
import { test, expect } from '@playwright/test';
test('inspection dashboard exposes six modules and period tabs', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/web/pages/gis/gis-inspection.html');
  await expect(page.locator('[data-inspection-module="overview"]')).toBeVisible();
  await expect(page.locator('[data-period="day"]')).toBeVisible();
  await expect(page.locator('[data-period="month"]')).toBeVisible();
  await expect(page.locator('[data-period="year"]')).toBeVisible();
});
```

- [ ] **Step 2: 运行测试确认当前页面缺少目标模块标记**

Run: `npx playwright test tests/gis-inspection-dashboard.test.mjs --project=chromium`
Expected: FAIL because the current page does not expose the new module selectors.

- [ ] **Step 3: 添加状态和 API 适配器**

在现有页面脚本中定义 `inspectionState = { period: 'day', system: '', zone: '', status: '', page: 1, pageSize: 8 }`，以及 `inspectionApi` 的六个方法。每个方法先检查 `window.inspectionService` 对应函数，捕获异常后返回页面内的 `INSPECTION_FALLBACK` 数据；所有返回值使用 Promise，方便后续替换真实接口。

- [ ] **Step 4: 运行测试确认页面可以加载数据适配器**

Run: `npx playwright test tests/gis-inspection-dashboard.test.mjs --project=chromium`
Expected: module selector test may still fail on markup, but browser console has no `inspectionApi is not defined` error.

### Task 2: 实现六个模块布局与状态交互

**Files:**
- Modify: `web/pages/gis/gis-inspection.html`

- [ ] **Step 1: 添加模块容器与响应式栅格**

增加带有 `data-inspection-module` 的六个卡片：`overview`、`systems`、`zones`、`devices`、`analysis`、`efficiency`；使用现有 `.gis-card` 和 12 栏 CSS，移动端改为单列。

- [ ] **Step 2: 实现概况、系统、分区和时效渲染**

增加 `renderOverview`、`renderSystems`、`renderZones`、`renderEfficiency`，分别渲染三档时间指标、十个系统、分区卡片和半环 SVG 仪表；所有数字从 API 返回值读取，不在模板中重复计算。

- [ ] **Step 3: 实现设备表、筛选、分页和详情抽屉**

增加 `renderDevices`、`bindDeviceFilters`、`openInspectionDetail`。系统行和分区卡片写入 `data-system`、`data-zone`，点击后更新状态并重新请求设备列表；分页按钮更新 `inspectionState.page`；设备行点击使用既有 GIS 抽屉组件展示详情。

- [ ] **Step 4: 实现状态分析组合图与 tooltip**

增加 `renderAnalysis`，使用现有页面的 SVG 风格生成柱状图、完成率折线、图例和悬停提示；根据 `day/month/year` 读取不同横轴数据。

- [ ] **Step 5: 添加时间切换和统一刷新流程**

实现 `refreshInspectionDashboard()`，并行请求六类数据，局部显示加载态，失败模块显示重试按钮；时间按钮设置 `aria-pressed`，清除分页和筛选后调用刷新。

### Task 3: 样式、可用性与回归验证

**Files:**
- Modify: `web/pages/gis/gis-inspection.html`
- Modify: `tests/gis-inspection-dashboard.test.mjs`

- [ ] **Step 1: 补齐状态色、表格滚动和窄屏布局**

复用现有 CSS 变量，确保红/黄/青状态同时显示文字，表格容器可横向滚动，卡片和图表在 390px 宽度下不溢出。

- [ ] **Step 2: 添加交互测试**

测试今日切换到本月、系统筛选、分页和设备详情抽屉；断言十个系统名称存在以及概况数值发生更新。

- [ ] **Step 3: 运行测试与页面检查**

Run: `npx playwright test tests/gis-inspection-dashboard.test.mjs --project=chromium`
Expected: all tests pass.

Run: `npx playwright test tests/gis-inspection-dashboard.test.mjs --project=chromium --screenshot=on`
Expected: desktop and mobile screenshots show all six modules with no blank SVG or overlapping text.

- [ ] **Step 4: 提交实现变更**

```bash
git add web/pages/gis/gis-inspection.html tests/gis-inspection-dashboard.test.mjs
git commit -m "feat: redesign GIS device inspection dashboard"
```
