import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("menu exposes data storage with three child routes", async () => {
  const source = await read("app/config/menu.js");
  assert.match(source, /key:\s*["']data-storage["'][\s\S]*label:\s*["']数据存储["']/);
  for (const key of ["realtime", "history", "archive-config"]) assert.match(source, new RegExp(`data-storage\\.${key}`));
});

for (const page of ["realtime", "history", "archive-config"]) {
  test(`${page} page uses the shared app shell`, async () => {
    const source = await read(`web/pages/data-storage/${page}.html`);
    assert.match(source, /class="app-shell"/);
    assert.match(source, new RegExp(`data-menu-key="data-storage\\.${page}"`));
    assert.match(source, /data-storage\.js/);
    assert.match(source, /data-storage-mode=/);
  });
}

test("realtime and history pages expose device list and filters", async () => {
  const realtime = await read("web/pages/data-storage/realtime.html");
  const history = await read("web/pages/data-storage/history.html");
  for (const source of [realtime, history]) {
    assert.match(source, /data-system-filter/);
    assert.match(source, /id="deviceTable"/);
  }
  assert.match(history, /data-history-start/);
  assert.match(history, /data-history-end/);
});

test("archive page exposes editable retention and scheduling fields", async () => {
  const source = await read("web/pages/data-storage/archive-config.html");
  for (const field of ["retentionDays", "retentionUnit", "schedule", "executeAt", "cron", "retryTimes"]) assert.match(source, new RegExp(`data-archive-field="${field}"`));
  assert.match(source, /data-archive-action="save"/);
  assert.match(source, /id="archiveTaskTable"/);
});
