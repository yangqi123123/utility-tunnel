import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/data/electronic-patrol.js", import.meta.url), "utf8");

test("electronic patrol store exposes third-party records", () => {
  const window = {};
  vm.runInNewContext(source, { window, globalThis: window });
  const store = window.ELECTRONIC_PATROL_STORE;
  assert.ok(store.records.length >= 8);
  assert.ok(store.records.some((record) => record.result === "异常"));
  assert.ok(store.records.every((record) => record.id && record.person && record.point && record.patrolAt && record.source && record.syncedAt));
  assert.notEqual(store.getRecords(), store.records);
});
