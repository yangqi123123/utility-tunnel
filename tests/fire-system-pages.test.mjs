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
  assert.match(source, /只读/);
  assert.match(source, /附近视频/);
  assert.doesNotMatch(source, /data-action="(start|stop|silence|configure)"/);
});

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
