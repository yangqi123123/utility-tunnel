import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../app/data/emergency-data.js", import.meta.url), "utf8");

function loadStore() {
  const values = new Map();
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); },
  };
  const window = { localStorage };
  vm.runInNewContext(source, { window, globalThis: window, console, Date, Math, JSON });
  return { store: window.EMERGENCY_STORE, localStorage };
}

test("reset restores the approved emergency scenario", () => {
  const { store } = loadStore();
  const snapshot = store.reset();
  assert.equal(snapshot.events[0].eventId, "EVT-20260930-001");
  assert.equal(snapshot.plans[0].planId, "PLAN-GAS-P1");
  assert.equal(snapshot.personnel[0].personId, "P-001");
  assert.equal(snapshot.resources[0].resourceId, "R-001");
});

test("personnel CRUD persists through the browser storage adapter", () => {
  const { store } = loadStore();
  store.reset();
  const created = store.savePerson({ name: "测试值班员", unit: "水务单位", type: "水务值班", mobile: "13900000000", onlineStatus: "在线", dispatchStatus: "可调度" });
  assert.match(created.personId, /^P-/);
  assert.equal(store.getPerson(created.personId).name, "测试值班员");
  store.savePerson({ personId: created.personId, onlineStatus: "忙碌" });
  assert.equal(store.getPerson(created.personId).onlineStatus, "忙碌");
  assert.equal(store.removePerson(created.personId), true);
  assert.equal(store.getPerson(created.personId), null);
});

test("call logging links calls to an event timeline", () => {
  const { store } = loadStore();
  store.reset();
  const call = store.logCall({
    eventId: "EVT-20260930-001",
    callerId: "P-001",
    calleeIds: ["P-002"],
    type: "群呼",
    source: "调度台",
    result: "已接通",
  });
  assert.equal(call.eventId, "EVT-20260930-001");
  assert.ok(store.getEvent("EVT-20260930-001").timeline.some((item) => item.refId === call.callId));
  assert.equal(store.listCalls({ eventId: "EVT-20260930-001" }).length, 1);
});

test("resource locking rejects unavailable stock and updates dispatch state", () => {
  const { store } = loadStore();
  store.reset();
  const resource = store.lockResource("EVT-20260930-001", "R-001", 2);
  assert.equal(resource.available, 3);
  assert.deepEqual(store.getDispatch("EVT-20260930-001").lockedResources, [{ resourceId: "R-001", quantity: 2 }]);
  assert.ok(store.getEvent("EVT-20260930-001").timeline.some((item) => item.refId === "R-001"));
  assert.throws(() => store.lockResource("EVT-20260930-001", "R-001", 999), /库存不足/);
  store.releaseResource("EVT-20260930-001", "R-001", 1);
  assert.equal(store.getResource("R-001").available, 4);
});

test("event transitions enforce the emergency status machine and match plans", () => {
  const { store } = loadStore();
  store.reset();
  assert.equal(store.matchPlans("EVT-20260930-001")[0].planId, "PLAN-GAS-P1");
  store.transitionEvent("EVT-20260930-001", "已确认", "值班长确认");
  assert.equal(store.getEvent("EVT-20260930-001").status, "已确认");
  assert.throws(() => store.transitionEvent("EVT-20260930-001", "已关闭"), /不允许/);
});
