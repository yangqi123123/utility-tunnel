(function () {
  "use strict";
  const store = window.EMERGENCY_STORE;
  const ui = window.EMERGENCY_UI || {};
  if (!store) return;
  const esc = ui.escapeHtml || ((value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])));
  const toast = ui.showToast || ((message) => window.alert(message));
  let plans = [];
  let editingId = "";

  function list() { return typeof store.listPlans === "function" ? store.listPlans() : []; }
  function planById(id) { return list().find((item) => String(item.planId) === String(id)); }
  function metric(label, value, tone) { return `<article class="emergency-metric"><span class="metric-label">${label}</span><strong class="metric-value ${tone || ""}">${value}</strong></article>`; }
  function renderMetrics() {
    const all = list();
    const root = document.getElementById("planMetrics");
    if (root) root.innerHTML = [metric("预案总数", all.length), metric("已发布", all.filter((item) => item.status === "已发布").length, "success"), metric("草稿", all.filter((item) => item.status === "草稿").length, "warning"), metric("最近更新", all[0]?.updatedAt || "-")].join("");
  }
  function renderTypeOptions() {
    const select = document.querySelector('[data-plan-filter="eventType"]');
    if (!select) return;
    const current = select.value;
    const types = [...new Set(list().map((item) => item.eventType).filter(Boolean))];
    select.innerHTML = `<option value="">全部类型</option>${types.map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join("")}`;
    select.value = current;
  }
  function filtered() {
    const filter = Object.fromEntries([...document.querySelectorAll("[data-plan-filter]")].map((field) => [field.dataset.planFilter, field.value.trim()]));
    return list().filter((item) => (!filter.keyword || `${item.name} ${item.planId}`.includes(filter.keyword)) && (!filter.eventType || item.eventType === filter.eventType) && (!filter.level || item.level === filter.level) && (!filter.status || item.status === filter.status));
  }
  function render() {
    plans = filtered();
    const body = document.getElementById("planBody");
    if (!body) return;
    document.getElementById("planCount").textContent = plans.length;
    body.innerHTML = plans.length ? plans.map((item) => `<tr data-plan-id="${esc(item.planId)}"><td><strong>${esc(item.name)}</strong><div class="table-subtext">${esc(item.planId)}</div></td><td>${esc(item.eventType || "-")}</td><td><span class="status-tag status-${String(item.level || "").toLowerCase()}">${esc(item.level || "-")}</span></td><td>${esc(item.area || item.applicableArea || "全域")}</td><td>${(item.steps || []).length}</td><td>v${esc(item.version || 1)}</td><td>${ui.renderStatus ? ui.renderStatus(item.status) : `<span class="status-tag">${esc(item.status || "-")}</span>`}</td><td>${esc(item.updatedAt || item.publishAt || "-")}</td><td><button class="table-action" type="button" data-plan-action="detail" data-plan-id="${esc(item.planId)}">详情</button><button class="table-action" type="button" data-plan-action="edit" data-plan-id="${esc(item.planId)}">编辑</button>${item.status === "已发布" ? `<button class="table-action" type="button" data-plan-action="disable" data-plan-id="${esc(item.planId)}">停用</button>` : `<button class="table-action" type="button" data-plan-action="publish" data-plan-id="${esc(item.planId)}">发布</button>`}</td></tr>`).join("") : `<tr><td colspan="9" class="empty-cell">暂无预案数据</td></tr>`;
    const pager = document.getElementById("planPagination"); if (pager) pager.innerHTML = `<span>共 ${plans.length} 条记录</span><span class="page-item active">1</span>`;
  }
  function stepTemplate(step, index) {
    const value = step || {};
    const id = esc(value.stepId || `draft-${Date.now()}-${index}`);
    return `<div class="emergency-step-editor" data-step-row data-step-id="${id}"><div class="step-editor-head"><strong>步骤 <span data-step-order>${index + 1}</span></strong><div class="btn-row"><button type="button" class="table-action" data-plan-step-up title="上移">↑</button><button type="button" class="table-action" data-plan-step-down title="下移">↓</button><button type="button" class="table-action status-danger" data-plan-step-remove>删除</button></div></div><div class="form-grid-2"><label class="form-field"><span class="form-label form-required">步骤名称</span><input class="form-control" data-step-field="name" value="${esc(value.name || "")}" placeholder="如：确认事件位置"></label><label class="form-field"><span class="form-label">步骤类型</span><select class="form-control" data-step-field="type"><option ${value.type === "信息确认" ? "selected" : ""}>信息确认</option><option ${value.type === "人员通知" ? "selected" : ""}>人员通知</option><option ${value.type === "人员调度" ? "selected" : ""}>人员调度</option><option ${value.type === "物资调拨" ? "selected" : ""}>物资调拨</option><option ${value.type === "视频联动" ? "selected" : ""}>视频联动</option><option ${value.type === "广播通知" ? "selected" : ""}>广播通知</option><option ${value.type === "现场反馈" ? "selected" : ""}>现场反馈</option></select></label><label class="form-field"><span class="form-label">执行角色</span><input class="form-control" data-step-field="role" value="${esc(value.role || "应急指挥员")}"></label><label class="form-field"><span class="form-label">超时（分钟）</span><input class="form-control" type="number" min="1" data-step-field="timeoutMinutes" value="${esc(value.timeoutMinutes || 5)}"></label><label class="form-field"><span class="form-label">完成条件</span><input class="form-control" data-step-field="completionRule" value="${esc(value.completionRule || "人工确认")}"></label><label class="form-field form-check-field"><input type="checkbox" data-step-field="required" ${value.required !== false ? "checked" : ""}><span class="form-label">必须完成</span></label></div></div>`;
  }
  function drawerBody(mode, plan) {
    const item = plan || { eventType: "", level: "P2", status: "草稿", version: 1, steps: [] };
    return `<div class="form-grid-2 plan-form"><label class="form-field"><span class="form-label form-required">预案名称</span><input class="form-control" data-plan-field="name" value="${esc(item.name || "")}" placeholder="请输入预案名称"></label><label class="form-field"><span class="form-label">预案编码</span><input class="form-control" data-plan-field="planId" value="${esc(item.planId || "")}" placeholder="保存时自动生成"></label><label class="form-field"><span class="form-label form-required">事件类型</span><input class="form-control" data-plan-field="eventType" value="${esc(item.eventType || "")}" placeholder="如：燃气泄漏"></label><label class="form-field"><span class="form-label">响应等级</span><select class="form-control" data-plan-field="level"><option ${item.level === "P1" ? "selected" : ""}>P1</option><option ${item.level === "P2" ? "selected" : ""}>P2</option><option ${item.level === "P3" ? "selected" : ""}>P3</option><option ${item.level === "P4" ? "selected" : ""}>P4</option></select></label><label class="form-field form-span-2"><span class="form-label">适用区域</span><input class="form-control" data-plan-field="area" value="${esc(item.area || item.applicableArea || "全域")}" placeholder="如：东段 K2+000-K3+000"></label></div><section class="detail-section plan-step-section"><div class="card-title-row"><div><h3 class="detail-title">处置步骤</h3><p class="form-hint">按顺序配置执行角色、超时和完成条件。</p></div><button type="button" class="btn btn-secondary btn-sm" data-plan-step-add><i class="fa-solid fa-plus"></i> 添加步骤</button></div><div data-plan-steps>${(item.steps || []).map(stepTemplate).join("")}</div><div class="empty-state" data-plan-step-empty ${(item.steps || []).length ? "hidden" : ""}>尚未添加处置步骤</div></section>`;
  }
  function readForm() {
    const fields = Object.fromEntries([...document.querySelectorAll("[data-plan-field]")].map((field) => [field.dataset.planField, field.value.trim()]));
    const steps = [...document.querySelectorAll("[data-step-row]")].map((row, index) => { const read = (key) => row.querySelector(`[data-step-field="${key}"]`); return { stepId: row.dataset.stepId || `STEP-${Date.now()}-${index}`, order: index + 1, name: read("name")?.value.trim() || "", type: read("type")?.value || "信息确认", role: read("role")?.value.trim() || "应急指挥员", required: Boolean(read("required")?.checked), timeoutMinutes: Number(read("timeoutMinutes")?.value || 5), prerequisiteStepId: "", notifyPersonType: "", resourceRequirements: [], videoRadiusMeters: 300, completionRule: read("completionRule")?.value.trim() || "人工确认" }; });
    return { ...fields, steps };
  }
  function openPlanDrawer(mode, plan = null) {
    editingId = plan?.planId || "";
    const title = mode === "create" ? "新增应急预案" : mode === "detail" ? "预案详情" : "编辑应急预案";
    if (mode === "detail") {
      const steps = (plan.steps || []).map((step, index) => `<li class="timeline-item"><span class="timeline-index">${index + 1}</span><div><strong>${esc(step.name)}</strong><p>${esc(step.type)} · ${esc(step.role)} · ${step.timeoutMinutes || 5} 分钟</p></div></li>`).join("");
      window.openAppDrawer({ title, body: `<section class="detail-section"><div class="detail-grid"><div class="info-item"><span class="info-label">预案名称</span><span class="info-value">${esc(plan.name)}</span></div><div class="info-item"><span class="info-label">版本</span><span class="info-value">v${esc(plan.version || 1)}</span></div><div class="info-item"><span class="info-label">事件类型</span><span class="info-value">${esc(plan.eventType)}</span></div><div class="info-item"><span class="info-label">状态</span><span class="info-value">${esc(plan.status)}</span></div></div></section><section class="detail-section"><h3 class="detail-title">处置步骤</h3><ol class="step-timeline">${steps || '<li class="empty-cell">暂无步骤</li>'}</ol></section>`, footer: `<button class="btn btn-secondary" data-drawer-close>关闭</button><button class="btn btn-primary" data-plan-drawer-edit="${esc(plan.planId)}">编辑</button>` });
      return;
    }
    window.openAppDrawer({ title, body: drawerBody(mode, plan), footer: `<button class="btn btn-secondary" data-drawer-close>取消</button><button class="btn btn-primary" data-plan-drawer-save="${esc(mode)}">保存${mode === "create" ? "草稿" : ""}</button><button class="btn btn-primary" data-plan-drawer-publish>保存并发布</button>` });
  }
  function saveFromDrawer(publish) {
    const data = readForm();
    if (!data.name || !data.eventType) { toast("请填写预案名称和事件类型", "error"); return; }
    if (!data.steps.length || data.steps.some((step) => !step.name)) { toast("请至少添加一个完整的处置步骤", "error"); return; }
    const old = editingId ? planById(editingId) : null;
    const plan = { ...(old || {}), ...data, planId: data.planId || editingId || `PLAN-${Date.now()}`, status: publish ? "已发布" : (old?.status || "草稿"), version: old?.status === "已发布" ? (Number(old.version || 1) + 1) : Number(old?.version || 1), updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) };
    try { store.savePlan(plan); window.closeAppDrawer(); toast(publish ? "预案已发布" : "预案草稿已保存"); renderMetrics(); renderTypeOptions(); render(); } catch (error) { toast(error.message || "保存失败", "error"); }
  }
  function moveStep(button, direction) { const row = button.closest("[data-step-row]"); const sibling = direction < 0 ? row.previousElementSibling : row.nextElementSibling; if (!row || !sibling) return; if (direction < 0) row.parentElement.insertBefore(row, sibling); else row.parentElement.insertBefore(sibling, row); [...document.querySelectorAll("[data-step-row]")].forEach((item, index) => { const order = item.querySelector("[data-step-order]"); if (order) order.textContent = index + 1; }); }
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-plan-action]");
    if (action) { const type = action.dataset.planAction; const plan = planById(action.dataset.planId); if (type === "create") openPlanDrawer("create"); if (["detail", "edit"].includes(type) && plan) openPlanDrawer(type, plan); if (type === "publish" && plan) { try { store.savePlan({ ...plan, status: "已发布", version: plan.status === "已发布" ? Number(plan.version || 1) + 1 : Number(plan.version || 1), updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) }); toast("预案已发布"); renderMetrics(); render(); } catch (error) { toast(error.message, "error"); } } if (type === "disable" && plan) { store.savePlan({ ...plan, status: "已停用", updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) }); toast("预案已停用"); renderMetrics(); render(); } if (type === "reset") { document.querySelectorAll("[data-plan-filter]").forEach((field) => { field.value = ""; }); render(); } if (type === "search") render(); }
    const add = event.target.closest("[data-plan-step-add]"); if (add) { const root = document.querySelector("[data-plan-steps]"); const index = root.querySelectorAll("[data-step-row]").length; root.insertAdjacentHTML("beforeend", stepTemplate({ required: true }, index)); document.querySelector("[data-plan-step-empty]")?.classList.add("hidden"); }
    const remove = event.target.closest("[data-plan-step-remove]"); if (remove) { remove.closest("[data-step-row]")?.remove(); const rows = document.querySelectorAll("[data-step-row]"); rows.forEach((row, index) => { row.querySelector("[data-step-order]").textContent = index + 1; }); if (!rows.length) document.querySelector("[data-plan-step-empty]")?.classList.remove("hidden"); }
    const up = event.target.closest("[data-plan-step-up]"); if (up) moveStep(up, -1); const down = event.target.closest("[data-plan-step-down]"); if (down) moveStep(down, 1);
    const save = event.target.closest("[data-plan-drawer-save]"); if (save) saveFromDrawer(false); const publish = event.target.closest("[data-plan-drawer-publish]"); if (publish) saveFromDrawer(true);
    const edit = event.target.closest("[data-plan-drawer-edit]"); if (edit) { window.closeAppDrawer(); openPlanDrawer("edit", planById(edit.dataset.planDrawerEdit)); }
  });
  renderMetrics(); renderTypeOptions(); render();
})();
