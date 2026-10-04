import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/components/electronic-patrol.js", import.meta.url), "utf8");

test("electronic patrol component contains list, filter, drawer, and export contracts", () => {
  for (const name of ["renderRecords", "filterRecords", "openPatrolDetail", "showExportFeedback"]) {
    assert.match(source, new RegExp(`function\\s+${name}`));
  }
  assert.match(source, /data-view-patrol/);
  assert.match(source, /openAppDrawer/);
  assert.match(source, /record-result/);
});
