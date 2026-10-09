import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const oneMap = () => readFile(new URL("../web/pages/gis/one-map.html", import.meta.url), "utf8");
const styles = () => readFile(new URL("../web/assets/css/gis-one-map.css", import.meta.url), "utf8");
const records = () => readFile(new URL("../web/pages/monitoring/pedestrian-record.html", import.meta.url), "utf8");

test("security tab renders requested modules and camera metrics", async () => {
  const html = await oneMap();
  for (const text of [
    "视频设备概览",
    "摄像机总数",
    "433",
    "枪式摄像机",
    "132",
    "半球摄像机",
    "290",
    "球型摄像机",
    "11",
    "门禁系统",
    "视频监控系统",
    "系统告警记录",
    "关键区域监控",
  ]) {
    assert.match(html, new RegExp(text));
  }
  assert.match(html, /data-security-access-records/);
  assert.match(html, /pedestrian-record\.html\?embedded=1/);
  assert.match(html, /gis-security-video-stat-cards/);
  assert.equal((html.match(/gis-security-donut /g) || []).length, 2);
  assert.match(html, /data-security-global-video/);
  assert.match(html, /#gisPanel0 \[data-gis-global-video\]/);
  assert.equal((html.match(/accessRecords=\[/g) || []).length, 1);
  assert.equal((html.match(/\['/g) || []).filter((value) => value === "['").length >= 7, true);
});

test("security titles remove subtitle text and remain panel scoped", async () => {
  const html = await oneMap();
  const css = await styles();
  assert.match(html, /panel\.querySelectorAll\('\.gis-card-sub'\)/);
  assert.match(css, /#gisPanel3 \.gis-security-rail/);
});

test("pedestrian records embed mode hides only the shared shell", async () => {
  const html = await records();
  assert.match(html, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(html, /get\("embedded"\) === "1"/);
  assert.match(html, /pedestrian-record-embedded #app-sidebar/);
  assert.match(html, /pedestrian-record-embedded #app-header/);
  assert.doesNotMatch(html, /<body class="[^"]*pedestrian-record-embedded/);
  for (const action of ["reset", "search", "export"]) {
    assert.match(html, new RegExp(`data-action="${action}"`));
  }
});
