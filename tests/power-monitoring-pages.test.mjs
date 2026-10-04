import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("电力监测系统菜单紧邻视频监控并提供三个视图", async () => {
  const source = await read("app/config/menu.js");
  const videoIndex = source.indexOf('key: "video-monitoring"');
  const powerIndex = source.indexOf('key: "power-monitoring"');
  assert.ok(videoIndex >= 0);
  assert.ok(powerIndex > videoIndex);
  assert.match(source, /key:\s*"video-monitoring"[\s\S]*?录像回放[\s\S]*?\},\s*\{\s*key:\s*"power-monitoring"/);
  assert.match(source, /power-monitoring\.overview/);
  assert.match(source, /power-monitoring\.devices/);
  assert.match(source, /power-monitoring\.events/);
});

test("侧边栏包含电力监测图标", async () => {
  const source = await read("app/components/sidebar.js");
  assert.match(source, /"power-monitoring":\s*['"][\s\S]*?<path/);
});

test("电力监测页接入共享 app shell 与独立组件", async () => {
  const page = await read("web/pages/monitoring/power-monitoring.html");
  assert.match(page, /class="app-shell"/);
  assert.match(page, /data-menu-key="power-monitoring\.overview"/);
  assert.match(page, /power-monitoring\.js/);
  assert.match(page, /id="powerSystemDiagram"/);
  assert.match(page, /id="powerDevices"/);
  assert.match(page, /id="powerAlarms"/);
  assert.match(page, /id="powerEvents"/);
});

test("电力监测数据包含一次系统和关键设备", async () => {
  const source = await read("app/data/power-monitoring.js");
  assert.match(source, /window\.POWER_MONITORING_DATA/);
  assert.match(source, /systemLines:/);
  assert.match(source, /devices:/);
  assert.match(source, /alarms:/);
  assert.match(source, /events:/);
});
