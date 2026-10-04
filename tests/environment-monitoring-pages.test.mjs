import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("environment monitoring route sits after video monitoring", async () => {
  const source = await read("app/config/menu.js");
  const videoIndex = source.indexOf('key: "video-monitoring"');
  const environmentIndex = source.indexOf('key: "environment-monitoring"');
  assert.ok(videoIndex >= 0 && environmentIndex > videoIndex);
  assert.match(source, /environment-monitor\.html/);
});

test("environment monitoring page uses the shared shell and third-party read-only markers", async () => {
  const source = await read("web/pages/monitoring/environment-monitor.html");
  assert.match(source, /class="app-shell"/);
  assert.match(source, /data-menu-key="environment-monitoring"/);
  assert.match(source, /第三方数据已接入/);
  for (const category of ["环境质量", "通风系统", "排水系统", "照明系统", "供配电系统"]) assert.match(source, new RegExp(category));
});

test("environment monitoring page exposes filters, alerts, and detail drawer", async () => {
  const source = await read("web/pages/monitoring/environment-monitor.html");
  for (const filter of ["keyword", "category", "status", "zone"]) assert.match(source, new RegExp(`data-filter=\\"${filter}\\"`));
  assert.match(source, /id="environmentTableBody"/);
  assert.match(source, /id="alertList"/);
  assert.match(source, /window\.openAppDrawer/);
  assert.match(source, /function filteredRecords/);
});
