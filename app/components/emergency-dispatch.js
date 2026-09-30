(function () {
  const store = window.EMERGENCY_STORE;
  const ui = window.EMERGENCY_UI;
  if (!store || !ui) return;

  const state = {
    eventId: new URLSearchParams(location.search).get("eventId") || "",
    activeTab: "queue",
    selectedIds: [],
    selectedShape: null,
    panelOpen: true,
    layerVisibility: { events: true, personnel: true, resources: true, vehicles: true, cameras: true },
    map: null,
  };

  const cameras = [
    { cameraId: "CAM-001", name: "东段 K2+260 全景", latitude: 31.84285, longitude: 117.2028, status: "在线", distance: "180m" },
    { cameraId: "CAM-002", name: "东段 K2+340 舱口", latitude: 31.84334, longitude: 117.20358, status: "在线", distance: "46m" },
    { cameraId: "CAM-003", name: "东段 K2+410 交叉口", latitude: 31.8439, longitude: 117.2041, status: "在线", distance: "95m" },
    { cameraId: "CAM-004", name: "东段 K2+520 出入口", latitude: 31.8446, longitude: 117.2046, status: "在线", distance: "210m" },
    { cameraId: "CAM-005", name: "西段 K2+120 风亭", latitude: 31.8418, longitude: 117.2019, status: "离线", distance: "260m" },
  ];

  function allEvents() { return store.listEvents?.() || []; }
  function currentEvent() { return store.getEvent?.(state.eventId) || allEvents()[0]; }
  function ensureEvent() { const event = currentEvent(); if (event && state.eventId !== event.eventId) state.eventId = event.eventId; return event; }
  function people() { return store.listPersonnel?.() || []; }
  function resources() { return store.listResources?.() || []; }
  function selectedPeople() { return people().filter((item) => state.selectedIds.includes(item.personId)); }

  function renderCommandBar() {
    const event = ensureEvent();
    const target = document.getElementById("dispatchCommandBar");
    if (!target) return;
    target.innerHTML = `<div class="dispatch-command-left"><span class="dispatch-eyebrow">应急管理 / 应急调度台</span><select class="form-control dispatch-event-select" data-dispatch-field="event"><option value="">请选择事件</option>${allEvents().map((item) => `<option value="${ui.escapeHtml(item.eventId)}" ${item.eventId === event?.eventId ? "selected" : ""}>${ui.escapeHtml(item.eventId)} · ${ui.escapeHtml(item.title)}</option>`).join("")}</select>${event ? `<span class="status-tag ${ui.statusClass(event.level)}">${ui.escapeHtml(event.level)}</span><span class="dispatch-event-status">${ui.escapeHtml(event.status)}</span>` : ""}</div><div class="dispatch-command-right"><span class="dispatch-live-dot"></span><span>实时数据已连接</span><button class="btn btn-secondary" type="button" data-dispatch-action="refresh"><i class="fa-solid fa-rotate"></i>刷新</button></div>`;
  }

  function renderLayerPanel() {
    const target = document.getElementById("dispatchLayerPanel");
    if (!target) return;
    const entries = [{ key: "events", label: "事件", count: allEvents().length, color: "danger" }, { key: "personnel", label: "人员", count: people().length, color: "primary" }, { key: "vehicles", label: "车辆", count: 2, color: "primary" }, { key: "resources", label: "物资", count: resources().length, color: "success" }, { key: "cameras", label: "视频", count: cameras.length, color: "purple" }];
    target.innerHTML = `<div class="dispatch-panel-title"><strong>地图图层</strong><span>实时</span></div>${entries.map((item) => `<label class="dispatch-layer-option"><input type="checkbox" data-dispatch-layer="${item.key}" ${state.layerVisibility[item.key] ? "checked" : ""}><span class="dispatch-layer-dot ${item.color}"></span><span>${item.label}</span><em>${item.count}</em></label>`).join("")}<div class="dispatch-layer-note">点位每 15 秒刷新一次</div>`;
  }

  function updateMapLayers() {
    if (!state.map) return;
    const event = currentEvent();
    const eventItems = event && state.layerVisibility.events ? [event] : [];
    const personnel = state.layerVisibility.personnel ? people() : [];
    const resourceItems = state.layerVisibility.resources ? resources() : [];
    const vehicleItems = state.layerVisibility.vehicles ? [{ vehicleId: "V-001", name: "应急抢险车 01", latitude: 31.8437, longitude: 117.2042 }, { vehicleId: "V-002", name: "消防保障车 02", latitude: 31.8422, longitude: 117.2015 }] : [];
    const cameraItems = state.layerVisibility.cameras ? cameras.filter((item) => item.status === "在线") : [];
    state.map.setLayers({ events: eventItems, personnel, resources: resourceItems, vehicles: vehicleItems, cameras: cameraItems });
  }

  function renderQueue() {
    const target = document.getElementById("dispatchTabContent");
    const events = allEvents();
    target.innerHTML = `<div class="dispatch-queue"><div class="dispatch-tab-heading"><div><strong>事件队列</strong><span>当前 ${events.length} 起事件</span></div><button class="btn btn-secondary" type="button" data-dispatch-action="new-event"><i class="fa-solid fa-plus"></i>人工上报</button></div><div class="dispatch-event-rows">${events.map((item) => `<button class="dispatch-event-row ${item.eventId === state.eventId ? "active" : ""}" type="button" data-dispatch-event-id="${ui.escapeHtml(item.eventId)}"><span class="dispatch-priority ${ui.statusClass(item.level)}">${ui.escapeHtml(item.level)}</span><span class="dispatch-event-row-main"><strong>${ui.escapeHtml(item.title)}</strong><small>${ui.escapeHtml(item.eventId)} · ${ui.escapeHtml(item.location || "东段 K2+340")}</small></span><span class="status-tag ${ui.statusClass(item.status)}">${ui.escapeHtml(item.status)}</span></button>`).join("")}</div></div>`;
  }

  function renderPlan() {
    const target = document.getElementById("dispatchTabContent");
    const event = currentEvent();
    const plan = event && (store.getPlan?.(event.planId) || store.matchPlans?.(event)?.[0]);
    const steps = plan?.steps?.length ? plan.steps : ["确认事件位置", "信息通报", "人员调度", "物资调拨", "视频联动", "现场反馈", "事件关闭"].map((name, index) => ({ stepId: `mock-step-${index + 1}`, order: index + 1, name, type: name, status: index === 0 ? "执行中" : "未开始", required: true }));
    const dispatch = store.getDispatch?.(event?.eventId) || { activeStepId: steps[0]?.stepId, completedStepIds: [] };
    target.innerHTML = `<div class="dispatch-plan"><div class="dispatch-tab-heading"><div><strong>${ui.escapeHtml(plan?.name || "燃气泄漏一级响应预案")}</strong><span>${ui.escapeHtml(event?.eventId || "-")}</span></div><button class="btn btn-primary" type="button" data-dispatch-action="confirm-event" ${event?.status === "待确认" ? "" : "disabled"}>确认事件</button></div><div class="dispatch-step-list">${steps.map((step, index) => { const status = step.status || ((dispatch.completedStepIds || []).includes(step.stepId) ? "已完成" : (dispatch.activeStepId === step.stepId ? "执行中" : "未开始")); return `<div class="dispatch-step-item ${status === "执行中" ? "active" : ""}"><span class="dispatch-step-index">${index + 1}</span><div class="dispatch-step-copy"><strong>${ui.escapeHtml(step.name)}</strong><small>${ui.escapeHtml(step.type || "处置步骤")} · ${status}</small></div><div class="dispatch-step-actions">${status === "执行中" ? `<button class="btn btn-primary" type="button" data-dispatch-step="complete" data-step-id="${ui.escapeHtml(step.stepId)}">完成</button><button class="btn btn-secondary" type="button" data-dispatch-step="skip" data-step-id="${ui.escapeHtml(step.stepId)}">跳过</button>` : status === "已完成" ? `<span class="status-tag success">已完成</span>` : ""}</div></div>`; }).join("")}</div></div>`;
  }

  function renderSelected() {
    const target = document.getElementById("dispatchTabContent");
    const list = selectedPeople();
    target.innerHTML = `<div class="dispatch-selected"><div class="dispatch-tab-heading"><div><strong>已选调度对象</strong><span>${list.length} 人</span></div><button class="btn btn-primary" type="button" data-dispatch-action="call-selected" ${list.length ? "" : "disabled"}><i class="fa-solid fa-phone"></i> 发起群呼</button></div>${list.length ? `<div class="dispatch-selected-grid">${list.map((person) => `<div class="dispatch-selected-person"><span class="person-avatar">${ui.escapeHtml(person.name.slice(0, 1))}</span><div><strong>${ui.escapeHtml(person.name)}</strong><small>${ui.escapeHtml(person.unit || "-")} · ${ui.escapeHtml(person.mobile || person.phone || "-")}</small></div><button class="icon-btn" type="button" data-dispatch-remove-person="${ui.escapeHtml(person.personId)}" aria-label="移除人员"><i class="fa-solid fa-xmark"></i></button></div>`).join("")}</div>` : `<div class="empty-state compact"><i class="fa-solid fa-users"></i><span>请在地图上圈选人员，或从事件预案步骤进入调度</span></div>`}</div>`;
  }

  function renderVideo() {
    const target = document.getElementById("dispatchTabContent");
    target.innerHTML = `<div class="dispatch-video"><div class="dispatch-tab-heading"><div><strong>附近视频监控</strong><span>按事件点距离排序</span></div><button class="btn btn-secondary" type="button" data-dispatch-action="open-video"><i class="fa-solid fa-video"></i> 视频监控</button></div><div class="dispatch-video-grid">${cameras.slice(0, 4).map((camera) => `<div class="dispatch-video-card"><div class="dispatch-video-preview"><i class="fa-solid fa-video"></i><span>${camera.status === "在线" ? "实时画面 Mock" : "信号中断"}</span></div><div class="dispatch-video-meta"><strong>${ui.escapeHtml(camera.name)}</strong><span>${camera.distance} · ${camera.status}</span></div></div>`).join("")}</div></div>`;
  }

  function renderTimeline() {
    const target = document.getElementById("dispatchTabContent");
    const event = currentEvent();
    const rows = event?.timeline || [];
    target.innerHTML = `<div class="dispatch-timeline"><div class="dispatch-tab-heading"><div><strong>操作时间线</strong><span>${rows.length} 条记录</span></div></div>${rows.length ? `<div class="process">${rows.slice().reverse().map((row) => `<div class="process-item"><span class="process-dot"></span><div><div class="process-title">${ui.escapeHtml(row.action || row.title || "操作记录")}</div><div class="process-meta">${ui.escapeHtml(row.operator || "系统")} · ${ui.escapeHtml(row.time || "刚刚")}</div></div></div>`).join("")}</div>` : `<div class="empty-state compact"><i class="fa-solid fa-clock-rotate-left"></i><span>暂无处置操作</span></div>`}</div>`;
  }

  function renderTab() {
    document.querySelectorAll("[data-dispatch-tab]").forEach((tab) => tab.classList.toggle("active", tab.dataset.dispatchTab === state.activeTab));
    ({ queue: renderQueue, plan: renderPlan, selected: renderSelected, video: renderVideo, timeline: renderTimeline }[state.activeTab] || renderQueue)();
  }

  function renderSelectionBar() {
    const target = document.getElementById("dispatchSelectionBar");
    const list = selectedPeople();
    target.classList.toggle("hidden", !list.length);
    if (!list.length) { target.innerHTML = ""; return; }
    target.innerHTML = `<span>已圈选 ${list.length} 名人员</span><span class="selection-names">${list.map((person) => ui.escapeHtml(person.name)).join("、")}</span><button class="btn btn-primary" type="button" data-dispatch-action="call-selected"><i class="fa-solid fa-phone"></i> 确认群呼</button><button class="btn btn-secondary" type="button" data-dispatch-action="clear-select">取消</button>`;
  }

  function completeStep(stepId, status) {
    const event = currentEvent();
    if (!event) return;
    const dispatch = store.getDispatch?.(event.eventId) || { eventId: event.eventId, completedStepIds: [] };
    if (status === "已完成") dispatch.completedStepIds = [...new Set([...(dispatch.completedStepIds || []), stepId])];
    dispatch.activeStepId = status === "已完成" ? null : stepId;
    store.saveDispatch?.(dispatch);
    store.appendTimeline?.(event.eventId, { action: status === "已完成" ? "完成预案步骤" : "跳过预案步骤", title: stepId, operator: "当前指挥员", time: ui.nowText() });
    if (status === "已完成" && event.status === "已确认") store.transitionEvent?.(event.eventId, "处理中");
    renderPlan();
    ui.showToast(status === "已完成" ? "预案步骤已完成" : "已跳过当前步骤");
  }

  function callSelected() {
    const event = currentEvent();
    const ids = state.selectedIds.slice();
    if (!ids.length) return;
    const call = store.logCall?.({ eventId: event?.eventId || "", callerId: "P-001", calleeIds: ids, type: "群呼", source: "调度台", result: "已接通" });
    ids.forEach((id) => { const person = store.getPerson?.(id); if (person) store.savePerson?.({ ...person, dispatchStatus: "已调度" }); });
    store.appendTimeline?.(event?.eventId, { action: "发起群呼", title: `${ids.length} 名人员`, refId: call?.callId, operator: "当前指挥员", time: ui.nowText() });
    renderSelectionBar(); renderSelected(); updateMapLayers();
    ui.showToast(`已发起群呼，${ids.length} 名人员已接通`);
  }

  function selectByBounds(selection) {
    const bounds = selection?.bounds;
    if (!bounds) return;
    state.selectedIds = people().filter((person) => bounds.contains([Number(person.latitude), Number(person.longitude)])).map((person) => person.personId);
    renderSelectionBar();
    state.activeTab = "selected";
    renderTab();
  }

  function initMap() {
    const target = document.getElementById("dispatchMap");
    state.map = window.EMERGENCY_MAP?.create(target, { tileRoot: "../../assets/maps/tianditu", center: [31.84318, 117.20342], zoom: 15 });
    updateMapLayers();
    const event = currentEvent();
    if (event) state.map?.focusEvent(event);
  }

  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-dispatch-tab]");
    const action = event.target.closest("[data-dispatch-action]")?.dataset.dispatchAction;
    const row = event.target.closest("[data-dispatch-event-id]");
    const step = event.target.closest("[data-dispatch-step]");
    if (tab) { state.activeTab = tab.dataset.dispatchTab; renderTab(); return; }
    if (row) { state.eventId = row.dataset.dispatchEventId; renderCommandBar(); renderLayerPanel(); renderTab(); updateMapLayers(); state.map?.focusEvent(currentEvent()); return; }
    if (step) { completeStep(step.dataset.stepId, step.dataset.dispatchStep === "skip" ? "已跳过" : "已完成"); return; }
    if (event.target.closest("[data-dispatch-remove-person]")) { state.selectedIds = state.selectedIds.filter((id) => id !== event.target.closest("[data-dispatch-remove-person]").dataset.dispatchRemovePerson); renderSelectionBar(); renderSelected(); return; }
    if (action === "circle-select") { state.map?.startCircleSelect(selectByBounds); return; }
    if (action === "clear-select") { state.selectedIds = []; state.map?.clearSelection(); renderSelectionBar(); renderTab(); return; }
    if (action === "call-selected") { callSelected(); return; }
    if (action === "focus-event") { state.map?.focusEvent(currentEvent()); return; }
    if (action === "toggle-panel" ) { state.panelOpen = !state.panelOpen; document.getElementById("dispatchBottomPanel")?.classList.toggle("collapsed", !state.panelOpen); return; }
    if (action === "toggle-fullscreen") { document.querySelector(".dispatch-workspace")?.classList.toggle("is-fullscreen"); return; }
    if (action === "refresh") { renderCommandBar(); renderLayerPanel(); renderTab(); updateMapLayers(); ui.showToast("调度数据已刷新"); return; }
    if (action === "open-video") { location.href = "../monitoring/video-monitor.html?eventId=" + encodeURIComponent(state.eventId); return; }
    if (action === "confirm-event") { const eventItem = currentEvent(); if (eventItem) { const recommendation = store.matchPlans?.(eventItem)?.[0]; if (recommendation && !eventItem.planId) store.saveEvent?.({ ...eventItem, planId: recommendation.planId }); store.transitionEvent?.(eventItem.eventId, "已确认", "调度台确认事件"); renderCommandBar(); renderTab(); ui.showToast(recommendation ? `事件已确认，已匹配${recommendation.name}` : "事件已确认"); } }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-dispatch-layer]")) { state.layerVisibility[event.target.dataset.dispatchLayer] = event.target.checked; updateMapLayers(); }
    if (event.target.matches('[data-dispatch-field="event"]')) { state.eventId = event.target.value; renderCommandBar(); renderTab(); updateMapLayers(); state.map?.focusEvent(currentEvent()); }
  });

  document.addEventListener("DOMContentLoaded", () => { renderCommandBar(); renderLayerPanel(); initMap(); renderTab(); renderSelectionBar(); });
})();
