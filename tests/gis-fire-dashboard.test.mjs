import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../web/pages/gis/one-map.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../web/assets/css/gis-one-map.css", import.meta.url), "utf8");
const start = html.indexOf('<div class="gis-panel " id="gisPanel2"');
const end = html.indexOf('<div class="gis-panel " id="gisPanel3"', start);
const panel = html.slice(start, end);
const enhancementStart = html.indexOf("/* fire dashboard enhancement */");
const enhancementEnd = html.indexOf("</script>", enhancementStart);
const dashboard = html.slice(enhancementStart, enhancementEnd);

test("fire dashboard contains the approved six cards in rail order", () => {
  const expected = [
    "消防设备运行统计",
    "消防设施台账",
    "分区消防保障状态",
    "消防设备巡检",
    "消防设备巡检状态分析",
    "设备报警",
  ];
  const titles = [...dashboard.matchAll(/<h3>([^<]+)<\/h3>/g)]
    .map((match) => match[1])
    .filter((title) => expected.includes(title));

  assert.deepEqual(titles, expected);
});

test("fire dashboard removes unsupported FAS and electrical measurements", () => {
  for (const label of [
    "火灾报警统计",
    "FAS 实时报警列表",
    "电气火灾监控",
    "剩余电流",
    "故障电弧",
  ]) {
    assert.equal(dashboard.includes(label), false, label);
  }
});

test("fire dashboard exposes supported operational fields and scoped styles", () => {
  for (const label of [
    "在线",
    "离线",
    "报警",
    "有效期",
    "待巡检",
    "设备异常",
    "应急事件",
    "逾期巡检",
    "报警总数",
    "未处理",
    "已处理",
  ]) {
    assert.ok(dashboard.includes(label), label);
  }
  assert.ok(panel.includes('id="gisMap2"'), "fire map remains present");
  assert.match(css, /#gisPanel2 \.gis-fire-rail/);
  assert.match(css, /#gisPanel2 \.gis-fire-alarm/);
});

test("fire dashboard removes the operation-exception card", () => {
  assert.equal(dashboard.includes("消防设备运行异常"), false);
});

test("fire inspection exposes seven metrics and five table columns", () => {
  for (const label of [
    "本月任务",
    "待巡检",
    "巡检中",
    "验收中",
    "已完成",
    "已关闭",
    "已逾期",
  ]) {
    assert.ok(dashboard.includes(label), label);
  }
  for (const heading of ["任务", "设备", "计划执行", "状态", "逾期状态"]) {
    assert.ok(dashboard.includes(`<th>${heading}</th>`), heading);
  }
});

test("inspection analysis supports period switching and completion rate", () => {
  for (const period of ["day", "month", "year"]) {
    assert.ok(dashboard.includes(`${period}:`), period);
  }
  assert.ok(dashboard.includes("data-fire-period"));
  assert.ok(dashboard.includes("renderFireInspectionChart"));
  assert.ok(dashboard.includes("closed"));
  assert.ok(dashboard.includes("completed"));
  assert.match(css, /#gisPanel2 \.gis-fire-chart/);
  assert.match(css, /#gisPanel2 \.gis-fire-zone\.overdue/);
});
