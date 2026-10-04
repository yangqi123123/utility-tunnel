import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/data/data-storage.js", import.meta.url), "utf8");

function loadStore() {
  const window = {};
  vm.runInNewContext(source, { window, globalThis: window, Date, JSON, Math });
  return window.DATA_STORAGE_STORE;
}

test("data storage store exposes systems, devices, readings, and archive defaults", () => {
  const store = loadStore();
  assert.ok(store.systems.length >= 3);
  assert.ok(store.devices.length >= 4);
  assert.ok(store.devices.every((device) => device.systemId && device.metrics?.length));
  assert.ok(store.historyReadings.every((item) => item.deviceId && item.metric && item.reportedAt));
  assert.equal(store.archiveConfig.retentionDays, 365);
  assert.equal(typeof store.resetArchiveConfig, "function");
});
