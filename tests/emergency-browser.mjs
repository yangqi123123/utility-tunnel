import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const storeSource = await readFile(new URL("../app/data/emergency-data.js", import.meta.url), "utf8");
const pageRoot = new URL("../web/pages/emergency/", import.meta.url);

function loadStore() {
  const values = new Map();
  const window = { localStorage: { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key), clear: () => values.clear() } };
  vm.runInNewContext(storeSource, { window, globalThis: window, console, Date, Math, JSON });
  return window.EMERGENCY_STORE;
}

test("emergency pages expose the cross-page workflow contract", async () => {
  const pages = ["dispatch", "events", "plans", "resources", "personnel", "calls"];
  for (const page of pages) {
    const source = await readFile(new URL(`${page}.html`, pageRoot), "utf8");
    assert.match(source, /emergency-data\.js/);
    assert.match(source, /emergency-common\.js/);
    assert.match(source, new RegExp(`emergency\\.${page}`));
  }
  const dispatch = await readFile(new URL("dispatch.html", pageRoot), "utf8");
  assert.match(dispatch, /dispatchMap/);
  assert.match(dispatch, /emergency-map\.js/);
  assert.match(dispatch, /data-dispatch-action="circle-select"/);
  const calls = await readFile(new URL("calls.html", pageRoot), "utf8");
  assert.match(calls, /callBody/);
  assert.match(calls, /emergency-calls\.js/);
});

test("dispatch workflow persists event, resource, and call state", () => {
  const store = loadStore();
  store.reset();
  const event = store.getEvent("EVT-20260930-001");
  const plan = store.matchPlans(event)[0];
  assert.equal(plan.planId, "PLAN-GAS-P1");
  store.saveEvent({ ...event, planId: plan.planId });
  store.transitionEvent(event.eventId, "已确认", "调度台确认事件");
  store.lockResource(event.eventId, "R-001", 1);
  const call = store.logCall({ eventId: event.eventId, callerId: "P-001", calleeIds: ["P-002", "P-003"], type: "群呼", source: "调度台", result: "已接通" });
  assert.equal(store.getResource("R-001").available, 4);
  assert.equal(store.listCalls({ eventId: event.eventId })[0].callId, call.callId);
  assert.ok(store.getEvent(event.eventId).timeline.some((item) => item.refId === call.callId));
});
