(function () {
  const store = window.EMERGENCY_STORE;
  const ui = window.EMERGENCY_UI;
  if (!store || !ui) return;

  const state = { filters: { eventId: new URLSearchParams(location.search).get("eventId") || "", type: "", result: "", keyword: "" }, page: 1, pageSize: 10 };
  const calls = () => store.listCalls?.() || [];
  const people = () => store.listPersonnel?.() || [];
  const events = () => store.listEvents?.() || [];
  const personName = (id) => people().find((item) => item.personId === id)?.name || id || "-";
  const eventTitle = (id) => events().find((item) => item.eventId === id)?.title || id || "未关联事件";
  const filtered = () => calls().filter((item) => (!state.filters.eventId || item.eventId === state.filters.eventId) && (!state.filters.type || item.type === state.filters.type) && (!state.filters.result || item.result === state.filters.result) && (!state.filters.keyword || `${personName(item.callerId)} ${item.calleeIds?.map(personName).join(" ")}`.includes(state.filters.keyword)));

  function renderMetrics() {
    const list = calls();
    const connected = list.filter((item) => item.result === "已接通").length;
    const average = connected ? Math.round(list.filter((item) => item.result === "已接通").reduce((sum, item) => sum + Number(item.durationSeconds || 0), 0) / connected) : 0;
    document.getElementById("callMetrics").innerHTML = `<div class="metric-card"><span>今日通话</span><strong>${list.length}</strong><small>全部通信记录</small></div><div class="metric-card"><span>接通率</span><strong>${list.length ? Math.round((connected / list.length) * 100) : 0}%</strong><small>${connected} 条已接通</small></div><div class="metric-card"><span>平均时长</span><strong>${average}s</strong><small>仅统计已接通</small></div><div class="metric-card"><span>事件关联</span><strong>${list.filter((item) => item.eventId).length}</strong><small>可回溯事件处置</small></div>`;
  }

  function renderFilters() {
    document.getElementById("callFilters").innerHTML = `<label class="form-field"><span class="form-label">事件编号</span><select class="form-control" data-call-filter="eventId"><option value="">全部事件</option>${events().map((item) => `<option value="${ui.escapeHtml(item.eventId)}" ${state.filters.eventId === item.eventId ? "selected" : ""}>${ui.escapeHtml(item.eventId)} · ${ui.escapeHtml(item.title)}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">通话类型</span><select class="form-control" data-call-filter="type"><option value="">全部类型</option>${["单呼", "群呼", "视频呼叫", "短信", "广播"].map((item) => `<option ${state.filters.type === item ? "selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">通话结果</span><select class="form-control" data-call-filter="result"><option value="">全部结果</option>${["已接通", "未接通", "拒接", "超时", "失败"].map((item) => `<option ${state.filters.result === item ? "selected" : ""}>${item}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">人员</span><input class="form-control" data-call-filter="keyword" value="${ui.escapeHtml(state.filters.keyword)}" placeholder="姓名或单位"></label><div class="emergency-filter-actions"><button class="btn btn-secondary" type="button" data-call-action="reset">重置</button><button class="btn btn-primary" type="button" data-call-action="search">搜索</button></div>`;
  }

  function renderTable() {
    const list = filtered();
    const start = (state.page - 1) * state.pageSize;
    const rows = list.slice(start, start + state.pageSize);
    document.getElementById("callBody").innerHTML = rows.length ? rows.map((item) => `<tr><td>${ui.escapeHtml(item.startedAt || item.createdAt || "-")}</td><td><button class="table-link" type="button" data-call-event="${ui.escapeHtml(item.eventId || "")}">${ui.escapeHtml(item.eventId || "未关联")}</button></td><td>${ui.escapeHtml(personName(item.callerId))}</td><td>${ui.escapeHtml((item.calleeIds || []).map(personName).join("、") || "-")}</td><td>${ui.escapeHtml(item.type || "-")}</td><td><span class="status-tag ${ui.statusClass(item.result)}">${ui.escapeHtml(item.result || "-")}</span></td><td>${Number(item.durationSeconds || 0)}s</td><td><button class="table-action" type="button" data-call-detail="${ui.escapeHtml(item.callId)}">详情</button></td></tr>`).join("") : `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-phone-slash"></i><span>暂无通话记录</span></div></td></tr>`;
    const totalPages = Math.max(1, Math.ceil(list.length / state.pageSize));
    document.getElementById("callPagination").innerHTML = `<span>共 ${list.length} 条记录</span><button class="page-item" type="button" data-call-page="prev" ${state.page <= 1 ? "disabled" : ""}>‹</button><span class="page-item active">${state.page}</span><button class="page-item" type="button" data-call-page="next" ${state.page >= totalPages ? "disabled" : ""}>›</button>`;
  }

  function renderAll() { renderMetrics(); renderFilters(); renderTable(); }
  function callById(id) { return calls().find((item) => item.callId === id); }
  function openDetail(item) { window.openAppDrawer({ title: "通话详情", subtitle: "应急管理 · 通话记录", body: `<section class="detail-section"><h3 class="detail-title">通话信息</h3><div class="detail-grid"><div class="info-item"><span class="info-label">通话类型</span><span class="info-value">${ui.escapeHtml(item.type || "-")}</span></div><div class="info-item"><span class="info-label">通话结果</span><span class="info-value">${ui.escapeHtml(item.result || "-")}</span></div><div class="info-item"><span class="info-label">主叫人</span><span class="info-value">${ui.escapeHtml(personName(item.callerId))}</span></div><div class="info-item"><span class="info-label">被叫人</span><span class="info-value">${ui.escapeHtml((item.calleeIds || []).map(personName).join("、"))}</span></div><div class="info-item"><span class="info-label">发起来源</span><span class="info-value">${ui.escapeHtml(item.source || "-")}</span></div><div class="info-item"><span class="info-label">通话时长</span><span class="info-value">${Number(item.durationSeconds || 0)}s</span></div></div></section><section class="detail-section"><h3 class="detail-title">关联事件</h3><p class="detail-text">${ui.escapeHtml(eventTitle(item.eventId))}</p></section><section class="detail-section"><h3 class="detail-title">录音</h3><div class="call-recording-mock"><button class="icon-btn" type="button" aria-label="播放录音"><i class="fa-solid fa-play"></i></button><span>录音文件 Mock · ${Number(item.durationSeconds || 0)}s</span><div class="call-recording-progress"><span style="width:36%"></span></div></div></section>`, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>` }); }

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-call-action]")?.dataset.callAction;
    const detail = event.target.closest("[data-call-detail]");
    const eventLink = event.target.closest("[data-call-event]");
    const page = event.target.closest("[data-call-page]");
    if (action === "reset") { state.filters = { eventId: "", type: "", result: "", keyword: "" }; state.page = 1; renderAll(); }
    if (action === "search") { state.page = 1; renderTable(); }
    if (action === "export") ui.showToast("已按当前筛选条件生成通话记录文件（Mock）");
    if (detail) openDetail(callById(detail.dataset.callDetail));
    if (eventLink?.dataset.callEvent) ui.navigate("events", { eventId: eventLink.dataset.callEvent });
    if (page) { const max = Math.max(1, Math.ceil(filtered().length / state.pageSize)); state.page = page.dataset.callPage === "prev" ? Math.max(1, state.page - 1) : Math.min(max, state.page + 1); renderTable(); }
  });
  document.addEventListener("change", (event) => { if (event.target.matches("[data-call-filter]")) { state.filters[event.target.dataset.callFilter] = event.target.value; } });
  document.addEventListener("DOMContentLoaded", renderAll);
})();
