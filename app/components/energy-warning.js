(function () {
  const data = window.ENERGY_WARNING_DATA;
  const pageKind = document.body.dataset.energyWarningPage;
  const isRulePage = pageKind === "rules";
  const isRecordPage = pageKind === "records";
  if (!data || (!isRulePage && !isRecordPage)) return;

  const pageSize = 10;
  const state = {
    ruleTab: "electricity",
    ruleFilters: { name: "", cycle: "", status: "" },
    recordFilters: { ruleId: "", energyType: "", level: "", status: "", date: "" },
    rulePage: 1,
    recordPage: 1,
    recordExpanded: false,
    drawerStep: 1,
    drawerMode: "create",
    drawerRuleId: null,
    drawerDeviceIds: [],
  };

  const typeByKey = (key) => data.energyTypes.find((item) => item.key === key) || data.energyTypes[0];
  const ruleById = (id) => data.rules.find((item) => String(item.id) === String(id));
  const deviceById = (id) => data.devices.find((item) => item.id === id);
  const people = () => data.departments.flatMap((department) => department.people);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  }

  function levelClass(level) {
    return level.includes("一级") ? "level-1" : level.includes("二级") ? "level-2" : "level-3";
  }

  function statusClass(status) {
    return status === "已处理" ? "processed" : status === "处理中" ? "processing" : "pending";
  }

  function showToast(message) {
    let toast = document.querySelector(".warning-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "warning-toast";
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function renderPagination(targetId, total, pageKey) {
    const target = document.getElementById(targetId);
    if (!target) return;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    state[pageKey] = Math.min(state[pageKey], totalPages);
    const pageButtons = Array.from({ length: Math.min(totalPages, 6) }, (_, index) => index + 1).map((page) => `<button class="warning-page-button ${page === state[pageKey] ? "active" : ""}" type="button" data-ew-page="${page}" data-ew-page-key="${pageKey}">${page}</button>`).join("");
    target.innerHTML = `<div class="warning-pagination"><span>共 ${total} 条</span><div class="warning-pagination-controls"><button class="warning-page-button" type="button" data-ew-page="prev" data-ew-page-key="${pageKey}" ${state[pageKey] === 1 ? "disabled" : ""}>‹</button>${pageButtons}${totalPages > 6 ? "<span>...</span>" : ""}<button class="warning-page-button" type="button" data-ew-page="next" data-ew-page-key="${pageKey}" ${state[pageKey] === totalPages ? "disabled" : ""}>›</button></div></div>`;
  }

  function renderRuleTabs() {
    const target = document.getElementById("energyWarningTabs");
    if (!target) return;
    target.innerHTML = data.energyTypes.map((item) => `<button class="warning-tab ${item.key === state.ruleTab ? "active" : ""}" type="button" data-ew-action="tab" data-ew-tab="${item.key}">${item.ruleLabel}</button>`).join("");
  }

  function renderRuleFilters() {
    const target = document.getElementById("energyWarningFilters");
    if (!target) return;
    target.innerHTML = `<section class="card warning-filter-card"><div class="warning-filter-fields"><label class="form-field"><span class="form-label">规则名称</span><input class="form-control" data-ew-filter="name" value="${escapeHtml(state.ruleFilters.name)}" placeholder="请输入规则名称"></label><label class="form-field"><span class="form-label">计划周期</span><select class="form-control" data-ew-filter="cycle"><option value="">请选择</option><option value="月度" ${state.ruleFilters.cycle === "月度" ? "selected" : ""}>月度</option><option value="年度" ${state.ruleFilters.cycle === "年度" ? "selected" : ""}>年度</option></select></label><label class="form-field"><span class="form-label">启用状态</span><select class="form-control" data-ew-filter="status"><option value="">请选择</option><option value="启用" ${state.ruleFilters.status === "启用" ? "selected" : ""}>启用</option><option value="停用" ${state.ruleFilters.status === "停用" ? "selected" : ""}>停用</option></select></label><div class="warning-filter-actions"><button class="btn btn-secondary" type="button" data-ew-action="reset-rules">重置</button><button class="btn btn-primary" type="button" data-ew-action="search-rules">搜索</button></div></div></section>`;
  }

  function filteredRules() {
    const filter = state.ruleFilters;
    return data.rules.filter((item) => item.energyType === state.ruleTab && (!filter.name || item.name.includes(filter.name)) && (!filter.cycle || item.cycle === filter.cycle) && (!filter.status || (item.enabled ? "启用" : "停用") === filter.status));
  }

  function ruleDeviceNames(item) {
    return item.deviceIds.map((id) => deviceById(id)?.name).filter(Boolean).join("、");
  }

  function renderRuleTable() {
    const filtered = filteredRules();
    const start = (state.rulePage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);
    const type = typeByKey(state.ruleTab);
    const body = document.getElementById("energyWarningBody");
    if (!body) return;
    body.innerHTML = visible.length ? visible.map((item, index) => `<tr><td>${start + index + 1}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(type.label)}</td><td>${escapeHtml(item.cycle)}</td><td>${formatNumber(item.planUsage)} ${escapeHtml(type.unit)}</td><td class="warning-device-cell" title="${escapeHtml(ruleDeviceNames(item))}">${escapeHtml(ruleDeviceNames(item))}</td><td><span class="warning-level level-1">一级 ${item.thresholds.level1}%</span><span class="warning-level level-2">二级 ${item.thresholds.level2}%</span><span class="warning-level level-3">三级 ${item.thresholds.level3}%</span></td><td>${escapeHtml(item.people.join("、"))}</td><td><label class="alarm-rule-switch"><input type="checkbox" data-ew-status-id="${item.id}" ${item.enabled ? "checked" : ""} aria-label="${escapeHtml(item.name)}${item.enabled ? "已启用" : "已停用"}"><span class="alarm-rule-switch-track"></span></label></td><td><button class="table-action" type="button" data-ew-row-action="detail" data-ew-id="${item.id}">详情</button><button class="table-action" type="button" data-ew-row-action="edit" data-ew-id="${item.id}">编辑</button><button class="table-action status-danger" type="button" data-ew-row-action="delete" data-ew-id="${item.id}">删除</button></td></tr>`).join("") : `<tr><td colspan="10"><div class="warning-empty"><i class="fa-solid fa-bolt" aria-hidden="true"></i><span>暂无能耗预警规则</span></div></td></tr>`;
    renderPagination("energyWarningPagination", filtered.length, "rulePage");
  }

  function renderRules() {
    renderRuleTabs();
    renderRuleFilters();
    renderRuleTable();
  }

  function deviceCells(item) {
    return `<td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.code)}</td><td>${escapeHtml(item.system)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.house)}</td><td>${escapeHtml(item.location)}</td><td>${escapeHtml(item.level)}</td>`;
  }

  function deviceTableHead(includeAction) {
    return `<tr><th class="warning-device-check"><input type="checkbox" ${includeAction ? "data-ew-selected-device-all" : "data-ew-modal-device-all"} aria-label="全选设备"></th><th>设备名称</th><th>设备编码</th><th>所属系统</th><th>设备分类</th><th>所属房源</th><th>安装位置</th><th>设备层级</th>${includeAction ? "<th>操作</th>" : ""}</tr>`;
  }

  function deviceMarkup(typeKey, selectedIds) {
    const devices = data.devices.filter((item) => item.energyType === typeKey);
    return devices.length ? devices.map((item) => `<tr><td class="warning-device-check"><input type="checkbox" data-ew-modal-device value="${escapeHtml(item.id)}" ${selectedIds.includes(item.id) ? "checked" : ""} aria-label="选择${escapeHtml(item.name)}"></td>${deviceCells(item)}</tr>`).join("") : '<tr><td colspan="8" class="warning-device-empty">暂无可选设备</td></tr>';
  }

  function selectedDeviceMarkup() {
    const selected = state.drawerDeviceIds.map((id) => deviceById(id)).filter(Boolean);
    const rows = selected.length ? selected.map((item) => `<tr><td class="warning-device-check"><input type="checkbox" data-ew-selected-device value="${escapeHtml(item.id)}" aria-label="选择${escapeHtml(item.name)}"></td>${deviceCells(item)}<td><button class="table-action status-danger" type="button" data-ew-device-action="remove" data-ew-device-id="${escapeHtml(item.id)}">移除</button></td></tr>`).join("") : '<tr><td colspan="9" class="warning-device-empty">暂未添加设备</td></tr>';
    return `<div class="warning-device-table-wrap"><table class="table warning-device-table warning-selected-device-table"><thead>${deviceTableHead(true)}</thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderSelectedDevices() {
    const list = document.querySelector("[data-ew-selected-device-list]");
    const count = document.querySelector("[data-ew-selected-device-count]");
    if (list) list.innerHTML = selectedDeviceMarkup();
    if (count) count.textContent = `${state.drawerDeviceIds.length} 台`;
    const batchButton = document.querySelector('[data-ew-device-action="batch-remove"]');
    if (batchButton) batchButton.disabled = true;
  }

  function syncSelectedDeviceChecks() {
    const items = [...document.querySelectorAll("[data-ew-selected-device]")];
    const checked = items.filter((item) => item.checked);
    const selectAll = document.querySelector("[data-ew-selected-device-all]");
    if (selectAll) {
      selectAll.checked = items.length > 0 && checked.length === items.length;
      selectAll.indeterminate = checked.length > 0 && checked.length < items.length;
    }
    const batchButton = document.querySelector('[data-ew-device-action="batch-remove"]');
    if (batchButton) batchButton.disabled = checked.length === 0;
  }

  function syncModalDeviceChecks() {
    const items = [...document.querySelectorAll("[data-ew-modal-device]")];
    const checked = items.filter((item) => item.checked);
    const selectAll = document.querySelector("[data-ew-modal-device-all]");
    if (selectAll) {
      selectAll.checked = items.length > 0 && checked.length === items.length;
      selectAll.indeterminate = checked.length > 0 && checked.length < items.length;
    }
    const count = document.querySelector("[data-ew-modal-device-count]");
    if (count) count.textContent = checked.length;
  }

  function openDeviceModal() {
    closeDeviceModal();
    const energyType = document.querySelector('[data-ew-field="energyType"]')?.value || state.ruleTab;
    const type = typeByKey(energyType);
    const available = data.devices.filter((item) => item.energyType === type.key);
    const modal = document.createElement("div");
    modal.className = "warning-device-modal-mask";
    modal.setAttribute("data-ew-device-modal", "true");
    modal.innerHTML = `<section class="warning-device-modal" role="dialog" aria-modal="true" aria-labelledby="warningDeviceModalTitle"><header class="warning-device-modal-head"><div><h3 id="warningDeviceModalTitle">选择监测设备</h3><p>选择需要纳入当前${escapeHtml(type.label)}预警规则的设备</p></div><button type="button" class="warning-device-modal-close" data-ew-device-modal-action="cancel" aria-label="关闭">×</button></header><div class="warning-device-modal-body"><div class="warning-device-modal-summary"><span>已选择 <strong data-ew-modal-device-count>${state.drawerDeviceIds.length}</strong> 台</span></div><div class="warning-device-table-wrap"><table class="table warning-device-table"><thead>${deviceTableHead(false)}</thead><tbody>${deviceMarkup(type.key, state.drawerDeviceIds)}</tbody></table></div><div class="warning-device-pagination"><span>共 ${available.length} 条</span><div class="warning-pagination-controls"><button class="warning-page-button" type="button" disabled aria-label="上一页">‹</button><button class="warning-page-button active" type="button" aria-current="page">1</button><button class="warning-page-button" type="button" disabled aria-label="下一页">›</button></div></div></div><footer class="warning-device-modal-footer"><button class="btn btn-secondary" type="button" data-ew-device-modal-action="cancel">取消</button><button class="btn btn-primary" type="button" data-ew-device-modal-action="confirm">确定</button></footer></section>`;
    document.body.append(modal);
    syncModalDeviceChecks();
  }

  function closeDeviceModal() {
    document.querySelector('[data-ew-device-modal="true"]')?.remove();
  }

  function confirmDeviceModal() {
    state.drawerDeviceIds = [...document.querySelectorAll("[data-ew-modal-device]:checked")].map((item) => item.value);
    closeDeviceModal();
    renderSelectedDevices();
    document.querySelectorAll("[data-ew-error]").forEach((item) => { item.textContent = ""; });
  }

  function multiValueMarkup(key) {
    const selected = [...document.querySelectorAll(`[data-ew-multi-option="${key}"]:checked`)].map((item) => ({ value: item.value, label: item.dataset.ewMultiLabel || item.value }));
    return selected.length ? selected.map((item) => `<span class="warning-selection-tag">${escapeHtml(item.label)}<button type="button" class="warning-selection-tag-remove" data-ew-multi-remove="${escapeHtml(key)}" data-ew-multi-value="${escapeHtml(item.value)}" aria-label="移除${escapeHtml(item.label)}">×</button></span>`).join("") : '<span class="warning-selection-empty">请选择</span>';
  }

  function renderMultiValue(key) {
    const target = document.querySelector(`[data-ew-multi-value="${key}"]`);
    if (target) target.innerHTML = multiValueMarkup(key);
  }

  function selectedMultiValues(key) {
    return [...document.querySelectorAll(`[data-ew-multi-option="${key}"]:checked`)].map((item) => item.value);
  }

  function closeMultiSelects(except) {
    document.querySelectorAll("[data-ew-multi]").forEach((item) => {
      if (item.dataset.ewMulti !== except) {
        item.classList.remove("open");
        item.querySelector("[data-ew-multi-trigger]")?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function toggleMultiSelect(key) {
    const target = document.querySelector(`[data-ew-multi="${key}"]`);
    if (!target) return;
    const open = !target.classList.contains("open");
    closeMultiSelects(open ? key : "");
    target.classList.toggle("open", open);
    target.querySelector("[data-ew-multi-trigger]")?.setAttribute("aria-expanded", String(open));
  }

  function multiSelectMarkup(key, options, selected) {
    return `<div class="warning-multi-select" data-ew-multi="${escapeHtml(key)}"><div class="warning-multi-control" data-ew-multi-trigger="${escapeHtml(key)}" role="button" tabindex="0" aria-expanded="false"><span class="warning-multi-value" data-ew-multi-value="${escapeHtml(key)}">${selected.map((value) => { const item = options.find((option) => option.value === value); return item ? `<span class="warning-selection-tag">${escapeHtml(item.label)}<button type="button" class="warning-selection-tag-remove" data-ew-multi-remove="${escapeHtml(key)}" data-ew-multi-value="${escapeHtml(item.value)}" aria-label="移除${escapeHtml(item.label)}">×</button></span>` : ""; }).join("") || '<span class="warning-selection-empty">请选择</span>'}</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></div><div class="warning-multi-dropdown" data-ew-multi-dropdown="${escapeHtml(key)}">${options.map((item) => `<label class="warning-multi-option"><input type="checkbox" data-ew-multi-option="${escapeHtml(key)}" data-ew-multi-label="${escapeHtml(item.label)}" value="${escapeHtml(item.value)}" ${selected.includes(item.value) ? "checked" : ""}><span>${escapeHtml(item.label)}</span></label>`).join("")}</div></div>`;
  }

  function openRuleDrawer(mode, item) {
    const type = typeByKey(item?.energyType || state.ruleTab);
    const current = item || { name: "", energyType: type.key, cycle: "月度", planUsage: "", deviceIds: [], thresholds: { level3: 10, level2: 20, level1: 30 }, departments: [], people: [], methods: ["站内信"], description: "" };
    state.drawerMode = mode;
    state.drawerRuleId = item?.id || null;
    state.drawerStep = 1;
    state.drawerDeviceIds = [...(current.deviceIds || [])];
    const departmentOptions = data.departments.map((department) => ({ value: department.id, label: department.name }));
    const peopleOptions = people().map((person) => ({ value: person, label: person }));
    const body = `<div class="warning-wizard"><div class="warning-wizard-steps"><button class="warning-wizard-step active" type="button" data-ew-step="1">1. 基本信息</button><button class="warning-wizard-step" type="button" data-ew-step="2">2. 监测范围与等级</button><button class="warning-wizard-step" type="button" data-ew-step="3">3. 通知设置</button></div><div class="warning-wizard-content"><section data-ew-panel="1"><label class="form-field form-item"><span class="form-label form-required">规则名称</span><input class="form-control" data-ew-field="name" value="${escapeHtml(current.name)}" placeholder="请输入规则名称"><span class="warning-error" data-ew-error="name"></span></label><label class="form-field form-item"><span class="form-label form-required">能源类型</span><select class="form-control" data-ew-field="energyType" disabled><option value="${type.key}" selected>${type.label}</option></select></label><label class="form-field form-item"><span class="form-label form-required">计划周期</span><select class="form-control" data-ew-field="cycle"><option value="月度" ${current.cycle === "月度" ? "selected" : ""}>月度</option><option value="年度" ${current.cycle === "年度" ? "selected" : ""}>年度</option></select></label><label class="form-field form-item"><span class="form-label form-required">计划用量</span><span class="warning-unit-control"><input class="form-control" type="number" min="0" step="0.01" data-ew-field="planUsage" value="${escapeHtml(current.planUsage)}" placeholder="请输入计划用量"><span class="warning-unit" data-ew-unit>${escapeHtml(type.unit)}</span></span><span class="warning-error" data-ew-error="planUsage"></span></label><label class="form-field form-item"><span class="form-label">规则说明</span><textarea class="form-control" data-ew-field="description" placeholder="请输入规则说明">${escapeHtml(current.description)}</textarea></label></section><section class="hidden" data-ew-panel="2"><p class="warning-form-note">实际用量超过计划用量后，按照超计划比例匹配最高预警等级。</p><div class="form-field form-item"><span class="form-label form-required">监测设备</span><div class="warning-selected-device-panel"><div class="warning-selected-device-head"><span>已选设备 <strong data-ew-selected-device-count>${state.drawerDeviceIds.length} 台</strong></span><div class="warning-selected-device-actions"><button class="btn btn-secondary" type="button" data-ew-device-action="batch-remove" disabled><i class="fa-solid fa-trash-can" aria-hidden="true"></i>批量移除</button><button class="btn btn-primary warning-add-device" type="button" data-ew-device-action="open"><i class="fa-solid fa-plus" aria-hidden="true"></i>添加设备</button></div></div><div class="warning-selected-device-list" data-ew-selected-device-list>${selectedDeviceMarkup()}</div></div><span class="warning-error" data-ew-error="devices"></span></div><div class="form-field form-item"><span class="form-label form-required">预警等级阈值</span><div class="warning-threshold-grid"><strong>一级预警</strong><input class="form-control" type="number" min="0.01" step="0.01" data-ew-field="level1" value="${escapeHtml(current.thresholds.level1)}" placeholder="超计划比例"><span>% 起</span></div><div class="warning-threshold-grid"><strong>二级预警</strong><input class="form-control" type="number" min="0.01" step="0.01" data-ew-field="level2" value="${escapeHtml(current.thresholds.level2)}" placeholder="超计划比例"><span>% 起</span></div><div class="warning-threshold-grid"><strong>三级预警</strong><input class="form-control" type="number" min="0.01" step="0.01" data-ew-field="level3" value="${escapeHtml(current.thresholds.level3)}" placeholder="超计划比例"><span>% 起</span></div><span class="warning-error" data-ew-error="thresholds"></span></div></section><section class="hidden" data-ew-panel="3"><section class="warning-send-section"><h3 class="warning-section-title">通知对象</h3><div class="form-field form-item"><span class="form-label form-required">通知部门</span>${multiSelectMarkup("departments", departmentOptions, current.departments)}<span class="warning-error" data-ew-error="departments"></span></div><div class="form-field form-item"><span class="form-label form-required">通知人员</span>${multiSelectMarkup("people", peopleOptions, current.people)}<span class="warning-error" data-ew-error="people"></span></div></section><div class="form-field form-item"><span class="form-label form-required">通知方式</span><div class="warning-methods"><label class="warning-method"><input type="checkbox" data-ew-method value="站内信" checked disabled>站内信</label></div><span class="warning-error" data-ew-error="methods"></span></div><label class="form-field form-item"><span class="form-label">启用状态</span><label class="switch-line"><span>启用规则</span><input type="checkbox" data-ew-field="enabled" ${current.enabled !== false ? "checked" : ""}></label></label></section></div></div>`;
    window.openAppDrawer({ title: mode === "edit" ? "编辑能耗预警规则" : "新增能耗预警规则", body, footer: "" });
    renderWizardFooter();
  }

  function renderWizardFooter() {
    const footer = document.getElementById("drawerFooter");
    if (!footer) return;
    footer.className = "drawer-footer warning-wizard-footer";
    footer.innerHTML = `<button class="btn btn-secondary" type="button" data-ew-drawer="cancel">取消</button>${state.drawerStep > 1 ? '<button class="btn btn-secondary" type="button" data-ew-drawer="back">上一步</button>' : ""}${state.drawerStep < 3 ? '<button class="btn btn-primary" type="button" data-ew-drawer="next">下一步</button>' : '<button class="btn btn-primary" type="button" data-ew-drawer="save">保存</button>'}`;
  }

  function setDrawerStep(step) {
    state.drawerStep = step;
    document.querySelectorAll("[data-ew-panel]").forEach((panel) => panel.classList.toggle("hidden", Number(panel.dataset.ewPanel) !== step));
    document.querySelectorAll("[data-ew-step]").forEach((button) => { const current = Number(button.dataset.ewStep); button.classList.toggle("active", current === step); button.classList.toggle("done", current < step); });
    renderWizardFooter();
  }

  function clearErrors() {
    document.querySelectorAll("[data-ew-error]").forEach((item) => { item.textContent = ""; });
  }

  function setError(key, message) {
    const target = document.querySelector(`[data-ew-error="${key}"]`);
    if (target) target.textContent = message;
  }

  function readRuleForm() {
    const value = (key) => document.querySelector(`[data-ew-field="${key}"]`)?.value?.trim() || "";
    return {
      name: value("name"),
      energyType: value("energyType"),
      cycle: value("cycle"),
      planUsage: Number(value("planUsage")),
      description: value("description"),
      deviceIds: [...state.drawerDeviceIds],
      thresholds: { level1: Number(value("level1")), level2: Number(value("level2")), level3: Number(value("level3")) },
      departments: selectedMultiValues("departments"),
      people: selectedMultiValues("people"),
      methods: [...document.querySelectorAll("[data-ew-method]:checked")].map((item) => item.value),
      enabled: Boolean(document.querySelector('[data-ew-field="enabled"]')?.checked),
    };
  }

  function validateStep(step) {
    clearErrors();
    const draft = readRuleForm();
    let valid = true;
    if (step === 1) {
      if (!draft.name) { setError("name", "请输入规则名称"); valid = false; }
      if (!draft.planUsage || draft.planUsage <= 0) { setError("planUsage", "请输入大于0的计划用量"); valid = false; }
    }
    if (step === 2) {
      if (!draft.deviceIds.length) { setError("devices", "请至少选择一台监测设备"); valid = false; }
      if (!draft.thresholds.level1 || !draft.thresholds.level2 || !draft.thresholds.level3 || draft.thresholds.level3 >= draft.thresholds.level2 || draft.thresholds.level2 >= draft.thresholds.level1) { setError("thresholds", "请输入递增的三级、二级、一级预警比例"); valid = false; }
    }
    if (step === 3) {
      if (!draft.departments.length) { setError("departments", "请选择通知部门"); valid = false; }
      if (!draft.people.length) { setError("people", "请选择通知人员"); valid = false; }
      if (!draft.methods.length) { setError("methods", "请选择通知方式"); valid = false; }
    }
    return valid;
  }

  function createMockRecord(rule) {
    if (!rule.enabled || data.records.some((record) => record.ruleId === rule.id && record.period === (rule.cycle === "年度" ? "2026年度" : "2026年9月"))) return;
    const threshold = rule.thresholds.level1;
    const actual = Number((rule.planUsage * (1 + (threshold + 4) / 100)).toFixed(2));
    data.records.unshift({ id: Date.now(), ruleId: rule.id, warningTime: "2026-09-18 10:00:00", period: rule.cycle === "年度" ? "2026年度" : "2026年9月", actualUsage: actual, overagePct: threshold + 4, level: "一级预警", status: "待处理", processor: "", processTime: "", processNote: "", history: [{ status: "待处理", time: "2026-09-18 10:00:00", operator: "系统", note: "检测到实际用量超过一级预警阈值。" }] });
  }

  function saveRule() {
    if (![1, 2, 3].every((step) => validateStep(step))) { const firstInvalid = [1, 2, 3].find((step) => !validateStep(step)); setDrawerStep(firstInvalid || 1); return; }
    const draft = readRuleForm();
    if (state.drawerMode === "edit") {
      const target = ruleById(state.drawerRuleId);
      if (target) Object.assign(target, draft);
    } else {
      const target = { id: Date.now(), ...draft };
      data.rules.push(target);
      createMockRecord(target);
    }
    window.closeAppDrawer();
    renderRules();
    showToast(state.drawerMode === "edit" ? "能耗预警规则已更新" : "能耗预警规则已新增");
  }

  function openRuleDetail(item) {
    const type = typeByKey(item.energyType);
    window.openAppDrawer({ title: "能耗预警规则详情", body: `<section><div class="warning-detail-grid"><div class="warning-detail-item"><span class="warning-detail-label">规则名称</span><span class="warning-detail-value">${escapeHtml(item.name)}</span></div><div class="warning-detail-item"><span class="warning-detail-label">能源类型</span><span class="warning-detail-value">${escapeHtml(type.label)}</span></div><div class="warning-detail-item"><span class="warning-detail-label">计划周期</span><span class="warning-detail-value">${escapeHtml(item.cycle)}</span></div><div class="warning-detail-item"><span class="warning-detail-label">计划用量</span><span class="warning-detail-value">${formatNumber(item.planUsage)} ${escapeHtml(type.unit)}</span></div><div class="warning-detail-item"><span class="warning-detail-label">监测设备</span><span class="warning-detail-value">${escapeHtml(ruleDeviceNames(item))}</span></div><div class="warning-detail-item"><span class="warning-detail-label">通知人员</span><span class="warning-detail-value">${escapeHtml(item.people.join("、"))}</span></div></div><h3 class="warning-section-title">预警等级</h3><div class="warning-detail-grid"><div class="warning-detail-item"><span class="warning-detail-label">一级预警</span><span class="warning-detail-value">超计划 ${item.thresholds.level1}% 起</span></div><div class="warning-detail-item"><span class="warning-detail-label">二级预警</span><span class="warning-detail-value">超计划 ${item.thresholds.level2}% 起</span></div><div class="warning-detail-item"><span class="warning-detail-label">三级预警</span><span class="warning-detail-value">超计划 ${item.thresholds.level3}% 起</span></div><div class="warning-detail-item"><span class="warning-detail-label">启用状态</span><span class="warning-detail-value">${item.enabled ? "启用" : "停用"}</span></div></div><h3 class="warning-section-title">规则说明</h3><p>${escapeHtml(item.description || "暂无规则说明")}</p></section>`, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>` });
  }

  function renderRecordFilters() {
    const target = document.getElementById("energyWarningRecordFilters");
    if (!target) return;
    target.innerHTML = `<section class="card warning-filter-card"><div class="warning-filter-fields warning-record-filter-fields"><label class="form-field"><span class="form-label">预警规则</span><select class="form-control" data-ew-record-filter="ruleId"><option value="">请选择</option>${data.rules.map((item) => `<option value="${item.id}" ${state.recordFilters.ruleId === String(item.id) ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">能源类型</span><select class="form-control" data-ew-record-filter="energyType"><option value="">请选择</option>${data.energyTypes.map((item) => `<option value="${item.key}" ${state.recordFilters.energyType === item.key ? "selected" : ""}>${item.label}</option>`).join("")}</select></label><label class="form-field"><span class="form-label">预警等级</span><select class="form-control" data-ew-record-filter="level"><option value="">请选择</option><option value="一级预警" ${state.recordFilters.level === "一级预警" ? "selected" : ""}>一级预警</option><option value="二级预警" ${state.recordFilters.level === "二级预警" ? "selected" : ""}>二级预警</option><option value="三级预警" ${state.recordFilters.level === "三级预警" ? "selected" : ""}>三级预警</option></select></label><label class="form-field"><span class="form-label">处理状态</span><select class="form-control" data-ew-record-filter="status"><option value="">请选择</option><option value="待处理" ${state.recordFilters.status === "待处理" ? "selected" : ""}>待处理</option><option value="处理中" ${state.recordFilters.status === "处理中" ? "selected" : ""}>处理中</option><option value="已处理" ${state.recordFilters.status === "已处理" ? "selected" : ""}>已处理</option></select></label><label class="form-field warning-filter-extra ${state.recordExpanded ? "" : "hidden"}"><span class="form-label">预警日期</span><input class="form-control" type="date" data-ew-record-filter="date" value="${escapeHtml(state.recordFilters.date)}"></label><div class="warning-filter-actions"><button class="btn btn-secondary warning-expand-btn" type="button" data-ew-action="toggle-record-filter"><i class="fa-solid ${state.recordExpanded ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i>${state.recordExpanded ? "收起" : "展开"}</button><button class="btn btn-secondary" type="button" data-ew-action="reset-records">重置</button><button class="btn btn-primary" type="button" data-ew-action="search-records">搜索</button></div></div></section>`;
  }

  function filteredRecords() {
    const filter = state.recordFilters;
    return data.records.filter((record) => {
      const rule = ruleById(record.ruleId);
      return (!filter.ruleId || String(record.ruleId) === filter.ruleId) && (!filter.energyType || rule?.energyType === filter.energyType) && (!filter.level || record.level === filter.level) && (!filter.status || record.status === filter.status) && (!filter.date || record.warningTime.startsWith(filter.date));
    });
  }

  function renderRecordTable() {
    const filtered = filteredRecords();
    const start = (state.recordPage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);
    const body = document.getElementById("energyWarningRecordBody");
    if (!body) return;
    body.innerHTML = visible.length ? visible.map((record, index) => { const rule = ruleById(record.ruleId); const type = typeByKey(rule?.energyType); return `<tr><td>${start + index + 1}</td><td>${escapeHtml(record.warningTime)}</td><td>${escapeHtml(rule?.name || "-")}</td><td>${escapeHtml(type.label)}</td><td>${escapeHtml(rule?.cycle || "-")}</td><td class="warning-device-cell" title="${escapeHtml(rule ? ruleDeviceNames(rule) : "-")}">${escapeHtml(rule ? ruleDeviceNames(rule) : "-")}</td><td>${escapeHtml(record.period)}</td><td>${formatNumber(rule?.planUsage)} ${escapeHtml(type.unit)}</td><td>${formatNumber(record.actualUsage)} ${escapeHtml(type.unit)}</td><td>${record.overagePct.toFixed(2)}%</td><td><span class="warning-level ${levelClass(record.level)}">${escapeHtml(record.level)}</span></td><td><span class="warning-status ${statusClass(record.status)}">${escapeHtml(record.status)}</span></td><td><button class="table-action" type="button" data-ew-record-action="detail" data-ew-id="${record.id}">详情</button>${record.status === "已处理" ? "" : `<button class="table-action" type="button" data-ew-record-action="process" data-ew-id="${record.id}">处理</button>`}</td></tr>`; }).join("") : `<tr><td colspan="13"><div class="warning-empty"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>暂无能耗预警记录</span></div></td></tr>`;
    const count = document.getElementById("energyWarningRecordCount");
    if (count) count.textContent = filtered.length;
    renderPagination("energyWarningRecordPagination", filtered.length, "recordPage");
  }

  function renderRecords() {
    renderRecordFilters();
    renderRecordTable();
  }

  function recordById(id) { return data.records.find((item) => String(item.id) === String(id)); }

  function recordDetailMarkup(record) {
    const rule = ruleById(record.ruleId);
    const type = typeByKey(rule?.energyType);
    return `<section><div class="warning-metric-strip"><div class="warning-metric"><span class="warning-metric-label">计划用量</span><span class="warning-metric-value">${formatNumber(rule?.planUsage)} <small>${escapeHtml(type.unit)}</small></span></div><div class="warning-metric"><span class="warning-metric-label">实际用量</span><span class="warning-metric-value">${formatNumber(record.actualUsage)} <small>${escapeHtml(type.unit)}</small></span></div><div class="warning-metric"><span class="warning-metric-label">超出比例</span><span class="warning-metric-value">${record.overagePct.toFixed(2)}%</span></div></div><div class="warning-detail-grid"><div class="warning-detail-item"><span class="warning-detail-label">预警等级</span><span class="warning-detail-value"><span class="warning-level ${levelClass(record.level)}">${escapeHtml(record.level)}</span></span></div><div class="warning-detail-item"><span class="warning-detail-label">处理状态</span><span class="warning-detail-value"><span class="warning-status ${statusClass(record.status)}">${escapeHtml(record.status)}</span></span></div><div class="warning-detail-item"><span class="warning-detail-label">规则名称</span><span class="warning-detail-value">${escapeHtml(rule?.name || "-")}</span></div><div class="warning-detail-item"><span class="warning-detail-label">统计周期</span><span class="warning-detail-value">${escapeHtml(record.period)}</span></div><div class="warning-detail-item"><span class="warning-detail-label">触发设备</span><span class="warning-detail-value">${escapeHtml(rule ? ruleDeviceNames(rule) : "-")}</span></div><div class="warning-detail-item"><span class="warning-detail-label">通知人员</span><span class="warning-detail-value">${escapeHtml(rule?.people.join("、") || "-")}</span></div></div><h3 class="warning-section-title">处理记录</h3><div class="warning-history">${(record.history || []).map((item) => `<div class="warning-history-item"><strong>${escapeHtml(item.status)} · ${escapeHtml(item.operator)}</strong><span>${escapeHtml(item.time)}</span><p>${escapeHtml(item.note)}</p></div>`).join("")}</div></section>`;
  }

  function openRecordDetail(record) {
    window.openAppDrawer({ title: "能耗预警详情", body: recordDetailMarkup(record), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>` });
  }

  function openRecordProcess(record) {
    window.openAppDrawer({ title: "处理能耗预警", body: `<form><p class="warning-form-note">处理后将保留当前预警记录，并在处理记录中记录本次操作。</p><label class="form-field form-item"><span class="form-label form-required">处理状态</span><select class="form-control" data-ew-process-field="status"><option value="处理中" ${record.status === "处理中" ? "selected" : ""}>处理中</option><option value="已处理">已处理</option></select></label><label class="form-field form-item"><span class="form-label form-required">处理人</span><input class="form-control" data-ew-process-field="processor" value="${escapeHtml(record.processor || "")}" placeholder="请输入处理人"></label><label class="form-field form-item"><span class="form-label form-required">处理说明</span><textarea class="form-control" data-ew-process-field="note" placeholder="请输入处理说明">${escapeHtml(record.processNote || "")}</textarea><span class="warning-error" data-ew-process-error></span></label></form>`, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-ew-record-drawer="save-process" data-ew-id="${record.id}">保存</button>` });
  }

  function saveRecordProcess(id) {
    const record = recordById(id);
    if (!record) return;
    const status = document.querySelector('[data-ew-process-field="status"]')?.value || "处理中";
    const processor = document.querySelector('[data-ew-process-field="processor"]')?.value.trim() || "";
    const note = document.querySelector('[data-ew-process-field="note"]')?.value.trim() || "";
    const error = document.querySelector("[data-ew-process-error]");
    if (!processor || !note) { if (error) error.textContent = "请输入处理人和处理说明"; return; }
    const time = "2026-09-18 10:30:00";
    Object.assign(record, { status, processor, processTime: time, processNote: note });
    record.history = [...(record.history || []), { status, time, operator: processor, note }];
    window.closeAppDrawer();
    renderRecords();
    showToast("能耗预警记录已更新");
  }

  function captureFilters(selector, target) {
    state[target] = Object.fromEntries([...document.querySelectorAll(selector)].map((field) => [field.dataset.ewFilter || field.dataset.ewRecordFilter, field.value.trim()]));
  }

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-ew-action]")?.dataset.ewAction;
    const rowAction = event.target.closest("[data-ew-row-action]");
    const recordAction = event.target.closest("[data-ew-record-action]");
    const pageButton = event.target.closest("[data-ew-page]");
    const drawerAction = event.target.closest("[data-ew-drawer]")?.dataset.ewDrawer;
    const recordDrawerAction = event.target.closest("[data-ew-record-drawer]");
    const deviceAction = event.target.closest("[data-ew-device-action]");
    const deviceModalAction = event.target.closest("[data-ew-device-modal-action]")?.dataset.ewDeviceModalAction;
    const multiRemove = event.target.closest("[data-ew-multi-remove]");
    const multiTrigger = event.target.closest("[data-ew-multi-trigger]");
    if (isRulePage && deviceAction?.dataset.ewDeviceAction === "open") openDeviceModal();
    if (isRulePage && deviceAction?.dataset.ewDeviceAction === "remove") {
      state.drawerDeviceIds = state.drawerDeviceIds.filter((id) => id !== deviceAction.dataset.ewDeviceId);
      renderSelectedDevices();
      clearErrors();
    }
    if (isRulePage && deviceAction?.dataset.ewDeviceAction === "batch-remove") {
      const removeIds = [...document.querySelectorAll("[data-ew-selected-device]:checked")].map((item) => item.value);
      state.drawerDeviceIds = state.drawerDeviceIds.filter((id) => !removeIds.includes(id));
      renderSelectedDevices();
      clearErrors();
    }
    if (isRulePage && deviceModalAction === "cancel") closeDeviceModal();
    if (isRulePage && deviceModalAction === "confirm") confirmDeviceModal();
    if (isRulePage && event.target.matches("[data-ew-device-modal=\"true\"]")) closeDeviceModal();
    if (isRulePage && multiRemove) {
      const key = multiRemove.dataset.ewMultiRemove;
      const option = document.querySelector(`[data-ew-multi-option="${key}"][value="${CSS.escape(multiRemove.dataset.ewMultiValue)}"]`);
      if (option) option.checked = false;
      renderMultiValue(key);
      clearErrors();
      return;
    }
    if (isRulePage && multiTrigger) {
      toggleMultiSelect(multiTrigger.dataset.ewMultiTrigger);
      return;
    }
    if (isRulePage && !event.target.closest("[data-ew-multi]")) closeMultiSelects();
    if (isRulePage && action === "tab") { state.ruleTab = event.target.closest("[data-ew-tab]").dataset.ewTab; state.rulePage = 1; state.ruleFilters = { name: "", cycle: "", status: "" }; renderRules(); }
    if (isRulePage && action === "search-rules") { captureFilters("[data-ew-filter]", "ruleFilters"); state.rulePage = 1; renderRuleTable(); }
    if (isRulePage && action === "reset-rules") { state.ruleFilters = { name: "", cycle: "", status: "" }; state.rulePage = 1; renderRuleFilters(); renderRuleTable(); }
    if (isRulePage && action === "create") openRuleDrawer("create");
    if (isRulePage && event.target.closest("[data-ew-step]")) { const step = Number(event.target.closest("[data-ew-step]").dataset.ewStep); if (step <= state.drawerStep || validateStep(state.drawerStep)) setDrawerStep(step); }
    if (isRulePage && rowAction) { const item = ruleById(rowAction.dataset.ewId); if (rowAction.dataset.ewRowAction === "detail") openRuleDetail(item); if (rowAction.dataset.ewRowAction === "edit") openRuleDrawer("edit", item); if (rowAction.dataset.ewRowAction === "delete") window.openAppConfirm({ title: "提示", message: `确认删除规则「${item?.name || ""}」吗？`, onConfirm: () => { data.rules = data.rules.filter((entry) => entry.id !== item.id); renderRules(); showToast("能耗预警规则已删除"); } }); }
    if (isRecordPage && action === "toggle-record-filter") { state.recordExpanded = !state.recordExpanded; renderRecordFilters(); }
    if (isRecordPage && action === "search-records") { captureFilters("[data-ew-record-filter]", "recordFilters"); state.recordPage = 1; renderRecordTable(); }
    if (isRecordPage && action === "reset-records") { state.recordFilters = { ruleId: "", energyType: "", level: "", status: "", date: "" }; state.recordPage = 1; renderRecordFilters(); renderRecordTable(); }
    if (isRecordPage && recordAction) { const record = recordById(recordAction.dataset.ewId); if (recordAction.dataset.ewRecordAction === "detail") openRecordDetail(record); if (recordAction.dataset.ewRecordAction === "process") openRecordProcess(record); }
    if (pageButton) { const key = pageButton.dataset.ewPageKey; const total = key === "rulePage" ? filteredRules().length : filteredRecords().length; const totalPages = Math.max(1, Math.ceil(total / pageSize)); const action = pageButton.dataset.ewPage; state[key] = action === "prev" ? Math.max(1, state[key] - 1) : action === "next" ? Math.min(totalPages, state[key] + 1) : Math.min(totalPages, Math.max(1, Number(action))); isRulePage ? renderRuleTable() : renderRecordTable(); }
    if (drawerAction === "cancel") window.closeAppDrawer();
    if (drawerAction === "back") setDrawerStep(Math.max(1, state.drawerStep - 1));
    if (drawerAction === "next") { if (validateStep(state.drawerStep)) setDrawerStep(Math.min(3, state.drawerStep + 1)); }
    if (drawerAction === "save") saveRule();
    if (recordDrawerAction?.dataset.ewRecordDrawer === "save-process") saveRecordProcess(recordDrawerAction.dataset.ewId);
  });

  document.addEventListener("change", (event) => {
    if (isRulePage && event.target.matches("[data-ew-modal-device-all]")) {
      document.querySelectorAll("[data-ew-modal-device]").forEach((item) => { item.checked = event.target.checked; });
      syncModalDeviceChecks();
    }
    if (isRulePage && event.target.matches("[data-ew-modal-device]")) syncModalDeviceChecks();
    if (isRulePage && event.target.matches("[data-ew-selected-device-all]")) {
      document.querySelectorAll("[data-ew-selected-device]").forEach((item) => { item.checked = event.target.checked; });
      syncSelectedDeviceChecks();
    }
    if (isRulePage && event.target.matches("[data-ew-selected-device]")) syncSelectedDeviceChecks();
    if (isRulePage && event.target.matches("[data-ew-multi-option]")) renderMultiValue(event.target.dataset.ewMultiOption);
    if (event.target.matches("[data-ew-field], [data-ew-multi-option], [data-ew-method], [data-ew-process-field]")) document.querySelectorAll("[data-ew-error]").forEach((item) => { item.textContent = ""; });
    if (isRulePage && event.target.matches("[data-ew-status-id]")) { const item = ruleById(event.target.dataset.ewStatusId); if (item) { item.enabled = event.target.checked; showToast(item.enabled ? "规则已启用" : "规则已停用"); } }
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (isRulePage) renderRules();
    if (isRecordPage) renderRecords();
  });
})();
