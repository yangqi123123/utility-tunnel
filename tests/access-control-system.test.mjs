import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("menu exposes access control directly below video monitoring", async () => {
  const source = await read("app/config/menu.js");
  const context = { window: {} };
  vm.runInNewContext(source, context);
  const topLevel = context.window.APP_MENU;
  const access = topLevel.find((item) => item.key === "access-control");
  const subsystem = topLevel.find((item) => item.key === "subsystems");
  assert.ok(access, "access-control must be a top-level menu item");
  assert.equal(access.label, "门禁系统");
  assert.equal(access.href, "../monitoring/access-control.html");
  assert.ok(subsystem?.children?.some((item) => item.key === "video-monitoring"), "video monitoring group remains available");
});

test("access control page exposes the shared read-only record table", async () => {
  const source = await read("web/pages/monitoring/access-control.html");
  assert.match(source, /class="app-shell"/);
  assert.match(source, /data-menu-key="access-control"/);
  for (const field of ["date", "result"]) assert.match(source, new RegExp(`data-filter="${field}"`));
  for (const heading of ["序号", "姓名", "通行方式", "门禁设备", "通行位置", "通行时间", "通行方向", "通行结果"]) assert.match(source, new RegExp(heading));
  assert.match(source, /id="recordBody"/);
  assert.match(source, /data-action="export"/);
  assert.match(source, /data-view-photo/);
});
