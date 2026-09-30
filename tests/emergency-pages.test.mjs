import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pages = ["dispatch", "events", "plans", "resources", "personnel", "calls"];

test("menu exposes emergency management as a top-level item", async () => {
  const source = await read("app/config/menu.js");
  assert.match(source, /key:\s*"emergency"[\s\S]*label:\s*"应急管理"/);
  for (const page of pages) assert.match(source, new RegExp(`emergency\\.${page}`));
});

test("sidebar provides an emergency navigation icon", async () => {
  const source = await read("app/components/sidebar.js");
  assert.match(source, /emergency:\s*['"][\s\S]*?<path/);
});

for (const page of pages) {
  test(`${page} page uses the shared app shell`, async () => {
    const source = await read(`web/pages/emergency/${page}.html`);
    assert.match(source, /class="app-shell"/);
    assert.match(source, new RegExp(`data-menu-key="emergency\\.${page}"`));
    assert.match(source, /emergency-data\.js/);
    assert.match(source, /emergency-common\.js/);
  });
}
