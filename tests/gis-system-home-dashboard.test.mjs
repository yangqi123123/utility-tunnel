import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = () => readFile(new URL("../web/pages/gis/one-map.html", import.meta.url), "utf8");
const styles = () => readFile(new URL("../web/assets/css/gis-one-map.css", import.meta.url), "utf8");
const videoPage = () => readFile(new URL("../web/pages/monitoring/video-monitor.html", import.meta.url), "utf8");

test("GIS system home renders the six requested dashboard modules", async () => {
  const html = await page();
  for (const title of ["设备概览", "运行状态总览", "环境参数总览", "报警趋势", "报警状态统计", "视频监控"]) {
    assert.match(html, new RegExp(title));
  }
  assert.match(html, /data-gis-tab="0"[^>]*>[\s\S]*?<span>综合总览<\/span>/);
  assert.equal((html.match(/\['视频','fa-video'/g) || []).length, 1);
  assert.match(html, /data-gis-global-video/);
  assert.match(html, /video-monitor\.html\?embedded=1/);
  assert.match(html, /gisDeviceModalMask/);
  assert.match(html, /data-gis-device-tab="info"/);
  assert.match(html, /openDeviceDetail\(p\)/);
  assert.match(html, /device-monitor-data\.js/);
  assert.match(html, /historyTab\.hidden=!!current\.video/);
  assert.doesNotMatch(html, /gis-home-device-image/);
  assert.match(html, /gis-home-trend-tooltip/);
  assert.match(html, /mouseenter/);
  assert.match(html, /gis-home-system-track/);
});

test("global monitoring uses a query-scoped embedded layout", async () => {
  const html = await videoPage();
  assert.match(html, /get\("embedded"\) === "1"/);
  assert.match(html, /video-monitor-embedded #app-sidebar/);
  assert.match(html, /video-monitor-embedded #app-header/);
  assert.doesNotMatch(html, /<body class="[^"]*video-monitor-embedded/);
});

test("alarm trend exposes day, month, and year data ranges", async () => {
  const html = await page();
  for (const period of ["day", "month", "year"]) assert.match(html, new RegExp(`data-gis-period="${period}"`));
  assert.match(html, /length:24/);
  assert.match(html, /length:31/);
  assert.match(html, /length:12/);
  assert.match(html, /单位：次/);
});

test("system-home-only styles do not broaden to other GIS tabs", async () => {
  const css = await styles();
  assert.match(css, /#gisPanel0 \.gis-home-float/);
  assert.match(css, /#gisPanel0 \.gis-float-left \.gis-card-sub/);
  assert.match(css, /#gisPanel0 \.gis-home-trend-svg \.axis-label[^}]*font-size:12px/);
  assert.match(css, /#gisPanel0 \.gis-float-left\.gis-home-float[^}]*grid-template-rows:150px 260px/);
  assert.match(css, /#gisPanel0 \.gis-home-system-list[^}]*overflow-y:auto/);
  assert.match(css, /\.gis-video-modal/);
});
