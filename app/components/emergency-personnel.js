(function () {
  const ui = window.EMERGENCY_UI;
  let state = { records: [], filtered: [], page: 1, pageSize: 10, editId: "" };
  const store = () => window.EMERGENCY_STORE;
  const text = (value) => ui.escapeHtml(value || "-");
  const getRecords = () => {
    try { return Array.isArray(store()?.listPersonnel?.()) ? store().listPersonnel() : []; } catch (error) { ui.showApiError(error); return []; }
  };
  function normalize(item) {
    return { ...item, unit: item.unit || item.organization || "未分配单位", type: item.type || item.personType || "管廊运维人员", mobile: item.mobile || item.phone || "-", onlineStatus: item.onlineStatus || item.status || "离线", dispatchStatus: item.dispatchStatus || "不可调度", location: item.location || item.section || (item.longitude ? `${item.longitude}, ${item.latitude}` : "未定位"), position: item.position || item.post || "-", tags: Array.isArray(item.tags) ? item.tags : (Array.isArray(item.specialties) ? item.specialties : []) };
  }
  function metrics() {
    const records = state.records;
    const units = new Set(records.map((item) => item.unit).filter(Boolean));
    const calls = (() => { try { return store()?.listCalls?.() || []; } catch { return []; } })();
    document.getElementById("personnelMetrics").innerHTML = [
      ["在册人员", records.length, "统一通讯录"],
      ["当前在线", records.filter((item) => normalize(item).onlineStatus === "在线").length, "实时通信状态"],
      ["可调度", records.filter((item) => normalize(item).dispatchStatus === "可调度").length, "可立即派遣"],
      ["外部单位", records.filter((item) => /消防|医疗|公安|外部/.test(normalize(item).type)).length || units.size, `${units.size} 个组织单位`],
      ["今日通话", calls.filter((item) => String(item.startedAt || item.time || "").slice(0, 10) === new Date().toISOString().slice(0, 10)).length, "来自调度与通讯录"],
    ].map(([label, value, note]) => `<article class="emergency-metric"><div class="emergency-metric-label">${label}</div><div class="emergency-metric-value">${value}</div><div class="emergency-metric-note">${note}</div></article>`).join("");
  }
  function options() {
    const units = [...new Set(state.records.map((item) => normalize(item).unit).filter(Boolean))];
    const types = [...new Set(state.records.map((item) => normalize(item).type).filter(Boolean))];
    document.getElementById("personnelUnit").innerHTML = `<option value="">全部单位</option>${units.map((item) => `<option>${text(item)}</option>`).join("")}`;
    document.getElementById("personnelType").innerHTML = `<option value="">全部类型</option>${types.map((item) => `<option>${text(item)}</option>`).join("")}`;
  }
  function filtered() {
    const keyword = ui.value("personnelKeyword").toLowerCase();
    const unit = ui.value("personnelUnit"); const type = ui.value("personnelType"); const status = ui.value("personnelStatus"); const dispatch = ui.value("personnelDispatch");
    state.filtered = state.records.filter((raw) => { const item = normalize(raw); const haystack = `${item.name || ""} ${item.mobile || ""} ${item.unit || ""}`.toLowerCase(); return (!keyword || haystack.includes(keyword)) && (!unit || item.unit === unit) && (!type || item.type === type) && (!status || item.onlineStatus === status) && (!dispatch || item.dispatchStatus === dispatch); });
    const pages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize)); state.page = Math.min(state.page, pages);
  }
  function render() {
    filtered();
    const start = (state.page - 1) * state.pageSize; const rows = state.filtered.slice(start, start + state.pageSize);
    document.getElementById("personnelBody").innerHTML = rows.length ? rows.map((raw) => { const item = normalize(raw); return `<tr data-person-id="${text(item.personId)}"><td><strong>${text(item.name)}</strong></td><td>${text(item.unit)}</td><td>${text(item.type)}</td><td>${text(item.mobile)}</td><td>${ui.renderStatus(item.onlineStatus)}</td><td>${text(item.location)}</td><td>${ui.renderStatus(item.dispatchStatus)}</td><td><div class="table-actions"><button class="btn btn-ghost" type="button" data-person-action="detail" data-person-id="${text(item.personId)}">详情</button><button class="btn btn-ghost" type="button" data-person-action="edit" data-person-id="${text(item.personId)}">编辑</button><button class="btn btn-ghost" type="button" data-person-action="call" data-person-id="${text(item.personId)}">呼叫</button></div></td></tr>`; }).join("") : `<tr><td colspan="8"><div class="emergency-empty">暂无匹配人员</div></td></tr>`;
    document.getElementById("personnelCount").innerHTML = ui.renderPagination({ total: state.filtered.length, page: state.page, pageSize: state.pageSize, id: "personnelPagination" });
  }
  function refresh() { state.records = getRecords(); options(); metrics(); render(); }
  function form(item = {}) {
    const record = normalize(item);
    return `<form id="personnelForm" class="emergency-form-grid"><label class="form-field"><span class="form-label">姓名 <b class="form-required"></b></span><input class="form-control" name="name" required value="${text(record.name === "-" ? "" : record.name)}"></label><label class="form-field"><span class="form-label">手机号 <b class="form-required"></b></span><input class="form-control" name="mobile" required value="${text(record.mobile === "-" ? "" : record.mobile)}"></label><label class="form-field"><span class="form-label">所属单位 <b class="form-required"></b></span><input class="form-control" name="unit" required value="${text(record.unit === "未分配单位" ? "" : record.unit)}"></label><label class="form-field"><span class="form-label">人员类型 <b class="form-required"></b></span><select class="form-control" name="type" required>${["管廊运维人员", "电力单位值班人员", "水务单位值班人员", "燃气单位值班人员", "消防/医疗/公安", "应急指挥员", "专业抢修人员"].map((option) => `<option ${option === record.type ? "selected" : ""}>${option}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">当前状态 <b class="form-required"></b></span><select class="form-control" name="onlineStatus" required>${["在线", "离线", "忙碌", "休假"].map((option) => `<option ${option === record.onlineStatus ? "selected" : ""}>${option}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">可调度状态 <b class="form-required"></b></span><select class="form-control" name="dispatchStatus" required>${["可调度", "已调度", "不可调度"].map((option) => `<option ${option === record.dispatchStatus ? "selected" : ""}>${option}</option>`).join("")}</select></label><label class="form-field full"><span class="form-label">所在位置 <b class="form-required"></b></span><input class="form-control" name="location" required value="${text(record.location === "未定位" ? "" : record.location)}"><span class="emergency-form-help">填写管廊区段、舱室或地图定位描述</span></label><label class="form-field"><span class="form-label">部门 / 岗位</span><input class="form-control" name="position" value="${text(record.position === "-" ? "" : record.position)}"></label><label class="form-field"><span class="form-label">值班时间</span><input class="form-control" name="dutyTime" value="${text(record.dutyTime || "")}"></label></form>`;
  }
  function openForm(id = "") {
    state.editId = id;
    const item = id ? state.records.find((record) => record.personId === id) : {};
    ui.openEntityDrawer({ title: id ? "编辑应急人员" : "新增应急人员", body: form(item), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-person-save>保存人员</button>` });
  }
  function detail(id) {
    const raw = state.records.find((record) => record.personId === id) || {}; const item = normalize(raw);
    let calls = []; try { calls = (store()?.listCalls?.() || []).filter((call) => call.calleeIds?.includes(id) || call.callerId === id); } catch { /* optional store method */ }
    const pairs = [["人员编号", item.personId], ["所属单位", item.unit], ["人员类型", item.type], ["部门 / 岗位", item.position], ["手机号", item.mobile], ["座机 / 分机", item.landline || "-"], ["当前状态", item.onlineStatus], ["可调度状态", item.dispatchStatus], ["值班时间", item.dutyTime || "-"], ["所在位置", item.location], ["专业标签", item.tags.join("、") || "-"], ["最近更新", item.updatedAt || "-" ]];
    ui.openEntityDrawer({ title: `${item.name} · 人员详情`, body: `<div class="emergency-detail-grid">${pairs.map(([label, value]) => `<div class="emergency-detail-item"><span class="emergency-detail-label">${label}</span><span class="emergency-detail-value">${label.includes("状态") ? ui.renderStatus(value) : text(value)}</span></div>`).join("")}</div><div class="emergency-subsection"><h3 class="emergency-subsection-title">关联通话（${calls.length}）</h3>${calls.length ? `<div class="emergency-call-highlight">最近通话：${text(calls[0].time || calls[0].startedAt || "-")} · ${text(calls[0].type || "单呼")} · ${ui.renderStatus(calls[0].result || "未知")}</div>` : `<div class="emergency-empty">暂无通话记录</div>`}</div>`, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button><button class="btn btn-primary" type="button" data-person-action="call" data-person-id="${text(id)}">发起呼叫</button>` });
  }
  function call(id) {
    const item = normalize(state.records.find((record) => record.personId === id) || {});
    try { if (!store()?.logCall) throw new Error("通话服务尚未就绪"); const record = store().logCall({ eventId: "", callerId: "P-001", calleeIds: [id], type: "单呼", source: "应急人员", result: "已接通" }); ui.showToast(`已呼叫 ${item.name}，记录 ${record.callId}`); metrics(); } catch (error) { ui.showApiError(error); }
  }
  function save() {
    const formNode = document.getElementById("personnelForm"); if (!formNode?.reportValidity()) return;
    const data = Object.fromEntries(new FormData(formNode).entries()); data.personId = state.editId || `P-${Date.now().toString().slice(-6)}`; data.updatedAt = ui.nowText();
    try { if (!store()?.savePerson) throw new Error("人员数据服务尚未就绪"); store().savePerson(data); window.closeAppDrawer?.(); refresh(); ui.showToast(state.editId ? "人员信息已更新" : "人员已加入通讯录"); } catch (error) { ui.showApiError(error); }
  }
  function init() {
    if (!document.getElementById("personnelBody") || !ui) return;
    refresh();
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-person-action]"); if (!action) return; const type = action.dataset.personAction; const id = action.dataset.personId;
      if (type === "create") openForm(); else if (type === "edit") openForm(id); else if (type === "detail") detail(id); else if (type === "call") call(id); else if (type === "filter") { state.page = 1; render(); } else if (type === "reset") { ["personnelKeyword", "personnelUnit", "personnelType", "personnelStatus", "personnelDispatch"].forEach((field) => ui.setValue(field, "")); state.page = 1; render(); }
      if (event.target.closest("[data-person-save]")) save();
      if (event.target.closest("[data-page-prev]")) { state.page = Math.max(1, state.page - 1); render(); }
      if (event.target.closest("[data-page-next]")) { state.page += 1; render(); }
    });
    ["personnelKeyword", "personnelUnit", "personnelType", "personnelStatus", "personnelDispatch"].forEach((id) => document.getElementById(id)?.addEventListener("change", () => { state.page = 1; render(); }));
    document.getElementById("personnelKeyword")?.addEventListener("input", () => { state.page = 1; render(); });
    window.addEventListener("storage", (event) => { if (!event.key || event.key.includes("emergency")) refresh(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
