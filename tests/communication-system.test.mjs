import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("communication system menu follows video monitoring", async () => {
  const source = await read("app/config/menu.js");
  const videoIndex = source.indexOf('key: "video-monitoring"');
  const communicationIndex = source.indexOf('key: "communication-system"');
  assert.ok(videoIndex >= 0);
  assert.ok(communicationIndex > videoIndex);
  assert.match(source, /key:\s*["']communication-system["'][\s\S]*href:\s*["']\.\.\/communication\/communication\.html["']/);
});

test("communication page exposes call, location and record workspaces", async () => {
  const source = await read("web/pages/communication/communication.html");
  for (const marker of [
    'class="app-shell"',
    'data-menu-key="communication-system"',
    'id="integrationStatus"',
    'id="callList"',
    'id="locationPin"',
    'id="recordBody"',
    'id="syncButton"',
    "drawer.js",
  ]) assert.match(source, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("communication page includes third-party data fields and interaction handlers", async () => {
  const source = await read("web/pages/communication/communication.html");
  for (const field of ["integration", "calls", "records", "renderCalls", "selectCall", "renderRecords", "openRecordDrawer"]) assert.match(source, new RegExp(`(?:const|function)\\s+${field}`));
});
