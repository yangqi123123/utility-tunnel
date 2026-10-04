import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pages = [
  ["standard-works", "inspection.standard-works", "标准作业", "standardWorksBody"],
  ["plans", "inspection.plans", "巡检计划", "plansBody"],
  ["tasks", "inspection.tasks", "巡检任务", "tasksBody"],
];

test("menu exposes device inspection before emergency management", async () => {
  const source = await read("app/config/menu.js");
  const inspectionIndex = source.indexOf('key: "inspection"');
  const emergencyIndex = source.indexOf('key: "emergency"');
  assert.ok(inspectionIndex >= 0);
  assert.ok(emergencyIndex >= 0);
  assert.ok(inspectionIndex < emergencyIndex);
  assert.match(source, /inspection\.standard-works/);
  assert.match(source, /inspection\.plans/);
  assert.match(source, /inspection\.tasks/);
});

test("inspection data exposes the required fixture collections", async () => {
  const source = await read("app/data/inspection-data.js");
  for (const name of ["standardWorks", "inspectionItems", "plans", "tasks", "devices"]) assert.match(source, new RegExp(`\\b${name}\\b`));
  assert.match(source, /Array\.from\(\{ length: 10 \}/);
});

test("sidebar provides an inspection navigation icon", async () => {
  const source = await read("app/components/sidebar.js");
  assert.match(source, /inspection:\s*['"][\s\S]*?<path/);
});

for (const [page, key, title, bodyId] of pages) {
  test(`${page} page uses the shared inspection shell`, async () => {
    const source = await read(`web/pages/inspection/${page}.html`);
    assert.match(source, /class="app-shell"/);
    assert.match(source, new RegExp(`data-menu-key="${key.replace(".", "\\.")}"`));
    assert.match(source, new RegExp(`<title>${title}`));
    assert.match(source, /inspection\.css/);
    assert.match(source, /inspection-data\.js/);
    assert.match(source, /inspection\.js/);
    assert.match(source, new RegExp(`id="${bodyId}"`));
  });
}
