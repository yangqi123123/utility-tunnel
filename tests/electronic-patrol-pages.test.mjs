import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("menu exposes electronic patrol directly below video monitoring", async () => {
  const source = await read("app/config/menu.js");
  const videoIndex = source.indexOf('key: "video-monitoring"');
  const patrolIndex = source.indexOf('key: "electronic-patrol"');
  assert.ok(videoIndex >= 0);
  assert.ok(patrolIndex > videoIndex);
  assert.match(source, /key:\s*"video-monitoring"[\s\S]*?key:\s*"electronic-patrol"[\s\S]*?key:\s*"communication-system"/);
  assert.match(source, /label:\s*"电子巡更"/);
  assert.match(source, /\.\.\/monitoring\/electronic-patrol\.html/);
});

test("electronic patrol page uses the shared app shell and filters", async () => {
  const source = await read("web/pages/monitoring/electronic-patrol.html");
  assert.match(source, /class="app-shell"/);
  assert.match(source, /data-menu-key="electronic-patrol"/);
  for (const filter of ["date", "person", "point", "result"]) assert.match(source, new RegExp(`data-filter="${filter}"`));
  assert.ok(source.includes("app/components/electronic-patrol.js"));
  assert.match(source, /id="recordBody"/);
  assert.match(source, /data-action="export"/);
});
