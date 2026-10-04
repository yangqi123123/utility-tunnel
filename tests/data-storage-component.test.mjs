import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/components/data-storage.js", import.meta.url), "utf8");

test("component source contains the shared rendering and validation contract", () => {
  for (const name of ["renderDeviceRows", "openDeviceDetail", "renderRealtimeMetrics", "renderHistoryRows", "validateHistoryRange", "saveArchiveConfig"]) {
    assert.match(source, new RegExp(`function\\s+${name}`));
  }
  assert.match(source, /data-detail-tab/);
  assert.match(source, /data-metric-detail|data-reading-detail/);
});
