import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const menu = fs.readFileSync("app/config/menu.js", "utf8");
const page = fs.existsSync("web/pages/monitoring/intrusion-alarm.html")
  ? fs.readFileSync("web/pages/monitoring/intrusion-alarm.html", "utf8")
  : "";

test("视频监控下方提供入侵报警系统一级菜单", () => {
  assert.match(menu, /key: "video-monitoring"/);
  assert.match(menu, /key: "intrusion-alarm"/);
  assert.match(menu, /label: "入侵报警系统"/);
  assert.match(menu, /\.\.\/monitoring\/intrusion-alarm\.html/);
  assert.ok(menu.indexOf('key: "video-monitoring"') < menu.indexOf('key: "intrusion-alarm"'));
  assert.match(menu, /key: "video-monitoring\.replay"[\s\S]*?\n    \},\n    \{\n      key: "intrusion-alarm"/);
});

test("入侵报警页面使用共享壳层并包含核心字段", () => {
  assert.match(page, /class="app-shell"/);
  assert.match(page, /data-menu-key="intrusion-alarm"/);
  for (const field of ["报警事件", "报警主机ID", "报警类型", "报警级别", "报警时间", "入侵位置", "设备状态"]) {
    assert.match(page, new RegExp(field));
  }
  assert.match(page, /openAppDrawer/);
});
