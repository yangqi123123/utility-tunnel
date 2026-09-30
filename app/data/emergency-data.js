(function (root, factory) {
  const store = factory(root);
  if (typeof module === "object" && module.exports) module.exports = store;
  if (root) root.EMERGENCY_STORE = store;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  const keys = {
    personnel: "emergency.personnel",
    resources: "emergency.resources",
    plans: "emergency.plans",
    events: "emergency.events",
    calls: "emergency.calls",
    dispatch: "emergency.dispatch",
  };

  const transitions = {
    "待确认": ["已确认", "误报关闭"],
    "已确认": ["处理中"],
    "处理中": ["待复核", "已升级", "处置失败"],
    "已升级": ["处理中"],
    "处置失败": ["处理中"],
    "待复核": ["已关闭", "处理中"],
  };

  const now = () => new Date().toISOString();
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const makeId = (prefix) => {
    const random = root?.crypto?.randomUUID ? root.crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
    return `${prefix}-${Date.now().toString(36)}-${random}`.toUpperCase();
  };

  const seed = {
    personnel: [
      {
        personId: "P-001", name: "周建国", unit: "管廊运维中心", department: "应急指挥部", role: "值班长",
        type: "应急指挥员", mobile: "13800001001", phone: "0551-62001001", onlineStatus: "在线", dispatchStatus: "可调度",
        dutyTime: "08:00-20:00", longitude: 117.2028, latitude: 31.8427, section: "东段 K2+300", specialties: ["综合指挥", "现场处置"], updatedAt: "2026-09-30T08:00:00.000Z",
      },
      {
        personId: "P-002", name: "李海峰", unit: "燃气管线单位", department: "抢修班", role: "燃气工程师",
        type: "燃气值班", mobile: "13800001002", phone: "0551-62001002", onlineStatus: "在线", dispatchStatus: "可调度",
        dutyTime: "00:00-24:00", longitude: 117.2054, latitude: 31.8441, section: "东段 K2+500", specialties: ["燃气", "泄漏检测"], updatedAt: "2026-09-30T08:05:00.000Z",
      },
      {
        personId: "P-003", name: "王晓玲", unit: "消防救援支队", department: "特勤中队", role: "消防员",
        type: "消防/医疗/公安", mobile: "13800001003", phone: "119", onlineStatus: "在线", dispatchStatus: "可调度",
        dutyTime: "00:00-24:00", longitude: 117.1985, latitude: 31.8398, section: "南侧消防站", specialties: ["消防", "救援"], updatedAt: "2026-09-30T08:10:00.000Z",
      },
      {
        personId: "P-004", name: "赵明远", unit: "供电有限公司", department: "配电运维部", role: "电气工程师",
        type: "电力值班", mobile: "13800001004", phone: "0551-62001004", onlineStatus: "忙碌", dispatchStatus: "已调度",
        dutyTime: "08:00-20:00", longitude: 117.2101, latitude: 31.8462, section: "北段 K3+100", specialties: ["电气", "配电"], updatedAt: "2026-09-30T08:12:00.000Z",
      },
    ],
    resources: [
      {
        resourceId: "R-001", name: "气体检测仪", category: "抢修工具", model: "GAS-9000", unit: "台", total: 6, available: 5, occupied: 1, safetyStock: 2,
        warehouse: "东段应急仓", location: "K2+300 物资柜 A-03", owner: "孙志强", expiryDate: "2029-09-30", status: "可用", longitude: 117.2018, latitude: 31.8419, updatedAt: "2026-09-30T08:00:00.000Z", usageRecords: [],
      },
      {
        resourceId: "R-002", name: "防毒面具", category: "防护装备", model: "MF-6", unit: "套", total: 20, available: 14, occupied: 6, safetyStock: 5,
        warehouse: "东段应急仓", location: "K2+300 物资柜 B-01", owner: "孙志强", expiryDate: "2028-06-30", status: "可用", longitude: 117.2018, latitude: 31.8419, updatedAt: "2026-09-30T08:00:00.000Z", usageRecords: [],
      },
      {
        resourceId: "R-003", name: "警戒带", category: "交通疏散", model: "警戒带 50m", unit: "卷", total: 30, available: 28, occupied: 2, safetyStock: 8,
        warehouse: "中心应急仓", location: "中心仓库 C-12", owner: "陈立", expiryDate: "2030-12-31", status: "可用", longitude: 117.1934, latitude: 31.8503, updatedAt: "2026-09-30T08:00:00.000Z", usageRecords: [],
      },
    ],
    plans: [
      {
        planId: "PLAN-GAS-P1", name: "燃气泄漏一级响应预案", code: "EM-GAS-P1", eventType: "燃气泄漏", level: "P1", area: "东段", triggerCondition: "可燃气体浓度超限或报警中心确认泄漏", version: 1, status: "已发布", author: "应急管理部", reviewer: "值班领导", publishedAt: "2026-09-01T09:00:00.000Z", updatedAt: "2026-09-01T09:00:00.000Z",
        steps: [],
      },
      {
        planId: "PLAN-FIRE-P1", name: "火灾事故一级响应预案", code: "EM-FIRE-P1", eventType: "火灾", level: "P1", area: "全域", triggerCondition: "烟感或温感连续报警", version: 2, status: "已发布", author: "应急管理部", reviewer: "值班领导", publishedAt: "2026-08-20T09:00:00.000Z", updatedAt: "2026-08-20T09:00:00.000Z",
        steps: [],
      },
    ],
    events: [
      {
        eventId: "EVT-20260930-001", title: "东段 K2+340 燃气泄漏", eventType: "燃气泄漏", level: "P1", source: "报警中心", sourceAlarmId: "ALARM-20260930-001", status: "待确认", alarmRule: "可燃气体浓度超限", occurredAt: "2026-09-30T08:18:00.000Z", discoveredAt: "2026-09-30T08:18:05.000Z", location: "东段 K2+340", section: "东段", chamber: "燃气舱", description: "东段燃气舱可燃气体浓度超过阈值。", planId: "PLAN-GAS-P1", ownerId: "P-001", longitude: 117.20342, latitude: 31.84318, dispatchedPersonIds: [], lockedResourceIds: [], cameraIds: [], timeline: [], updatedAt: "2026-09-30T08:18:05.000Z",
      },
    ],
    calls: [],
    dispatch: [{ eventId: "EVT-20260930-001", selectedPersonIds: [], selectedVehicleIds: [], lockedResources: [], activeStepId: null, updatedAt: "2026-09-30T08:18:05.000Z" }],
  };
  const memoryStorage = Object.create(null);

  function getStorage() {
    try { return root?.localStorage || null; } catch { return null; }
  }

  function readCollection(name) {
    const storage = getStorage();
    if (!storage) return Array.isArray(memoryStorage[name]) ? clone(memoryStorage[name]) : clone(seed[name]) || [];
    try {
      const value = JSON.parse(storage.getItem(keys[name]) || "null");
      return Array.isArray(value) ? value : clone(seed[name]) || [];
    } catch { return clone(seed[name]) || []; }
  }

  function writeCollection(name, value) {
    const storage = getStorage();
    const result = clone(value);
    if (storage) storage.setItem(keys[name], JSON.stringify(result));
    else memoryStorage[name] = result;
    return result;
  }

  function reset() {
    Object.keys(keys).forEach((name) => writeCollection(name, seed[name] || []));
    return snapshot();
  }

  function snapshot() {
    return Object.fromEntries(Object.keys(keys).map((name) => [name, readCollection(name)]));
  }

  function matches(item, filters) {
    if (!filters || typeof filters !== "object") return true;
    return Object.entries(filters).every(([key, value]) => {
      if (value == null || value === "" || (Array.isArray(value) && !value.length)) return true;
      const current = item[key];
      if (Array.isArray(value)) return value.includes(current);
      if (Array.isArray(current)) return current.some((entry) => String(entry).toLowerCase().includes(String(value).toLowerCase()));
      return String(current ?? "").toLowerCase().includes(String(value).toLowerCase());
    });
  }

  function list(name, filters) { return readCollection(name).filter((item) => matches(item, filters)).map(clone); }

  function save(name, idKey, value) {
    if (!value || typeof value !== "object") throw new TypeError("实体数据必须是对象");
    const collection = readCollection(name);
    const idPrefixes = { personId: "P", resourceId: "R", planId: "PLAN", eventId: "EVT", callId: "CALL" };
    const id = value[idKey] || makeId(idPrefixes[idKey] || idKey.replace(/Id$/, "").slice(0, 4).toUpperCase());
    const existingIndex = collection.findIndex((item) => item[idKey] === id);
    const entity = { ...(existingIndex >= 0 ? collection[existingIndex] : {}), ...clone(value), [idKey]: id, updatedAt: value.updatedAt || now() };
    if (existingIndex >= 0) collection[existingIndex] = entity; else collection.push(entity);
    writeCollection(name, collection);
    return clone(entity);
  }

  function remove(name, idKey, id) {
    const collection = readCollection(name);
    const next = collection.filter((item) => item[idKey] !== id);
    writeCollection(name, next);
    return next.length !== collection.length;
  }

  function get(name, idKey, id) { return list(name).find((item) => item[idKey] === id) || null; }

  function appendTimeline(eventId, entry) {
    const event = get("events", "eventId", eventId);
    if (!event) throw new Error(`事件不存在: ${eventId}`);
    const timelineEntry = { timelineId: makeId("TL"), at: now(), type: "操作", title: "事件更新", message: "", ...clone(entry) };
    event.timeline = Array.isArray(event.timeline) ? event.timeline : [];
    event.timeline.push(timelineEntry);
    event.updatedAt = now();
    return save("events", "eventId", event);
  }

  function getDispatch(eventId) {
    const existing = get("dispatch", "eventId", eventId);
    if (existing) return existing;
    return save("dispatch", "eventId", { eventId, selectedPersonIds: [], selectedVehicleIds: [], lockedResources: [], activeStepId: null });
  }

  function saveDispatch(value) {
    const dispatch = { selectedPersonIds: [], selectedVehicleIds: [], lockedResources: [], activeStepId: null, ...clone(value) };
    if (!dispatch.eventId) throw new Error("调度记录缺少 eventId");
    return save("dispatch", "eventId", dispatch);
  }

  function lockResource(eventId, resourceId, quantity = 1) {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("数量必须大于 0");
    const resource = get("resources", "resourceId", resourceId);
    if (!resource) throw new Error(`物资不存在: ${resourceId}`);
    if (amount > Number(resource.available || 0)) throw new Error("库存不足");
    resource.available = Number(resource.available || 0) - amount;
    resource.occupied = Number(resource.occupied || 0) + amount;
    resource.status = resource.available > 0 ? "可用" : "已占用";
    resource.updatedAt = now();
    const updated = save("resources", "resourceId", resource);
    const dispatch = getDispatch(eventId);
    dispatch.lockedResources = Array.isArray(dispatch.lockedResources) ? dispatch.lockedResources : [];
    const lock = dispatch.lockedResources.find((item) => item.resourceId === resourceId);
    if (lock) lock.quantity += amount; else dispatch.lockedResources.push({ resourceId, quantity: amount });
    saveDispatch(dispatch);
    const event = get("events", "eventId", eventId);
    if (event) {
      event.lockedResourceIds = Array.from(new Set([...(event.lockedResourceIds || []), resourceId]));
      save("events", "eventId", event);
      appendTimeline(eventId, { type: "物资", title: "锁定应急物资", refId: resourceId, message: `${resource.name} × ${amount}` });
    }
    return updated;
  }

  function releaseResource(eventId, resourceId, quantity) {
    const resource = get("resources", "resourceId", resourceId);
    if (!resource) throw new Error(`物资不存在: ${resourceId}`);
    const dispatch = getDispatch(eventId);
    const lock = (dispatch.lockedResources || []).find((item) => item.resourceId === resourceId);
    const amount = Math.min(Number(quantity || lock?.quantity || 0), Number(lock?.quantity || 0));
    if (amount <= 0) return resource;
    resource.available = Number(resource.available || 0) + amount;
    resource.occupied = Math.max(0, Number(resource.occupied || 0) - amount);
    resource.status = "可用";
    const updated = save("resources", "resourceId", resource);
    dispatch.lockedResources = (dispatch.lockedResources || []).map((item) => item.resourceId === resourceId ? { ...item, quantity: item.quantity - amount } : item).filter((item) => item.quantity > 0);
    saveDispatch(dispatch);
    const event = get("events", "eventId", eventId);
    if (event) {
      event.lockedResourceIds = (event.lockedResourceIds || []).filter((id) => id !== resourceId || dispatch.lockedResources.some((item) => item.resourceId === resourceId));
      save("events", "eventId", event);
      appendTimeline(eventId, { type: "物资", title: "释放应急物资", refId: resourceId, message: `${resource.name} × ${amount}` });
    }
    return updated;
  }

  function transitionEvent(eventId, status, message = "") {
    const event = get("events", "eventId", eventId);
    if (!event) throw new Error(`事件不存在: ${eventId}`);
    if (event.status !== status && !(transitions[event.status] || []).includes(status)) throw new Error(`不允许从${event.status}变更为${status}`);
    event.status = status;
    if (status === "已关闭" || status === "误报关闭") event.closedAt = now();
    const updated = save("events", "eventId", event);
    return appendTimeline(eventId, { type: "状态", title: `事件状态变更为${status}`, message });
  }

  function matchPlans(eventOrId) {
    const event = typeof eventOrId === "string" ? get("events", "eventId", eventOrId) : eventOrId;
    if (!event) return [];
    return list("plans").filter((plan) => plan.status === "已发布").map((plan) => {
      let score = 0;
      if (plan.eventType && plan.eventType === event.eventType) score += 4;
      if (plan.level && plan.level === event.level) score += 2;
      if (plan.area && (plan.area === "全域" || plan.area === event.section || String(event.location || "").includes(plan.area))) score += 1;
      return { ...plan, matchScore: score };
    }).filter((plan) => plan.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
  }

  function logCall(input = {}) {
    const callerId = input.callerId || "P-001";
    const calleeIds = Array.isArray(input.calleeIds) ? input.calleeIds : input.calleeId ? [input.calleeId] : [];
    const caller = get("personnel", "personId", callerId);
    const callees = calleeIds.map((id) => get("personnel", "personId", id)).filter(Boolean);
    const call = {
      callId: input.callId || makeId("CALL"), eventId: input.eventId || "", eventNo: input.eventNo || "", callerId, calleeIds,
      callerName: input.callerName || caller?.name || callerId, calleeNames: input.calleeNames || callees.map((person) => person.name),
      callerUnit: input.callerUnit || caller?.unit || "", calleeUnits: input.calleeUnits || callees.map((person) => person.unit),
      type: input.type || "单呼", source: input.source || "应急调度台", startedAt: input.startedAt || now(), connectedAt: input.connectedAt || (input.result === "已接通" ? now() : ""), endedAt: input.endedAt || "", durationSeconds: Number(input.durationSeconds || 0), result: input.result || "已接通", recordingStatus: input.recordingStatus || "Mock", planStepId: input.planStepId || "", operatorId: input.operatorId || callerId,
    };
    const saved = save("calls", "callId", call);
    if (saved.eventId && get("events", "eventId", saved.eventId)) appendTimeline(saved.eventId, { type: "通话", title: `${saved.type}通信`, refId: saved.callId, message: `${saved.callerName} → ${saved.calleeNames.join("、") || "未指定对象"}（${saved.result}）` });
    return saved;
  }

  const store = {
    keys,
    seed: clone(seed),
    reset,
    snapshot,
    listPersonnel: (filters) => list("personnel", filters),
    savePerson: (value) => save("personnel", "personId", value),
    getPerson: (id) => get("personnel", "personId", id),
    removePerson: (id) => remove("personnel", "personId", id),
    listResources: (filters) => list("resources", filters),
    saveResource: (value) => save("resources", "resourceId", value),
    getResource: (id) => get("resources", "resourceId", id),
    removeResource: (id) => remove("resources", "resourceId", id),
    lockResource,
    releaseResource,
    listPlans: (filters) => list("plans", filters),
    savePlan: (value) => save("plans", "planId", value),
    getPlan: (id) => get("plans", "planId", id),
    removePlan: (id) => remove("plans", "planId", id),
    listEvents: (filters) => list("events", filters),
    saveEvent: (value) => save("events", "eventId", value),
    getEvent: (id) => get("events", "eventId", id),
    removeEvent: (id) => remove("events", "eventId", id),
    transitionEvent,
    appendTimeline,
    matchPlans,
    matchPlan: (event) => matchPlans(event)[0] || null,
    listCalls: (filters) => list("calls", filters),
    logCall,
    getDispatch,
    saveDispatch,
  };

  return store;
});
