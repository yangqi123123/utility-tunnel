import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = () => readFile(new URL("../web/pages/gis/gis-environment.html", import.meta.url), "utf8");

test("environment GIS dashboard uses fixed viewport layout and internal list scrolls", async () => {
  const html = await source();
  assert.match(html, /gis-env-dashboard/);
  assert.match(html, /gis-env-matrix-scroll/);
  assert.match(html, /gis-env-alarm-scroll/);
  assert.match(html, /overflow-y:\s*auto/);
});

test("runtime monitor exposes day month year periods and percent unit", async () => {
  const html = await source();
  for (const period of ["今日", "本月", "本年"]) assert.match(html, new RegExp(period));
  assert.match(html, /实时 \/ 历史运行监测/);
  assert.match(html, /单位（％）/);
  assert.match(html, /data-runtime-period/);
});

test("runtime monitor has hover tooltip fields", async () => {
  const html = await source();
  assert.match(html, /在线/);
  assert.match(html, /离线/);
  assert.match(html, /故障率/);
  assert.match(html, /runtimeTooltip/);
});
