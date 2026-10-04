(function () {
  const data = window.INSPECTION_DATA || { standardWorks: [], inspectionProjects: [], inspectionItems: [], plans: [], tasks: [], devices: [] };
  const pageKey = document.body.dataset.menuKey || "";
  if (!pageKey.startsWith("inspection.")) return;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const GENERATED_TASKS_KEY = "inspection.generatedTasks";
  const readGeneratedTasks = () => {
    try { const list = JSON.parse(window.localStorage.getItem(GENERATED_TASKS_KEY) || "[]"); return Array.isArray(list) ? list : []; } catch (error) { return []; }
  };
  const writeGeneratedTasks = (list) => {
    try { window.localStorage.setItem(GENERATED_TASKS_KEY, JSON.stringify(list)); } catch (error) { /* 存储不可用时仅在内存中保留 */ }
  };
  const generatedTasks = readGeneratedTasks();
  const state = {
    standardWorks: clone(data.standardWorks),
    inspectionProjects: clone(data.inspectionProjects || []),
    inspectionItems: clone(data.inspectionItems),
    plans: clone(data.plans),
    tasks: [...clone(generatedTasks), ...clone(data.tasks)],
    generatedTasks: clone(generatedTasks),
    devices: clone(data.devices),
    departments: clone(data.departments || []),
    personnel: clone(data.personnel || []),
    picker: { target: null, deptId: "", keyword: "", deptKeyword: "", deptCollapsed: new Set(), selectedId: "" },
    devicePicker: { keyword: "", code: "", category: "", selected: new Set() },
    planDeviceIds: [],
    workViewer: { deviceId: "", projectId: "" },
    page: 1,
    pageSize: 10,
    filters: {},
    selected: new Set(),
    configSelected: new Set(),
  };

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const value = (item, key) => String(item?.[key] ?? "").toLowerCase();
  const now = () => new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
  const byId = (list, id) => list.find((item) => item.id === id);
  const showToast = (message) => {
    let toast = document.querySelector(".inspection-toast");
    if (!toast) { toast = document.createElement("div"); toast.className = "inspection-toast"; document.body.appendChild(toast); }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  };
  const openDrawer = (config, drawerClass = "") => {
    const drawer = document.getElementById("drawer");
    drawer?.classList.remove("inspection-task-drawer", "inspection-config-drawer");
    window.openAppDrawer(config);
    if (drawerClass) drawer?.classList.add(...drawerClass.split(" "));
  };
  const hideMoreMenus = () => document.querySelectorAll(".inspection-more-menu").forEach((menu) => { menu.remove(); });
  window.addEventListener("scroll", hideMoreMenus, true);
  window.addEventListener("resize", hideMoreMenus);
  const statusTag = (text, type = "muted") => `<span class="inspection-status inspection-status-${type}">${esc(text)}</span>`;
  const levelTag = (text) => statusTag(text, text === "高" ? "danger" : "warning");
  const filtered = (list, filters, fields) => list.filter((item) => fields.every((key) => !filters[key] || value(item, key).includes(String(filters[key]).toLowerCase())));
  const pageRows = (list) => {
    const pages = Math.max(1, Math.ceil(list.length / state.pageSize));
    state.page = Math.min(state.page, pages);
    return { rows: list.slice((state.page - 1) * state.pageSize, state.page * state.pageSize), pages };
  };
  const pagination = (target, total, summary) => {
    if (!target) return;
    const pages = Math.max(1, Math.ceil(total / state.pageSize));
    target.innerHTML = `<span>${esc(summary || `共 ${total} 条记录，每页 ${state.pageSize} 条`)}</span><div class="pagination-controls"><button type="button" data-inspection-page="prev" ${state.page <= 1 ? "disabled" : ""}>‹</button>${Array.from({ length: pages }, (_, index) => `<button type="button" class="${index + 1 === state.page ? "active" : ""}" data-inspection-page="${index + 1}">${index + 1}</button>`).join("")}<button type="button" data-inspection-page="next" ${state.page >= pages ? "disabled" : ""}>›</button></div>`;
  };
  const currentFilters = () => Object.fromEntries([...document.querySelectorAll("[data-inspection-filter]")].map((field) => [field.dataset.inspectionFilter, field.value.trim()]));
  const syncCategoryOptions = () => {
    const select = document.querySelector('[data-inspection-filter="category"]');
    if (!select || select.options.length > 1) return;
    const source = (window.APP_DEVICE_CATEGORIES || []).length ? window.APP_DEVICE_CATEGORIES.map((entry) => entry.name) : [...new Set(state.standardWorks.map((item) => item.category))];
    source.forEach((category) => select.insertAdjacentHTML("beforeend", `<option value="${esc(category)}">${esc(category)}</option>`));
  };

  function renderStandardWorks() {
    const filters = state.filters;
    const list = filtered(state.standardWorks.filter((item) => item.type === "巡检"), filters, ["mode", "category", "name"]);
    const { rows } = pageRows(list);
    const body = document.getElementById("standardWorksBody");
    if (!body) return;
    body.innerHTML = rows.length ? rows.map((item) => `<tr>
      <td title="${esc(item.code)}">${esc(item.code.slice(0, 21))}...</td><td>${esc(item.name)}</td><td>${esc(item.type)}</td><td>${esc(item.mode)}</td><td class="wrap">${esc(item.system || "-")}</td><td class="wrap">${esc(item.category)}</td><td>${esc(item.itemCount)}</td><td>${esc(item.entryCount)}</td><td>${esc(item.creator)}</td><td>${esc(item.createdAt)}</td><td>${esc(item.updater)}</td><td>${esc(item.updatedAt)}</td>
      <td class="action-cell"><button class="table-action" type="button" data-inspection-work-action="edit" data-id="${esc(item.id)}">编辑</button><span class="inspection-more"><button class="table-action" type="button" data-inspection-more="${esc(item.id)}">更多</button></span></td>
    </tr>`).join("") : `<tr><td colspan="13"><div class="inspection-empty">暂无匹配的标准作业</div></td></tr>`;
    pagination(document.getElementById("standardWorksPagination"), list.length);
  }

  function renderPlans() {
    const list = filtered(state.plans, state.filters, ["name", "code", "project"]);
    const { rows } = pageRows(list);
    const body = document.getElementById("plansBody");
    if (!body) return;
    body.innerHTML = rows.length ? rows.map((item) => `<tr>
      <td class="check-cell"><input type="checkbox" data-inspection-select="${esc(item.id)}" ${state.selected.has(item.id) ? "checked" : ""} aria-label="选择${esc(item.name)}"></td><td>${esc(item.code)}</td><td>${esc(item.name)}</td><td>${esc(item.project)}</td><td>${levelTag(item.level)}</td><td class="wrap">${esc(item.target)}</td><td>${statusTag(item.cycle, "muted")}</td><td>${item.status === "停用" ? statusTag("停用", "muted") : statusTag("正常", "normal")}</td><td>${esc(item.generateAt)}</td><td>${esc(item.startAt)}</td><td>${esc(item.nextGenerateAt || "-")}</td><td>${esc(item.lastGenerateAt || "-")}</td><td>${esc(item.inspector)}</td><td>${esc(item.owner)}</td><td>${esc(item.createdAt || "-")}</td>
      <td class="action-cell"><button class="table-action" type="button" data-inspection-plan-action="edit" data-id="${esc(item.id)}">编辑</button><span class="inspection-more"><button class="table-action" type="button" data-inspection-more="${esc(item.id)}" data-more-type="plan">更多</button></span></td>
    </tr>`).join("") : `<tr><td colspan="16"><div class="inspection-empty">暂无匹配的巡检计划</div></td></tr>`;
    pagination(document.getElementById("plansPagination"), list.length);
    const deleteButton = document.querySelector('[data-inspection-action="delete-selected"]');
    if (deleteButton) deleteButton.disabled = !state.selected.size;
  }

  function renderTasks() {
    const list = state.tasks.filter((item) => {
      const filters = state.filters;
      return (!filters.keyword || `${item.code} ${item.name} ${item.planName}`.toLowerCase().includes(filters.keyword.toLowerCase())) && (!filters.code || value(item, "code").includes(filters.code.toLowerCase())) && (!filters.planName || value(item, "planName").includes(filters.planName.toLowerCase()));
    });
    const { rows } = pageRows(list);
    const body = document.getElementById("tasksBody");
    if (!body) return;
    body.innerHTML = rows.length ? rows.map((item) => `<tr>
      <td class="check-cell"><input type="checkbox" data-inspection-select="${esc(item.id)}" ${state.selected.has(item.id) ? "checked" : ""} aria-label="选择${esc(item.name)}"></td><td title="${esc(item.code)}">${esc(item.code)}</td><td title="${esc(item.name)}">${esc(item.name)}</td><td>${esc(item.planName)}</td><td>${levelTag(item.level)}</td><td>${esc(item.inspector)}</td><td>${esc(item.owner)}</td><td>${statusTag(item.status, "warning")}</td><td>${statusTag(item.result, "muted")}</td><td>${statusTag(item.overdue, "danger")}</td><td>${item.deviceCount}/${item.itemCount}</td><td>${esc(item.abnormalCount ?? 0)}</td><td>${esc(item.planExecution || "未执行")}</td><td>${esc(item.deadline)}</td><td>${esc(item.startedAt)}</td><td>${esc(item.submittedAt)}</td><td>${esc(item.duration)}</td><td class="action-cell"><button class="table-action" type="button" data-inspection-task-detail="${esc(item.id)}">详情</button></td>
    </tr>`).join("") : `<tr><td colspan="18"><div class="inspection-empty">暂无匹配的巡检任务</div></td></tr>`;
    pagination(document.getElementById("tasksPagination"), list.length);
    const deleteButton = document.querySelector('[data-inspection-action="delete-selected"]');
    if (deleteButton) deleteButton.disabled = !state.selected.size;
  }

  function render() {
    syncCategoryOptions();
    if (pageKey === "inspection.standard-works") renderStandardWorks();
    if (pageKey === "inspection.plans") renderPlans();
    if (pageKey === "inspection.tasks") renderTasks();
  }

  const systemTypes = window.APP_SYSTEM_TYPES || [];
  const deviceCategories = window.APP_DEVICE_CATEGORIES || [];
  const categoriesForSystem = (systemName) => deviceCategories.filter((entry) => entry.system === systemName).map((entry) => entry.name);
  const categorySelectHtml = (systemName, selectedCategory) => {
    const options = categoriesForSystem(systemName);
    const placeholder = !systemName ? "请先选择所属系统" : options.length ? "请选择" : "当前系统暂无设备分类";
    return `<label class="form-field"><span class="form-label form-required">设备分类</span><select class="form-control" data-inspection-field="category" ${systemName && options.length ? "" : "disabled"}><option value="">${placeholder}</option>${options.map((category) => `<option value="${esc(category)}" ${selectedCategory === category ? "selected" : ""}>${esc(category)}</option>`).join("")}</select></label>`;
  };

  function workForm(mode, item = {}) {
    const system = item.system || deviceCategories.find((entry) => entry.name === item.category)?.system || "";
    return `<div class="inspection-drawer-grid"><label class="form-field"><span class="form-label form-required">所属系统</span><select class="form-control" data-inspection-field="system"><option value="">请选择</option>${systemTypes.map((entry) => `<option value="${esc(entry.name)}" ${system === entry.name ? "selected" : ""}>${esc(entry.name)}</option>`).join("")}</select></label>${categorySelectHtml(system, item.category)}<label class="form-field"><span class="form-label form-required">标准作业名称</span><input class="form-control" data-inspection-field="name" value="${esc(item.name || "")}" maxlength="20" placeholder="请输入"></label><div class="form-field form-span-2"><span class="form-label form-required">作业方式</span><div class="inspection-radio-row"><label><input type="radio" name="inspection-work-mode" value="顺序作业" ${item.mode !== "并行作业" ? "checked" : ""}> 顺序作业</label><label><input type="radio" name="inspection-work-mode" value="并行作业" ${item.mode === "并行作业" ? "checked" : ""}> 并行作业</label></div></div><label class="form-field form-span-2"><span class="form-label">备注</span><textarea class="form-control textarea" data-inspection-field="remark" maxlength="300" placeholder="请输入">${esc(item.remark || "")}</textarea><span class="field-count">0 / 300</span></label></div>`;
  }

  function openWorkDrawer(mode, item = {}) {
    openDrawer({ title: mode === "edit" ? "编辑标准作业" : "新增标准作业", body: workForm(mode, item), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-inspection-save="work" data-mode="${mode}" data-id="${esc(item.id || "")}">确定</button>` });
  }

  function openWorkDetail(item) {
    const items = state.inspectionItems.filter((entry) => entry.workId === item.id);
    openDrawer({ title: "标准作业详情", body: `<section class="detail-section"><div class="inspection-detail-meta"><div class="info-item"><span class="info-label">标准作业名称</span><span class="info-value">${esc(item.name)}</span></div><div class="info-item"><span class="info-label">作业状态</span><span class="info-value">${statusTag(item.status, "normal")}</span></div><div class="info-item"><span class="info-label">模板编号</span><span class="info-value">${esc(item.code)}</span></div><div class="info-item"><span class="info-label">所属系统</span><span class="info-value">${esc(item.system || "-")}</span></div><div class="info-item"><span class="info-label">设备分类</span><span class="info-value">${esc(item.category)}</span></div><div class="info-item"><span class="info-label">作业方式</span><span class="info-value">${esc(item.mode)}</span></div><div class="info-item"><span class="info-label">备注</span><span class="info-value">${esc(item.remark || "-")}</span></div></div></section><section class="detail-section"><h3 class="detail-title">作业项列表（${items.length}）</h3><div class="inspection-table-wrap"><table class="table inspection-detail-table"><thead><tr><th>排序</th><th>条目名称</th><th>是否必填</th><th>填写类型</th><th>填写项</th><th>备注</th></tr></thead><tbody>${items.map((entry) => `<tr><td>${esc(entry.order)}</td><td>${esc(entry.name)}</td><td>${entry.required ? statusTag("必填", "danger") : statusTag("非必填", "muted")}</td><td>${statusTag(entry.inputType, "primary")}</td><td>${esc(entry.options.join("、"))}</td><td class="wrap">${esc(entry.remark)}</td></tr>`).join("")}</tbody></table></div></section>`, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button><button class="btn btn-primary" type="button" data-inspection-work-action="edit" data-id="${esc(item.id)}">编辑</button>` });
  }

  const OPTION_TYPES = ["单选", "多选", "单文本", "多文本", "上传照片"];
  const optionTagsHtml = (options) => `${options.map((option, index) => `<span class="inspection-option-tag">${esc(option)}<button type="button" data-option-remove="${index}" aria-label="删除填写项">×</button></span>`).join("")}<button type="button" class="inspection-option-add" data-option-add><i class="fa-solid fa-plus"></i> 添加</button>`;
  const syncOptionEditor = () => {
    const editor = document.querySelector("[data-option-editor]");
    const hidden = document.querySelector('[data-inspection-field="item-options"]');
    if (!editor || !hidden) return;
    editor.innerHTML = optionTagsHtml(hidden.value.split("、").map((entry) => entry.trim()).filter(Boolean));
  };

  function itemForm(item = {}) {
    const inputType = item.inputType || "单选";
    const options = item.options?.length ? item.options : ["异常", "正常"];
    const showOptions = inputType === "单选" || inputType === "多选";
    return `<div class="inspection-form-vertical"><label class="form-field"><span class="form-label form-required">条目名称</span><div class="inspection-count-input"><input class="form-control" data-inspection-field="item-name" value="${esc(item.name || "")}" maxlength="20" placeholder="请输入"><span class="field-count">${esc(String((item.name || "").length))} / 20</span></div></label><div class="form-field"><span class="form-label form-required">是否必填</span><div class="inspection-radio-row"><label><input type="radio" name="inspection-item-required" value="true" ${item.required !== false ? "checked" : ""}> 必填</label><label><input type="radio" name="inspection-item-required" value="false" ${item.required === false ? "checked" : ""}> 非必填</label></div></div><div class="form-field"><span class="form-label form-required">填写类型</span><div class="inspection-radio-row">${OPTION_TYPES.map((type) => `<label><input type="radio" name="inspection-item-input-type" value="${type}" ${inputType === type ? "checked" : ""}> ${type}</label>`).join("")}</div></div><div class="form-field" id="inspectionOptionsField" ${showOptions ? "" : 'style="display:none;"'}><span class="form-label">填写项</span><div class="inspection-option-tags" data-option-editor>${optionTagsHtml(options)}</div><input type="hidden" data-inspection-field="item-options" value="${esc(options.join("、"))}"></div><label class="form-field"><span class="form-label form-required">排序</span><input class="form-control" data-inspection-field="item-order" type="number" value="${esc(item.order ?? 0)}"></label><label class="form-field"><span class="form-label">备注</span><textarea class="form-control textarea" data-inspection-field="item-remark" maxlength="200" placeholder="请输入">${esc(item.remark || "")}</textarea><span class="field-count">${esc(String((item.remark || "").length))} / 200</span></label></div>`;
  }

  function projectForm(project = {}) {
    return `<div class="inspection-form-vertical"><div class="inspection-form-row"><label class="form-field"><span class="form-label form-required">检查项目名称</span><div class="inspection-count-input"><input class="form-control" data-inspection-field="project-name" value="${esc(project.name || "")}" maxlength="20" placeholder="请输入"><span class="field-count">${esc(String((project.name || "").length))} / 20</span></div></label><label class="form-field"><span class="form-label">排序</span><input class="form-control" data-inspection-field="project-order" type="number" value="${esc(project.order ?? 0)}"></label></div><div class="form-field"><span class="form-label">状态</span><div class="inspection-radio-row"><label><input type="radio" name="inspection-project-status" value="启用" ${project.status !== "禁用" ? "checked" : ""}> 启用</label><label><input type="radio" name="inspection-project-status" value="禁用" ${project.status === "禁用" ? "checked" : ""}> 禁用</label></div></div><label class="form-field"><span class="form-label">备注</span><textarea class="form-control textarea" data-inspection-field="project-remark" maxlength="300" placeholder="请输入">${esc(project.remark || "")}</textarea><span class="field-count">${esc(String((project.remark || "").length))} / 300</span></label></div>`;
  }

  function openWorkConfig(item, projectId = "") {
    const projects = state.inspectionProjects.filter((entry) => entry.workId === item.id).sort((a, b) => a.order - b.order);
    const current = projects.find((entry) => entry.id === projectId) || projects[0] || null;
    state.configSelected = new Set();
    const entries = current ? state.inspectionItems.filter((entry) => entry.projectId === current.id).sort((a, b) => a.order - b.order) : [];
    const cards = projects.map((project) => {
      const count = state.inspectionItems.filter((entry) => entry.projectId === project.id).length;
      return `<div class="inspection-project-card ${current && project.id === current.id ? "active" : ""}" data-config-project="${esc(project.id)}" data-work-id="${esc(item.id)}"><div class="project-row"><span class="project-name" title="${esc(project.name)}">${esc(project.name)}（${count}）</span><span class="project-actions"><button type="button" class="edit" data-config-project-action="edit" data-id="${esc(project.id)}" data-work-id="${esc(item.id)}">编辑</button><button type="button" class="del" data-config-project-action="delete" data-id="${esc(project.id)}" data-work-id="${esc(item.id)}">删除</button></span></div><div class="project-remark" title="${esc(project.remark || "")}">${esc(project.remark || "-")}</div></div>`;
    }).join("") || `<div class="inspection-empty" style="padding:24px 8px;">暂无作业项</div>`;
    const rows = entries.map((entry) => `<tr>
      <td class="check-cell"><input type="checkbox" data-config-select="${esc(entry.id)}" aria-label="选择${esc(entry.name)}"></td><td>${esc(entry.order)}</td><td>${esc(entry.name)}</td><td>${entry.required ? statusTag("必填", "danger") : statusTag("非必填", "muted")}</td><td>${statusTag(entry.inputType, "primary")}</td><td>${entry.options.length ? esc(`["${entry.options.join('","')}"]`) : "-"}</td>
      <td class="action-cell"><button class="table-action" type="button" data-inspection-item-action="edit" data-id="${esc(entry.id)}" data-work-id="${esc(item.id)}" data-project-id="${esc(current?.id || "")}">编辑</button><button class="table-action" type="button" data-inspection-item-action="delete" data-id="${esc(entry.id)}" data-work-id="${esc(item.id)}" data-project-id="${esc(current?.id || "")}">删除</button></td>
    </tr>`).join("");
    const body = `<div class="inspection-config-header"><div class="inspection-config-title-block"><div class="inspection-config-title-row"><span class="config-name">${esc(item.name)}</span>${statusTag(item.status === "停用" ? "停用" : "正常", item.status === "停用" ? "muted" : "normal")}</div><div class="inspection-config-meta"><span>模板编号：${esc(item.code)}</span><span>作业方式：${esc(item.mode)}</span><span>作业类型：${esc(item.type)}</span><span>设备分类：${esc(item.category)}</span></div></div><button class="btn btn-primary" type="button" data-inspection-work-action="edit" data-id="${esc(item.id)}">编辑</button></div><div class="inspection-config-layout"><aside class="inspection-config-aside"><div class="inspection-config-aside-head"><h3>作业项列表</h3><button type="button" class="link-btn" data-config-project-action="create" data-work-id="${esc(item.id)}">新增</button></div><div class="inspection-project-search"><input class="form-control" data-config-project-search placeholder="请输入"><i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i></div><div class="inspection-project-list">${cards}</div></aside><div class="inspection-config-main"><div class="inspection-config-main-head"><h3>${esc(current ? `${current.name}-作业条目` : "作业条目")}（${entries.length}）</h3><div class="inspection-config-main-actions"><button class="btn btn-secondary" type="button" data-inspection-action="config-batch-delete" data-work-id="${esc(item.id)}" data-project-id="${esc(current?.id || "")}" disabled><i class="fa-solid fa-trash"></i> 批量删除</button><button class="btn btn-primary" type="button" data-inspection-item-action="create" data-work-id="${esc(item.id)}" data-project-id="${esc(current?.id || "")}"><i class="fa-solid fa-plus"></i> 新增</button></div></div><div class="inspection-table-wrap"><table class="table inspection-detail-table inspection-config-table"><thead><tr><th class="check-cell"><input type="checkbox" data-config-select-all aria-label="全选"></th><th>排序</th><th>条目名称</th><th>是否必填</th><th>填写类型</th><th>填写项</th><th>操作</th></tr></thead><tbody>${rows || `<tr><td colspan="7"><div class="inspection-empty">暂无作业条目</div></td></tr>`}</tbody></table></div></div></div>`;
    openDrawer({ title: "作业配置", body, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>` }, "inspection-config-drawer");
  }

  function openItemDrawer(workId, itemId = "", projectId = "") {
    const item = byId(state.inspectionItems, itemId) || {};
    openDrawer({ title: itemId ? "编辑检查项" : "新增检查项", body: itemForm(item), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-inspection-save="item" data-work-id="${esc(workId)}" data-project-id="${esc(projectId || item.projectId || "")}" data-id="${esc(itemId)}">确认</button>` });
  }

  function openProjectDrawer(workId, projectId = "") {
    const project = byId(state.inspectionProjects, projectId) || {};
    openDrawer({ title: projectId ? "编辑检查项目" : "新增检查项目", body: projectForm(project), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-inspection-save="project" data-work-id="${esc(workId)}" data-id="${esc(projectId)}">确认</button>` });
  }

  function planForm(item = {}) {
    const cycle = item.cycle || "每日";
    const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const cycleFieldDisplay = (name) => (cycle === name ? "" : "display:none;");
    return `<div class="inspection-drawer-grid inspection-plan-form"><label class="form-field"><span class="form-label form-required">计划名称</span><input class="form-control" data-inspection-field="name" value="${esc(item.name || "")}" maxlength="20" placeholder="请输入"></label><label class="form-field"><span class="form-label form-required">计划等级</span><select class="form-control" data-inspection-field="level"><option ${item.level === "中" || !item.level ? "selected" : ""}>中</option><option ${item.level === "高" ? "selected" : ""}>高</option><option ${item.level === "低" ? "selected" : ""}>低</option></select></label><label class="form-field"><span class="form-label form-required">所属项目</span><select class="form-control" data-inspection-field="project"><option ${item.project === "光谷科学岛综合管廊一期" || !item.project ? "selected" : ""}>光谷科学岛综合管廊一期</option><option>科学岛综合管廊</option></select></label><label class="form-field"><span class="form-label form-required">巡检人</span><div class="inspection-person-field" data-inspection-person="巡检人"><input class="form-control inspection-person-input" type="text" readonly data-inspection-field="inspector" value="${esc(item.inspector || "")}" placeholder="请选择"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></div></label><label class="form-field"><span class="form-label form-required">负责人</span><div class="inspection-person-field" data-inspection-person="负责人"><input class="form-control inspection-person-input" type="text" readonly data-inspection-field="owner" value="${esc(item.owner || "")}" placeholder="请选择"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></div></label><label class="form-field"><span class="form-label form-required">周期类型</span><select class="form-control" data-inspection-field="cycle"><option ${cycle === "每日" ? "selected" : ""}>每日</option><option ${cycle === "每周" ? "selected" : ""}>每周</option><option ${cycle === "每月" ? "selected" : ""}>每月</option></select></label><label class="form-field"><span class="form-label form-required">定时生成时刻</span><input class="form-control" data-inspection-field="generateAt" value="${esc(item.generateAt || "00:10:00")}" type="time"></label><label class="form-field"><span class="form-label form-required">任务开始时刻</span><input class="form-control" data-inspection-field="startAt" value="${esc(item.startAt || "09:00:00")}" type="time"></label><label class="form-field" data-cycle-field="weekly" style="${cycleFieldDisplay("每周")}"><span class="form-label form-required">每周执行日</span><select class="form-control" data-inspection-field="weekDay">${weekDays.map((day) => `<option ${(item.weekDay || "周一") === day ? "selected" : ""}>${day}</option>`).join("")}</select></label><label class="form-field" data-cycle-field="monthly" style="${cycleFieldDisplay("每月")}"><span class="form-label form-required">每月执行日</span><select class="form-control" data-inspection-field="monthDay">${Array.from({ length: 31 }, (_, index) => `<option value="${index + 1}" ${Number(item.monthDay || 1) === index + 1 ? "selected" : ""}>${index + 1}号</option>`).join("")}</select></label><label class="form-field"><span class="form-label form-required">计划完成工时</span><div class="input-affix"><input class="form-control" data-inspection-field="finishHours" value="${esc(item.finishHours || 24)}" type="number" min="1"><span class="affix-icon">小时</span></div></label><div class="form-field"><span class="form-label">状态</span><div class="inspection-radio-row"><label><input type="radio" name="inspection-plan-status" value="正常" ${item.status !== "停用" ? "checked" : ""}> 正常</label><label><input type="radio" name="inspection-plan-status" value="停用" ${item.status === "停用" ? "checked" : ""}> 停用</label></div></div><label class="form-field form-span-2"><span class="form-label">备注</span><textarea class="form-control textarea" data-inspection-field="note" maxlength="300" placeholder="请输入">${esc(item.note || "")}</textarea></label><div class="form-field form-span-2"><div class="inspection-device-box"><div class="inspection-device-box-head"><span>巡检设备</span><button class="btn btn-primary" type="button" data-inspection-device-select>选择设备</button></div><div class="inspection-device-box-body"><div class="inspection-table-wrap"><table class="table inspection-device-table"><thead><tr><th>设备编码</th><th>设备名称</th><th>设备分类</th><th>标准作业</th><th>检查项目</th><th>条目</th><th>操作</th></tr></thead><tbody id="planDeviceBody"></tbody></table></div></div></div></div></div>`;
  }

  function openPlanDrawer(mode, item = {}) {
    closePersonPicker();
    closeDevicePicker();
    closeWorkViewer();
    state.planDeviceIds = [...(item.deviceIds || [])];
    openDrawer({ title: mode === "edit" ? "编辑巡检计划" : "新增巡检计划", body: planForm(item), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-inspection-save="plan" data-mode="${mode}" data-id="${esc(item.id || "")}">确定</button>` });
    renderPlanDeviceTable();
  }

  const PERSON_COLORS = ["#135AFA", "#12B7A0", "#F5A623", "#7A5AF8", "#EB5757", "#2D9CDB", "#22A06B", "#B98308"];
  const avatarText = (name) => { const text = String(name || "人员"); return text.length > 2 ? text.slice(-2) : text; };
  const avatarColor = (name) => PERSON_COLORS[[...String(name || "人员")].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PERSON_COLORS.length];
  const deptById = (id, nodes = state.departments) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = node.children ? deptById(id, node.children) : null;
      if (found) return found;
    }
    return null;
  };
  const deptNameList = (node) => (node ? [node.name, ...(node.children || []).flatMap((child) => deptNameList(child))] : []);

  function closePersonPicker() {
    document.querySelectorAll(".inspection-person-mask").forEach((mask) => mask.remove());
  }

  const deptPersonCount = (names) => state.personnel.filter((person) => names.includes(person.dept)).length;

  function renderPersonDeptTree() {
    const tree = document.getElementById("personDeptTree");
    if (!tree) return;
    const keyword = state.picker.deptKeyword.trim().toLowerCase();
    const selfMatched = (node) => !keyword || node.name.toLowerCase().includes(keyword);
    const matched = (node) => selfMatched(node) || (node.children || []).some((child) => matched(child));
    const nodeHtml = (node, level, force) => {
      if (!force && !matched(node)) return "";
      // 命中自身时展示其完整子树；仅有子级命中时只保留命中的分支
      const deep = Boolean(keyword) && (force || selfMatched(node));
      const children = deep ? (node.children || []) : (node.children || []).filter((child) => matched(child));
      const collapsed = !keyword && state.picker.deptCollapsed.has(node.id);
      const caret = children.length
        ? `<button class="person-dept-caret fa-solid fa-caret-down${collapsed ? " is-collapsed" : ""}" type="button" data-person-dept-toggle="${esc(node.id)}" aria-label="展开或收起" aria-expanded="${collapsed ? "false" : "true"}"></button>`
        : `<span class="person-dept-caret-placeholder"></span>`;
      const icon = level === 0 ? "fa-solid fa-building" : `fa-solid ${collapsed ? "fa-folder" : "fa-folder-open"}`;
      const head = `<div class="person-dept-node${state.picker.deptId === node.id ? " active" : ""}" data-person-dept="${esc(node.id)}" title="${esc(node.name)}">${caret}<i class="person-dept-icon ${icon}" aria-hidden="true"></i><span class="person-dept-name">${esc(node.name)}</span><span class="person-dept-count">${deptPersonCount(deptNameList(node))}</span></div>`;
      const body = children.length ? `<div class="person-dept-children" data-person-dept-children="${esc(node.id)}"${collapsed ? " hidden" : ""}>${children.map((child) => nodeHtml(child, level + 1, deep)).join("")}</div>` : "";
      return head + body;
    };
    const all = `<div class="person-dept-node person-dept-all${state.picker.deptId ? "" : " active"}" data-person-dept=""><span class="person-dept-caret-placeholder"></span><i class="person-dept-icon fa-solid fa-users" aria-hidden="true"></i><span class="person-dept-name">全部人员</span><span class="person-dept-count">${state.personnel.length}</span></div>`;
    const list = state.departments.map((node) => nodeHtml(node, 0)).join("");
    tree.innerHTML = all + (list || `<div class="person-dept-empty">暂无匹配部门</div>`);
  }

  const personListFiltered = () => {
    const dept = state.picker.deptId ? deptById(state.picker.deptId) : null;
    const names = dept ? deptNameList(dept) : null;
    const keyword = state.picker.keyword.trim().toLowerCase();
    return state.personnel.filter((person) => (!names || names.includes(person.dept)) && (!keyword || `${person.name} ${person.phone} ${person.dept}`.toLowerCase().includes(keyword)));
  };

  function renderPersonList() {
    const body = document.getElementById("personListBody");
    if (!body) return;
    const list = personListFiltered();
    body.innerHTML = list.length ? list.map((person) => `<tr class="${state.picker.selectedId === person.id ? "active" : ""}"><td class="person-pick-cell"><input type="radio" name="inspection-person-pick" data-person-pick="${esc(person.id)}" ${state.picker.selectedId === person.id ? "checked" : ""} aria-label="选择${esc(person.name)}"></td><td><div class="person-cell"><span class="person-avatar" style="background:${avatarColor(person.name)}">${esc(avatarText(person.name))}</span><div class="person-cell-info"><span class="person-cell-name">${esc(person.name)}</span><span class="person-cell-phone">${esc(person.phone)}</span></div></div></td></tr>`).join("") : `<tr><td colspan="2"><div class="inspection-empty">暂无匹配人员</div></td></tr>`;
  }

  function renderPersonSelected() {
    const body = document.getElementById("personSelectedBody");
    if (!body) return;
    const person = state.personnel.find((entry) => entry.id === state.picker.selectedId);
    body.innerHTML = person ? `<tr><td><div class="person-cell"><span class="person-avatar" style="background:${avatarColor(person.name)}">${esc(avatarText(person.name))}</span><span class="person-cell-name">${esc(person.name)}</span></div></td><td class="person-remove-cell"><button type="button" class="person-remove" data-person-remove="${esc(person.id)}">移除</button></td></tr>` : `<tr><td colspan="2"><div class="inspection-empty">暂无选中人员</div></td></tr>`;
  }

  function openPersonPicker(trigger) {
    closePersonPicker();
    const input = trigger.querySelector("input");
    const current = state.personnel.find((person) => person.name === String(input?.value || "").trim());
    state.picker = { target: input || null, deptId: "", keyword: "", deptKeyword: "", deptCollapsed: new Set(), selectedId: current?.id || "" };
    const mask = document.createElement("div");
    mask.className = "inspection-person-mask";
    mask.innerHTML = `<div class="inspection-person-modal" role="dialog" aria-modal="true" aria-label="${esc(trigger.dataset.inspectionPerson || "选择人员")}"><div class="inspection-person-head"><h3>选择人员</h3><button class="inspection-person-close" type="button" data-person-close aria-label="关闭">×</button></div><div class="inspection-person-main"><aside class="inspection-person-dept"><div class="inspection-person-dept-head"><i class="fa-solid fa-sitemap" aria-hidden="true"></i><span>组织架构</span></div><div class="inspection-dept-search"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input class="form-control" id="personDeptKeyword" data-person-dept-keyword placeholder="搜索部门" autocomplete="off"></div><div class="inspection-person-dept-tree" id="personDeptTree"></div></aside><section class="inspection-person-list"><div class="inspection-person-tools"><input class="form-control" id="personKeyword" placeholder="请输入"><button class="btn btn-primary" type="button" data-person-search>搜索</button><button class="btn btn-secondary" type="button" data-person-reset>重置</button></div><div class="inspection-person-table-wrap"><table class="table"><thead><tr><th colspan="2">用户</th></tr></thead><tbody id="personListBody"></tbody></table></div></section><section class="inspection-person-selected"><div class="inspection-person-selected-head"><h4>已选中人员</h4><button class="btn btn-secondary" type="button" data-person-clear>清空选中</button></div><div class="inspection-person-table-wrap"><table class="table"><thead><tr><th>昵称</th><th class="person-remove-cell">操作</th></tr></thead><tbody id="personSelectedBody"></tbody></table></div></section></div><div class="inspection-person-foot"><button class="btn btn-secondary" type="button" data-person-cancel>取消</button><button class="btn btn-primary" type="button" data-person-confirm>确定</button></div></div>`;
    document.body.append(mask);
    renderPersonDeptTree();
    renderPersonList();
    renderPersonSelected();
  }

  function taskDetailBody(item, tab = "basic") {
    const devices = (item.deviceIds || []).map((id) => byId(state.devices, id)).filter(Boolean);
    const tabs = `<div class="inspection-task-tabs"><button type="button" class="${tab === "basic" ? "active" : ""}" data-task-tab="basic" data-id="${esc(item.id)}">基本信息</button><button type="button" class="${tab === "devices" ? "active" : ""}" data-task-tab="devices" data-id="${esc(item.id)}">设备列表</button><button type="button" class="${tab === "abnormal" ? "active" : ""}" data-task-tab="abnormal" data-id="${esc(item.id)}">设备异常</button></div>`;
    const basic = `<section class="inspection-task-panel ${tab === "basic" ? "" : "hidden"}" data-task-panel="basic"><div class="detail-grid">${[["任务编号", item.code], ["任务状态", statusTag(item.status, "warning")], ["任务名称", item.name], ["所属项目", "光谷科学岛综合管廊一期"], ["关联计划", item.planName], ["巡检等级", levelTag(item.level)], ["巡检人员", item.inspector], ["负责人", item.owner], ["逾期状态", statusTag(item.overdue, "danger")], ["计划执行", item.planExecution || "未执行"], ["任务开始时间", item.plannedAt], ["任务截止时间", item.deadline], ["实际开始时间", item.startedAt], ["结果提交时间", item.submittedAt], ["巡检时长", item.duration], ["设备数量", item.deviceCount], ["异常数量", item.abnormalCount], ["创建时间", "2026-09-09 00:10:17"], ["备注", item.note]].map(([label, content]) => `<div class="info-item"><span class="info-label">${label}</span><span class="info-value">${typeof content === "string" && content.startsWith("<span") ? content : esc(content)}</span></div>`).join("")}</div></section>`;
    const devicePanel = `<section class="inspection-task-panel ${tab === "devices" ? "" : "hidden"}" data-task-panel="devices"><div class="inspection-table-wrap"><table class="table inspection-detail-table"><thead><tr><th>设备名称</th><th>设备编码</th><th>所属系统</th><th>设备分类</th><th>所属项目</th><th>所属管廊</th><th>所属舱室</th><th>所属区段</th><th>所属管线</th><th>安装位置</th><th>操作</th></tr></thead><tbody>${devices.map((device) => `<tr><td>${esc(device.name)}</td><td>${esc(device.code)}</td><td>${esc(device.system)}</td><td>${esc(device.category)}</td><td>${esc(device.project)}</td><td>${esc(device.corridor)}</td><td>${esc(device.room)}</td><td>${esc(device.section)}</td><td>${esc(device.pipeline)}</td><td>${esc(device.location)}</td><td><button class="table-action" type="button" data-inspection-device-detail="${esc(device.id)}">详情</button><button class="table-action" type="button" data-inspection-device-record="${esc(device.id)}">作业记录</button></td></tr>`).join("") || `<tr><td colspan="11"><div class="inspection-empty">暂无设备</div></td></tr>`}</tbody></table></div></section>`;
    const abnormalPanel = `<section class="inspection-task-panel ${tab === "abnormal" ? "" : "hidden"}" data-task-panel="abnormal"><div class="inspection-table-wrap"><table class="table inspection-detail-table"><thead><tr><th>设备名称</th><th>异常类型</th><th>处理状态</th><th>备注</th></tr></thead><tbody>${item.abnormalCount ? `<tr><td>${esc(devices[0]?.name || "-")}</td><td>${statusTag("设备状态异常", "danger")}</td><td>${statusTag("待处理", "warning")}</td><td>-</td></tr>` : `<tr><td colspan="4"><div class="inspection-empty">暂无设备异常</div></td></tr>`}</tbody></table></div></section>`;
    return tabs + basic + devicePanel + abnormalPanel;
  }

  function openTaskDetail(item, tab = "basic") {
    openDrawer({ title: "巡检任务详情", body: taskDetailBody(item, tab), footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>` }, "inspection-task-drawer");
  }

  const closeWorkModal = () => document.querySelectorAll(".inspection-works-mask").forEach((mask) => mask.remove());
  const workInfoTable = (work) => `<table class="inspection-works-info"><tbody>
    <tr><th>模板名称</th><td>${esc(work.name)}</td><th>作业方式</th><td>${esc(work.mode)}</td></tr>
    <tr><th>模板编号</th><td>${esc(work.code)}</td><th>设备分类</th><td>${esc(work.category)}</td></tr>
    <tr><th>作业类型</th><td>${esc(work.type)}</td><th>状态</th><td>${statusTag("启用", "normal")}</td></tr>
  </tbody></table>`;

  function workCardsHtml(work, mode) {
    const projects = state.inspectionProjects.filter((entry) => entry.workId === work.id).sort((a, b) => a.order - b.order);
    return projects.map((project) => {
      const entries = state.inspectionItems.filter((entry) => entry.projectId === project.id).sort((a, b) => a.order - b.order);
      const head = `<div class="inspection-work-card-head"><div class="inspection-work-card-info"><div class="inspection-work-card-title"><span class="name">${esc(project.name)}</span><span class="count">（条目：${entries.length}）</span></div><div class="inspection-work-card-remark">${esc(project.remark || "如果有则显示备注信息")}</div></div><div class="inspection-work-card-tools">${mode === "record" ? statusTag("未处理", "muted") : ""}<button type="button" class="inspection-work-collapse" data-works-collapse aria-label="展开/收起"><i class="fa-solid fa-chevron-down"></i></button></div></div>`;
      const rows = entries.map((entry) => mode === "record"
        ? `<tr><td>${esc(entry.name)}</td><td>${entry.required ? "必填" : "非必填"}</td><td>${esc(entry.inputType)}</td><td>-</td><td>-</td><td>-</td></tr>`
        : `<tr><td>${esc(entry.name)}</td><td>${entry.required ? "必填" : "非必填"}</td><td>${esc(entry.inputType)}</td><td>${esc(entry.options.join("，"))}</td><td class="wrap">${esc(entry.remark)}</td></tr>`).join("");
      const table = mode === "record"
        ? `<div class="inspection-table-wrap"><table class="table inspection-detail-table"><thead><tr><th>条目名称</th><th>是否必填</th><th>填写类型</th><th>填写结果</th><th>录入人</th><th>录入时间</th></tr></thead><tbody>${rows}</tbody></table></div>`
        : `<div class="inspection-table-wrap"><table class="table inspection-detail-table"><thead><tr><th>条目名称</th><th>是否必填</th><th>填写类型</th><th>填写项</th><th>备注</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      return `<div class="inspection-work-card">${head}${table}</div>`;
    }).join("") || `<div class="inspection-empty">暂无设备标准作业</div>`;
  }

  function openDeviceWorkModal(title, device, mode) {
    const work = byId(state.standardWorks, device.workId);
    if (!work) { showToast("该设备暂未关联标准作业"); return; }
    closeWorkModal();
    const mask = document.createElement("div");
    mask.className = "inspection-works-mask";
    mask.innerHTML = `<div class="inspection-works-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="inspection-works-head"><h3>${esc(title)}</h3><button class="inspection-works-close" type="button" data-works-close aria-label="关闭"><i class="fa-solid fa-xmark"></i></button></div><div class="inspection-works-body">${workInfoTable(work)}<h4 class="inspection-works-subtitle">设备标准作业</h4>${workCardsHtml(work, mode)}</div></div>`;
    document.body.append(mask);
  }

  function readFields(scope) {
    const result = {};
    (scope || document).querySelectorAll("[data-inspection-field]").forEach((field) => { result[field.dataset.inspectionField] = field.value.trim(); });
    return result;
  }
  function readDrawerFields() { return readFields(document.getElementById("drawerBody")); }
  function saveWork(button) {
    const fields = readDrawerFields();
    if (!fields.system || !fields.category || !fields.name) { showToast("请填写所属系统、设备分类和标准作业名称"); return; }
    const mode = document.querySelector('input[name="inspection-work-mode"]:checked')?.value || "顺序作业";
    const item = byId(state.standardWorks, button.dataset.id);
    if (item) Object.assign(item, { ...fields, mode, updatedAt: now(), updater: "当前用户" });
    else state.standardWorks.unshift({ id: `SW-${Date.now()}`, code: `KCDS_INSP_${Date.now()}`, name: fields.name, type: "巡检", mode, system: fields.system, category: fields.category, itemCount: 0, entryCount: 0, creator: "当前用户", createdAt: now(), updater: "当前用户", updatedAt: now(), status: "正常", remark: fields.remark });
    window.closeAppDrawer(); render(); showToast(item ? "标准作业已更新" : "标准作业已创建");
  }
  const syncWorkCounts = (workId) => {
    const work = byId(state.standardWorks, workId);
    if (!work) return;
    work.itemCount = state.inspectionProjects.filter((entry) => entry.workId === workId).length;
    work.entryCount = state.inspectionItems.filter((entry) => entry.workId === workId).length;
  };
  function saveProject(button) {
    const fields = readDrawerFields();
    if (!fields["project-name"]) { showToast("请输入检查项目名称"); return; }
    const project = byId(state.inspectionProjects, button.dataset.id);
    const next = { id: project?.id || `PRJ-${Date.now()}`, workId: button.dataset.workId, order: Number(fields["project-order"] || 0), name: fields["project-name"], status: document.querySelector('input[name="inspection-project-status"]:checked')?.value || "启用", remark: fields["project-remark"] || "" };
    if (project) Object.assign(project, next); else state.inspectionProjects.push(next);
    syncWorkCounts(button.dataset.workId);
    window.closeAppDrawer(); showToast(project ? "检查项目已更新" : "检查项目已新增");
    const work = byId(state.standardWorks, button.dataset.workId); if (work) openWorkConfig(work, next.id); render();
  }
  function saveItem(button) {
    const fields = readDrawerFields();
    const inputType = document.querySelector('input[name="inspection-item-input-type"]:checked')?.value || "单选";
    if (!fields["item-name"]) { showToast("请输入条目名称"); return; }
    if (fields["item-order"] === "") { showToast("请输入排序"); return; }
    const options = inputType === "单选" || inputType === "多选" ? (fields["item-options"] || "").split("、").map((entry) => entry.trim()).filter(Boolean) : [];
    const item = byId(state.inspectionItems, button.dataset.id);
    const next = { id: item?.id || `ITEM-${Date.now()}`, workId: button.dataset.workId, projectId: button.dataset.projectId || item?.projectId || "", order: Number(fields["item-order"] || 0), name: fields["item-name"], required: document.querySelector('input[name="inspection-item-required"]:checked')?.value !== "false", inputType, options, remark: fields["item-remark"] || "", updatedAt: now() };
    if (item) Object.assign(item, next); else state.inspectionItems.push(next);
    syncWorkCounts(button.dataset.workId);
    window.closeAppDrawer(); showToast(item ? "检查项已更新" : "检查项已新增");
    const work = byId(state.standardWorks, button.dataset.workId); if (work) openWorkConfig(work, next.projectId); render();
  }
  function savePlan(button) {
    closePersonPicker();
    closeDevicePicker();
    closeWorkViewer();
    const fields = readDrawerFields();
    if (!fields.name || !fields.project || !fields.inspector || !fields.owner) { showToast("请填写计划名称、所属项目、巡检人和负责人"); return; }
    const deviceIds = [...state.planDeviceIds];
    const item = byId(state.plans, button.dataset.id);
    const next = { ...fields, level: fields.level || "中", cycle: fields.cycle || "每日", finishHours: Number(fields.finishHours || 24), monthDay: Number(fields.monthDay || 1), status: document.querySelector('input[name="inspection-plan-status"]:checked')?.value || "正常", deviceIds, target: deviceIds.map((id) => byId(state.devices, id)?.name).filter(Boolean).join("、") || "暂无设备" };
    if (item) Object.assign(item, next); else state.plans.unshift({ id: `PLAN-${Date.now()}`, code: `IP${Date.now()}`, createdAt: now(), lastGenerateAt: "-", nextGenerateAt: "-", ...next });
    window.closeAppDrawer(); render(); showToast(item ? "巡检计划已更新" : "巡检计划已创建");
  }
  function generateTask(plan) {
    const startedAt = new Date();
    const day = startedAt.toISOString().slice(0, 10);
    const compactDay = day.replace(/-/g, "");
    const start = plan.startAt || "09:00:00";
    const deviceIds = plan.deviceIds || [];
    const task = { id: `TASK-${Date.now()}`, code: `IT${compactDay}${start.slice(0, 2)}00${String(Math.floor(Math.random() * 90) + 10)}`, name: `${plan.name}-${compactDay}${start.slice(0, 2)}00`, planId: plan.id, planName: plan.name, level: plan.level, inspector: plan.inspector, owner: plan.owner, status: "待巡检", planExecution: "未执行", result: "-", overdue: "未超期", deviceCount: deviceIds.length, itemCount: deviceIds.length * 3, abnormalCount: 0, plannedAt: `${day} ${start}`, deadline: `${new Date(startedAt.getTime() + 86400000).toISOString().slice(0, 10)} ${start}`, startedAt: "-", submittedAt: "-", duration: "-", note: plan.note || "-", deviceIds, generatedAt: now() };
    state.generatedTasks.unshift(task);
    writeGeneratedTasks(state.generatedTasks);
    state.tasks = [...clone(state.generatedTasks), ...clone(data.tasks)];
    render();
    showToast(`已生成巡检任务：${task.name}`);
  }
  function hasRelatedTasks(planId) {
    return state.tasks.some((task) => task.planId === planId);
  }

  /* ============ 巡检设备：选择弹窗 + 抽屉内回显 ============ */
  const workOfDevice = (device) => byId(state.standardWorks, device?.workId);
  const workProjects = (workId) => state.inspectionProjects.filter((entry) => entry.workId === workId);
  const workEntries = (projectId) => state.inspectionItems.filter((entry) => entry.projectId === projectId).sort((a, b) => a.order - b.order);
  const projectEntryCount = (projectId) => state.inspectionItems.filter((entry) => entry.projectId === projectId).length;
  const workEntryCount = (workId) => state.inspectionItems.filter((entry) => entry.workId === workId).length;
  const deviceCategoryOptions = () => [...new Set(state.devices.map((device) => device.category).filter(Boolean))];

  function renderPlanDeviceTable() {
    const body = document.getElementById("planDeviceBody");
    if (!body) return;
    const list = state.planDeviceIds.map((id) => byId(state.devices, id)).filter(Boolean);
    body.innerHTML = list.length ? list.map((device) => {
      const work = workOfDevice(device);
      const projectCount = work ? workProjects(work.id).length : 0;
      const entryCount = work ? workEntryCount(work.id) : 0;
      return `<tr><td class="wrap">${esc(device.code)}</td><td>${esc(device.name)}</td><td>${esc(device.category)}</td><td>${work ? statusTag(work.name, "primary") : "-"}</td><td>${projectCount}</td><td>${entryCount}</td><td class="action-cell"><button class="table-action" type="button" data-plan-device-work="${esc(device.id)}">标准作业</button><button class="table-action is-danger" type="button" data-plan-device-remove="${esc(device.id)}">移除</button></td></tr>`;
    }).join("") : `<tr><td colspan="7"><div class="inspection-empty">暂无选择设备</div></td></tr>`;
  }

  function closeDevicePicker() { document.querySelectorAll(".inspection-device-mask").forEach((mask) => mask.remove()); }

  function devicePickerList() {
    const picker = state.devicePicker;
    const keyword = picker.keyword.trim().toLowerCase();
    const code = picker.code.trim().toLowerCase();
    return state.devices.filter((device) => (!keyword || String(device.name).toLowerCase().includes(keyword)) && (!code || String(device.code).toLowerCase().includes(code)) && (!picker.category || device.category === picker.category));
  }

  function renderDevicePicker() {
    const body = document.getElementById("devicePickBody");
    if (!body) return;
    const list = devicePickerList();
    const picker = state.devicePicker;
    body.innerHTML = list.length ? list.map((device) => `<tr data-device-row="${esc(device.id)}"><td class="check-cell"><input type="checkbox" data-device-pick="${esc(device.id)}" ${picker.selected.has(device.id) ? "checked" : ""} aria-label="选择${esc(device.name)}"></td><td class="device-name-cell">${esc(device.name)}</td><td>${esc(device.code)}</td><td>${esc(device.system)}</td><td>${esc(device.category)}</td><td>${esc(device.project)}</td><td>${esc(device.corridor)}</td><td>${esc(device.room)}</td><td>${esc(device.section)}</td><td>${esc(device.pipeline)}</td><td>${esc(device.location)}</td></tr>`).join("") : `<tr><td colspan="11"><div class="inspection-empty">暂无匹配设备</div></td></tr>`;
    const count = document.getElementById("devicePickCount");
    if (count) count.textContent = `共 ${list.length} 条记录，已选 ${picker.selected.size} 条`;
    const selectAll = document.querySelector("[data-device-select-all]");
    if (selectAll) selectAll.checked = list.length > 0 && list.every((device) => picker.selected.has(device.id));
  }

  function openDevicePicker() {
    closeDevicePicker();
    state.devicePicker = { keyword: "", code: "", category: "", selected: new Set(state.planDeviceIds) };
    const mask = document.createElement("div");
    mask.className = "inspection-device-mask";
    mask.innerHTML = `<div class="inspection-device-modal" role="dialog" aria-modal="true" aria-label="选择设备"><div class="inspection-device-head"><h3>选择设备</h3><button class="inspection-device-close" type="button" data-device-close aria-label="关闭">×</button></div><div class="inspection-device-body"><div class="inspection-device-filters"><label class="form-field"><span class="form-label">设备名称</span><input class="form-control" id="devicePickName" placeholder="请输入设备名称"></label><label class="form-field"><span class="form-label">设备编码</span><input class="form-control" id="devicePickCode" placeholder="请输入设备编码"></label><label class="form-field"><span class="form-label">设备分类</span><select class="form-control" id="devicePickCategory"><option value="">请选择</option>${deviceCategoryOptions().map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}</select></label><div class="inspection-device-filter-actions"><button class="btn btn-secondary" type="button" data-device-reset>重置</button><button class="btn btn-primary" type="button" data-device-search>搜索</button></div></div><div class="inspection-device-tablewrap"><table class="table inspection-device-pick-table"><thead><tr><th class="check-cell"><input type="checkbox" data-device-select-all aria-label="全选"></th><th>设备名称</th><th>设备编码</th><th>所属系统</th><th>设备分类</th><th>所属项目</th><th>所属管廊</th><th>所属舱室</th><th>所属区段</th><th>所属管线</th><th>安装位置</th></tr></thead><tbody id="devicePickBody"></tbody></table></div></div><div class="inspection-device-foot"><span class="inspection-device-count" id="devicePickCount"></span><div class="inspection-device-foot-actions"><button class="btn btn-secondary" type="button" data-device-cancel>取消</button><button class="btn btn-primary" type="button" data-device-confirm>确定</button></div></div></div>`;
    document.body.append(mask);
    renderDevicePicker();
  }

  /* ============ 计划内标准作业 ============ */
  function closeWorkViewer() {
    document.querySelectorAll(".inspection-work-mask").forEach((mask) => mask.remove());
    closeMiniModal();
  }

  function renderWorkViewer() {
    const body = document.getElementById("workViewerBody");
    if (!body) return;
    const device = byId(state.devices, state.workViewer.deviceId);
    if (!device) { body.innerHTML = `<div class="inspection-empty">未找到设备信息</div>`; return; }
    const work = workOfDevice(device);
    if (!work) { body.innerHTML = `<div class="inspection-empty">该设备暂未关联标准作业</div>`; return; }
    const projects = workProjects(work.id).slice().sort((a, b) => a.order - b.order);
    const current = projects.find((entry) => entry.id === state.workViewer.projectId) || projects[0] || null;
    state.workViewer.projectId = current?.id || "";
    const entries = current ? workEntries(current.id) : [];
    const projectRows = projects.map((project) => {
      const active = current && project.id === current.id;
      return `<tr class="${active ? "active" : ""}" data-work-project-row="${esc(project.id)}"><td class="work-project-cell"><span class="work-project-name">${esc(project.name)}</span>${active ? `<span class="inspection-work-editing">当前编辑中</span>` : ""}</td><td>${projectEntryCount(project.id)}</td><td>${esc(project.order)}</td><td class="action-cell"><button class="table-action" type="button" data-work-project-edit="${esc(project.id)}">编辑</button><button class="table-action is-danger" type="button" data-work-project-delete="${esc(project.id)}">删除</button></td></tr>`;
    }).join("") || `<tr><td colspan="4"><div class="inspection-empty">暂无检查项目</div></td></tr>`;
    const entryRows = entries.map((entry) => `<tr><td>${esc(entry.name)}</td><td>${esc(entry.inputType)}</td><td>${entry.required === false ? "非必填" : "必填"}</td><td class="wrap">${esc(entry.options?.join(", ") || "-")}</td><td>${esc(entry.unit || "-")}</td><td class="wrap">${esc(entry.remark || "-")}</td><td>${esc(entry.order)}</td><td class="action-cell"><button class="table-action" type="button" data-work-item-edit="${esc(entry.id)}">编辑</button><button class="table-action is-danger" type="button" data-work-item-delete="${esc(entry.id)}">删除</button></td></tr>`).join("") || `<tr><td colspan="8"><div class="inspection-empty">暂无作业条目</div></td></tr>`;
    const modeOptions = ["顺序作业", "并行作业"].map((mode) => `<option ${work.mode === mode ? "selected" : ""}>${mode}</option>`).join("");
    body.innerHTML = `<section class="inspection-work-summary"><div class="inspection-work-title"><span class="inspection-work-device">${esc(device.name)}</span><span class="inspection-work-code">${esc(device.code)}</span><span class="inspection-tag">巡检场景</span>${statusTag(work.name, "primary")}</div><div class="inspection-work-mode"><span>作业模式</span><select class="form-control" data-work-mode>${modeOptions}</select></div></section><p class="inspection-work-tip">上方选择检查项目，下方集中维护条目内容，减少横向挤压。</p><section class="inspection-work-block"><div class="inspection-work-block-head"><h4>检查项目</h4><button class="btn btn-primary" type="button" data-work-project-create>新增</button></div><p class="inspection-work-hint">单击行切换下方条目，新增和编辑通过弹窗维护。</p><div class="inspection-table-wrap"><table class="table inspection-work-table inspection-work-table-project"><thead><tr><th>检查项目</th><th>条目</th><th>排序</th><th>操作</th></tr></thead><tbody>${projectRows}</tbody></table></div></section><section class="inspection-work-block"><div class="inspection-work-block-head"><h4>${esc(current ? current.name : "作业条目")}</h4>${current ? `<button class="btn btn-primary" type="button" data-work-item-create="${esc(current.id)}">新增</button>` : ""}</div><p class="inspection-work-hint">当前作业项共 ${entries.length} 个条目，可通过新增和编辑维护条目内容</p><div class="inspection-table-wrap"><table class="table inspection-work-table inspection-work-table-entry"><thead><tr><th>条目名称</th><th>类型</th><th>必填</th><th>填写项</th><th>单位</th><th>备注</th><th>排序</th><th>操作</th></tr></thead><tbody>${entryRows}</tbody></table></div></section>`;
  }

  function openWorkViewer(deviceId, projectId = "") {
    const device = byId(state.devices, deviceId);
    if (!device) return;
    if (!workOfDevice(device)) { showToast("该设备暂未关联标准作业"); return; }
    closeWorkViewer();
    state.workViewer = { deviceId, projectId };
    const mask = document.createElement("div");
    mask.className = "inspection-work-mask";
    mask.innerHTML = `<div class="inspection-work-modal" role="dialog" aria-modal="true" aria-label="计划内标准作业"><div class="inspection-work-head"><h3>计划内标准作业</h3><div class="inspection-work-head-actions"><button class="inspection-work-icon" type="button" data-work-close aria-label="关闭">×</button></div></div><div class="inspection-work-body" id="workViewerBody"></div><div class="inspection-work-foot"><button class="btn btn-secondary" type="button" data-work-close>取消</button><button class="btn btn-primary" type="button" data-work-close>确认</button></div></div>`;
    document.body.append(mask);
    renderWorkViewer();
  }

  /* ============ 标准作业内的检查项目 / 条目弹窗表单 ============ */
  function closeMiniModal() { document.querySelectorAll(".inspection-mini-mask").forEach((mask) => mask.remove()); }
  function openMiniModal({ title, body, onConfirm }) {
    closeMiniModal();
    const mask = document.createElement("div");
    mask.className = "inspection-mini-mask";
    mask.innerHTML = `<div class="inspection-mini-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="inspection-mini-head"><h3>${esc(title)}</h3><button class="inspection-mini-close" type="button" data-mini-close aria-label="关闭">×</button></div><div class="inspection-mini-body">${body}</div><div class="inspection-mini-foot"><button class="btn btn-secondary" type="button" data-mini-close>取消</button><button class="btn btn-primary" type="button" data-mini-confirm>确定</button></div></div>`;
    document.body.append(mask);
    mask._confirm = onConfirm;
  }

  function openWorkProjectModal(workId, projectId = "") {
    const project = byId(state.inspectionProjects, projectId) || {};
    openMiniModal({ title: projectId ? "编辑检查项目" : "新增检查项目", body: projectForm(project), onConfirm: (mask, button) => saveWorkProject(button, mask, workId, projectId) });
  }
  function saveWorkProject(button, mask, workId, projectId) {
    const fields = readFields(mask);
    if (!fields["project-name"]) { showToast("请输入检查项目名称"); return; }
    const project = byId(state.inspectionProjects, projectId);
    const next = { id: project?.id || `PRJ-${Date.now()}`, workId, order: Number(fields["project-order"] || 0), name: fields["project-name"], status: mask.querySelector('input[name="inspection-project-status"]:checked')?.value || "启用", remark: fields["project-remark"] || "" };
    if (project) Object.assign(project, next); else state.inspectionProjects.push(next);
    syncWorkCounts(workId);
    closeMiniModal();
    state.workViewer.projectId = next.id;
    renderWorkViewer();
    showToast(project ? "检查项目已更新" : "检查项目已新增");
  }

  function openWorkItemModal(workId, projectId, itemId = "") {
    const item = byId(state.inspectionItems, itemId) || {};
    openMiniModal({ title: itemId ? "编辑检查项" : "新增检查项", body: itemForm(item), onConfirm: (mask, button) => saveWorkItem(button, mask, workId, projectId, itemId) });
  }
  function saveWorkItem(button, mask, workId, projectId, itemId) {
    const fields = readFields(mask);
    const inputType = mask.querySelector('input[name="inspection-item-input-type"]:checked')?.value || "单选";
    if (!fields["item-name"]) { showToast("请输入条目名称"); return; }
    if (fields["item-order"] === "") { showToast("请输入排序"); return; }
    const options = inputType === "单选" || inputType === "多选" ? (fields["item-options"] || "").split("、").map((entry) => entry.trim()).filter(Boolean) : [];
    const item = byId(state.inspectionItems, itemId);
    const next = { id: item?.id || `ITEM-${Date.now()}`, workId, projectId: projectId || item?.projectId || "", order: Number(fields["item-order"] || 0), name: fields["item-name"], required: mask.querySelector('input[name="inspection-item-required"]:checked')?.value !== "false", inputType, options, unit: item?.unit || "-", remark: fields["item-remark"] || "", updatedAt: now() };
    if (item) Object.assign(item, next); else state.inspectionItems.push(next);
    syncWorkCounts(workId);
    closeMiniModal();
    renderWorkViewer();
    showToast(item ? "检查项已更新" : "检查项已新增");
  }

  document.addEventListener("click", (event) => {
    const personTrigger = event.target.closest("[data-inspection-person]");
    if (personTrigger) { event.preventDefault(); openPersonPicker(personTrigger); return; }
    if (document.querySelector(".inspection-person-mask")) {
      const deptToggle = event.target.closest("[data-person-dept-toggle]");
      if (deptToggle) { const id = deptToggle.dataset.personDeptToggle; if (state.picker.deptCollapsed.has(id)) state.picker.deptCollapsed.delete(id); else state.picker.deptCollapsed.add(id); renderPersonDeptTree(); return; }
      const deptNode = event.target.closest("[data-person-dept]");
      if (deptNode) { const id = deptNode.dataset.personDept; state.picker.deptId = id && state.picker.deptId !== id ? id : ""; renderPersonDeptTree(); renderPersonList(); return; }
      if (event.target.closest("[data-person-search]")) { const keyword = document.getElementById("personKeyword"); state.picker.keyword = keyword ? keyword.value.trim() : ""; renderPersonList(); return; }
      if (event.target.closest("[data-person-reset]")) { const keyword = document.getElementById("personKeyword"); const deptKeyword = document.getElementById("personDeptKeyword"); if (keyword) keyword.value = ""; if (deptKeyword) deptKeyword.value = ""; state.picker.deptId = ""; state.picker.keyword = ""; state.picker.deptKeyword = ""; renderPersonDeptTree(); renderPersonList(); return; }
      if (event.target.closest("[data-person-clear]") || event.target.closest("[data-person-remove]")) { state.picker.selectedId = ""; renderPersonList(); renderPersonSelected(); return; }
      const personRow = event.target.closest("#personListBody tr");
      if (personRow) { const radio = personRow.querySelector("[data-person-pick]"); if (radio) { state.picker.selectedId = radio.dataset.personPick; renderPersonList(); renderPersonSelected(); } return; }
      if (event.target.closest("[data-person-confirm]")) { const person = state.personnel.find((entry) => entry.id === state.picker.selectedId); if (state.picker.target) state.picker.target.value = person ? person.name : ""; closePersonPicker(); return; }
      if (event.target.closest("[data-person-close]") || event.target.closest("[data-person-cancel]")) { closePersonPicker(); return; }
      if (event.target.classList?.contains("inspection-person-mask")) { closePersonPicker(); return; }
    }
    const miniMask = event.target.closest(".inspection-mini-mask");
    if (miniMask) {
      if (event.target.closest("[data-mini-close]")) { closeMiniModal(); return; }
      if (event.target.closest("[data-mini-confirm]")) { const button = event.target.closest("[data-mini-confirm]"); miniMask._confirm?.(miniMask, button); return; }
      if (event.target.classList?.contains("inspection-mini-mask")) { closeMiniModal(); return; }
    }
    const workMask = event.target.closest(".inspection-work-mask");
    if (workMask) {
      const work = workOfDevice(byId(state.devices, state.workViewer.deviceId));
      if (event.target.closest("[data-work-close]")) { closeWorkViewer(); return; }
      if (event.target.closest("[data-work-project-create]")) { if (work) openWorkProjectModal(work.id); return; }
      if (event.target.closest("[data-work-project-edit]")) { if (work) openWorkProjectModal(work.id, event.target.closest("[data-work-project-edit]").dataset.workProjectEdit); return; }
      if (event.target.closest("[data-work-project-delete]")) { const projectId = event.target.closest("[data-work-project-delete]").dataset.workProjectDelete; const project = byId(state.inspectionProjects, projectId); if (project) window.openAppConfirm({ title: "删除检查项目", message: "确认删除当前检查项目吗？其下作业条目将一并删除。", confirmText: "确认删除", onConfirm: () => { state.inspectionProjects = state.inspectionProjects.filter((entry) => entry.id !== projectId); state.inspectionItems = state.inspectionItems.filter((entry) => entry.projectId !== projectId); if (work) syncWorkCounts(work.id); state.workViewer.projectId = ""; renderWorkViewer(); showToast("检查项目已删除"); } }); return; }
      if (event.target.closest("[data-work-item-create]")) { if (work) openWorkItemModal(work.id, event.target.closest("[data-work-item-create]").dataset.workItemCreate); return; }
      if (event.target.closest("[data-work-item-edit]")) { const item = byId(state.inspectionItems, event.target.closest("[data-work-item-edit]").dataset.workItemEdit); if (work && item) openWorkItemModal(work.id, item.projectId, item.id); return; }
      if (event.target.closest("[data-work-item-delete]")) { const itemId = event.target.closest("[data-work-item-delete]").dataset.workItemDelete; window.openAppConfirm({ title: "删除检查项", message: "确认删除当前检查项吗？", confirmText: "确认删除", onConfirm: () => { state.inspectionItems = state.inspectionItems.filter((entry) => entry.id !== itemId); if (work) syncWorkCounts(work.id); renderWorkViewer(); showToast("检查项已删除"); } }); return; }
      const projectRow = event.target.closest("[data-work-project-row]");
      if (projectRow) { state.workViewer.projectId = projectRow.dataset.workProjectRow; renderWorkViewer(); return; }
      if (event.target.classList?.contains("inspection-work-mask")) { closeWorkViewer(); return; }
    }
    const deviceMask = event.target.closest(".inspection-device-mask");
    if (deviceMask) {
      if (event.target.closest("[data-device-close]") || event.target.closest("[data-device-cancel]")) { closeDevicePicker(); return; }
      if (event.target.closest("[data-device-confirm]")) { state.planDeviceIds = [...state.devicePicker.selected]; renderPlanDeviceTable(); closeDevicePicker(); showToast(`已选择 ${state.planDeviceIds.length} 台设备`); return; }
      if (event.target.closest("[data-device-search]")) { state.devicePicker.keyword = document.getElementById("devicePickName")?.value.trim() || ""; state.devicePicker.code = document.getElementById("devicePickCode")?.value.trim() || ""; state.devicePicker.category = document.getElementById("devicePickCategory")?.value || ""; renderDevicePicker(); return; }
      if (event.target.closest("[data-device-reset]")) { ["devicePickName", "devicePickCode"].forEach((id) => { const field = document.getElementById(id); if (field) field.value = ""; }); const category = document.getElementById("devicePickCategory"); if (category) category.value = ""; state.devicePicker.keyword = ""; state.devicePicker.code = ""; state.devicePicker.category = ""; renderDevicePicker(); return; }
      const deviceRow = event.target.closest("[data-device-row]");
      if (deviceRow && !event.target.closest("input")) { const id = deviceRow.dataset.deviceRow; if (state.devicePicker.selected.has(id)) state.devicePicker.selected.delete(id); else state.devicePicker.selected.add(id); renderDevicePicker(); return; }
      if (event.target.classList?.contains("inspection-device-mask")) { closeDevicePicker(); return; }
      return;
    }
    const optionAdd = event.target.closest("[data-option-add]");
    if (optionAdd) { const editor = optionAdd.closest("[data-option-editor]"); if (editor.querySelector(".inspection-option-input")) return; const input = document.createElement("input"); input.className = "inspection-option-input"; input.maxLength = 20; input.placeholder = "请输入"; let done = false; const commit = () => { if (done) return; done = true; const text = input.value.trim(); if (text) { const hidden = document.querySelector('[data-inspection-field="item-options"]'); if (hidden) hidden.value = hidden.value ? `${hidden.value}、${text}` : text; } syncOptionEditor(); }; input.addEventListener("keydown", (keyEvent) => { if (keyEvent.key === "Enter") { keyEvent.preventDefault(); commit(); } }); input.addEventListener("blur", commit); editor.insertBefore(input, optionAdd); input.focus(); return; }
    const optionRemove = event.target.closest("[data-option-remove]");
    if (optionRemove) { const hidden = document.querySelector('[data-inspection-field="item-options"]'); if (hidden) { const options = hidden.value.split("、").map((entry) => entry.trim()).filter(Boolean); options.splice(Number(optionRemove.dataset.optionRemove), 1); hidden.value = options.join("、"); syncOptionEditor(); } return; }
    const configProjectAction = event.target.closest("[data-config-project-action]");
    if (configProjectAction) { event.stopPropagation(); const work = byId(state.standardWorks, configProjectAction.dataset.workId); if (!work) return; const type = configProjectAction.dataset.configProjectAction; const pid = configProjectAction.dataset.id;
      if (type === "create") openProjectDrawer(work.id);
      if (type === "edit") openProjectDrawer(work.id, pid);
      if (type === "delete") window.openAppConfirm({ title: "删除检查项目", message: "确认删除当前检查项目吗？其下作业条目将一并删除。", confirmText: "确认删除", onConfirm: () => { state.inspectionProjects = state.inspectionProjects.filter((entry) => entry.id !== pid); state.inspectionItems = state.inspectionItems.filter((entry) => entry.projectId !== pid); syncWorkCounts(work.id); render(); const first = state.inspectionProjects.find((entry) => entry.workId === work.id); openWorkConfig(work, first?.id || ""); showToast("检查项目已删除"); } });
      return; }
    const configProject = event.target.closest("[data-config-project]");
    if (configProject) { const work = byId(state.standardWorks, configProject.dataset.workId); if (work) openWorkConfig(work, configProject.dataset.configProject); return; }
    const more = event.target.closest("[data-inspection-more]");
    if (more) { event.stopPropagation(); hideMoreMenus(); const id = more.dataset.inspectionMore; const item = byId(state.standardWorks, id) || byId(state.plans, id); const menu = document.createElement("div"); menu.className = "inspection-more-menu"; menu.innerHTML = more.dataset.moreType === "plan"
      ? `<button type="button" data-inspection-more-action="toggle-plan" data-id="${esc(id)}">${item?.status === "正常" ? "停用" : "启用"}</button><button type="button" data-inspection-more-action="generate-task" data-id="${esc(id)}">生成任务</button><button type="button" data-inspection-more-action="delete-plan" data-id="${esc(id)}">删除</button>`
      : `<button type="button" data-inspection-more-action="detail" data-id="${esc(id)}">详情</button><button type="button" data-inspection-more-action="config" data-id="${esc(id)}">作业配置</button><button type="button" data-inspection-more-action="delete" data-id="${esc(id)}">删除</button>`;
      document.body.append(menu);
      const rect = more.getBoundingClientRect(); const width = menu.offsetWidth || 116; let left = Math.round(rect.left); if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8); menu.style.left = `${left}px`;
      let top = Math.round(rect.bottom + 4); const height = menu.offsetHeight || 110; if (top + height > window.innerHeight - 8) top = Math.max(8, Math.round(rect.top - height - 4)); menu.style.top = `${top}px`;
      return; }
    const pageButton = event.target.closest("[data-inspection-page]");
    if (pageButton && !pageButton.disabled) { const action = pageButton.dataset.inspectionPage; const pages = Math.max(1, Math.ceil((pageKey === "inspection.standard-works" ? state.standardWorks.length : pageKey === "inspection.plans" ? state.plans.length : state.tasks.length) / state.pageSize)); state.page = action === "prev" ? Math.max(1, state.page - 1) : action === "next" ? Math.min(pages, state.page + 1) : Number(action); render(); return; }
    const action = event.target.closest("[data-inspection-action]")?.dataset.inspectionAction;
    if (action === "search") { state.filters = currentFilters(); state.page = 1; render(); }
    if (action === "reset") { document.querySelectorAll("[data-inspection-filter]").forEach((field) => { field.value = ""; }); state.filters = {}; state.page = 1; render(); }
    if (action === "expand") { const button = event.target.closest("[data-inspection-action]"); const expanded = document.querySelector(".inspection-filters")?.classList.toggle("expanded"); const label = button?.querySelector("span"); if (label) label.textContent = expanded ? "收起" : "展开"; const icon = button?.querySelector("i"); if (icon) icon.className = `fa-solid ${expanded ? "fa-chevron-up" : "fa-chevron-down"}`; }
    if (action === "create-work") openWorkDrawer("create");
    if (action === "create-plan") openPlanDrawer("create");
    if (action === "delete-selected") { const list = pageKey === "inspection.plans" ? state.plans : state.tasks; if (!state.selected.size) return; if (pageKey === "inspection.plans" && [...state.selected].some((id) => hasRelatedTasks(id))) { window.openAppConfirm({ title: "提示", message: "当前计划有关联了巡检任务，请解除关联后删除", confirmText: "知道了", okClass: "btn-primary" }); return; } window.openAppConfirm({ title: "批量删除", message: `确认删除已选中的 ${state.selected.size} 条记录吗？`, confirmText: "确认删除", onConfirm: () => { const removed = [...state.selected]; const kept = list.filter((item) => !state.selected.has(item.id)); if (pageKey === "inspection.plans") state.plans = kept; else { state.tasks = kept; state.generatedTasks = state.generatedTasks.filter((task) => !removed.includes(task.id)); writeGeneratedTasks(state.generatedTasks); } state.selected.clear(); render(); showToast("已删除选中记录"); } }); }
    if (action === "config-batch-delete") { const button = event.target.closest('[data-inspection-action="config-batch-delete"]'); if (!state.configSelected.size) return; const work = byId(state.standardWorks, button.dataset.workId); window.openAppConfirm({ title: "批量删除", message: `确认删除已选中的 ${state.configSelected.size} 条作业条目吗？`, confirmText: "确认删除", onConfirm: () => { state.inspectionItems = state.inspectionItems.filter((entry) => !state.configSelected.has(entry.id)); state.configSelected.clear(); syncWorkCounts(work.id); render(); openWorkConfig(work, button.dataset.projectId); showToast("已删除选中作业条目"); } }); }
    const workAction = event.target.closest("[data-inspection-work-action]");
    if (workAction) { const item = byId(state.standardWorks, workAction.dataset.id); if (!item) return; if (workAction.dataset.inspectionWorkAction === "edit") openWorkDrawer("edit", item); }
    const moreAction = event.target.closest("[data-inspection-more-action]");
    if (moreAction) { const id = moreAction.dataset.id; const type = moreAction.dataset.inspectionMoreAction; hideMoreMenus(); if (type === "detail") { const item = byId(state.standardWorks, id); if (item) openWorkDetail(item); } if (type === "config") { const item = byId(state.standardWorks, id); if (item) openWorkConfig(item); } if (type === "delete") { const item = byId(state.standardWorks, id); if (item) window.openAppConfirm({ title: "删除标准作业", message: `确认删除标准作业「${item.name}」吗？`, confirmText: "确认删除", onConfirm: () => { state.standardWorks = state.standardWorks.filter((entry) => entry.id !== id); state.inspectionItems = state.inspectionItems.filter((entry) => entry.workId !== id); render(); showToast("标准作业已删除"); } }); } if (type === "toggle-plan") { const item = byId(state.plans, id); if (item) { item.status = item.status === "正常" ? "停用" : "正常"; render(); showToast(item.status === "正常" ? "巡检计划已启用" : "巡检计划已停用"); } } if (type === "generate-task") { const item = byId(state.plans, id); if (!item) return; window.openAppConfirm({ title: "提示", message: "确认立即生成巡检任务?", confirmText: "确定", okClass: "btn-primary", onConfirm: () => generateTask(item) }); } if (type === "delete-plan") { const item = byId(state.plans, id); if (!item) return; if (hasRelatedTasks(item.id)) { window.openAppConfirm({ title: "提示", message: "当前计划有关联了巡检任务，请解除关联后删除", confirmText: "知道了", okClass: "btn-primary" }); return; } window.openAppConfirm({ title: "删除巡检计划", message: `确认删除计划「${item.name}」吗？`, confirmText: "确认删除", onConfirm: () => { state.plans = state.plans.filter((entry) => entry.id !== id); render(); showToast("巡检计划已删除"); } }); } }
    const planAction = event.target.closest("[data-inspection-plan-action]"); if (planAction) { const item = byId(state.plans, planAction.dataset.id); if (item) openPlanDrawer("edit", item); }
    const itemAction = event.target.closest("[data-inspection-item-action]"); if (itemAction) { const work = byId(state.standardWorks, itemAction.dataset.workId); if (!work) return; if (itemAction.dataset.inspectionItemAction === "create") openItemDrawer(work.id, "", itemAction.dataset.projectId); if (itemAction.dataset.inspectionItemAction === "edit") openItemDrawer(work.id, itemAction.dataset.id, itemAction.dataset.projectId); if (itemAction.dataset.inspectionItemAction === "delete") { window.openAppConfirm({ title: "删除检查项", message: "确认删除当前检查项吗？", confirmText: "确认删除", onConfirm: () => { state.inspectionItems = state.inspectionItems.filter((entry) => entry.id !== itemAction.dataset.id); syncWorkCounts(work.id); render(); openWorkConfig(work, itemAction.dataset.projectId); showToast("检查项已删除"); } }); } }
    const task = event.target.closest("[data-inspection-task-detail]"); if (task) { const item = byId(state.tasks, task.dataset.inspectionTaskDetail); if (item) openTaskDetail(item); }
    const taskTab = event.target.closest("[data-task-tab]"); if (taskTab) { const item = byId(state.tasks, taskTab.dataset.id); if (item) openTaskDetail(item, taskTab.dataset.taskTab); }
    if (event.target.closest("[data-inspection-save=work]")) saveWork(event.target.closest("[data-inspection-save=work]"));
    if (event.target.closest("[data-inspection-save=project]")) saveProject(event.target.closest("[data-inspection-save=project]"));
    if (event.target.closest("[data-inspection-save=item]")) saveItem(event.target.closest("[data-inspection-save=item]"));
    if (event.target.closest("[data-inspection-save=plan]")) savePlan(event.target.closest("[data-inspection-save=plan]"));
    if (event.target.closest("[data-inspection-device-select]")) { openDevicePicker(); return; }
    const planDeviceWork = event.target.closest("[data-plan-device-work]");
    if (planDeviceWork) { openWorkViewer(planDeviceWork.dataset.planDeviceWork); return; }
    const planDeviceRemove = event.target.closest("[data-plan-device-remove]");
    if (planDeviceRemove) { const id = planDeviceRemove.dataset.planDeviceRemove; state.planDeviceIds = state.planDeviceIds.filter((entry) => entry !== id); renderPlanDeviceTable(); showToast("已移除该设备"); return; }
    const deviceDetail = event.target.closest("[data-inspection-device-detail]");
    if (deviceDetail) { const device = byId(state.devices, deviceDetail.dataset.inspectionDeviceDetail); if (device) openDeviceWorkModal("标准作业详情", device, "detail"); }
    const deviceRecord = event.target.closest("[data-inspection-device-record]");
    if (deviceRecord) { const device = byId(state.devices, deviceRecord.dataset.inspectionDeviceRecord); if (device) openDeviceWorkModal("作业记录", device, "record"); }
    if (event.target.closest("[data-works-collapse]")) { event.target.closest("[data-works-collapse]").closest(".inspection-work-card").classList.toggle("collapsed"); }
    if (event.target.closest("[data-works-close]") || event.target.classList?.contains("inspection-works-mask")) closeWorkModal();
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-person-pick]")) { state.picker.selectedId = event.target.dataset.personPick; renderPersonList(); renderPersonSelected(); return; }
    if (event.target.matches("[data-device-pick]")) { const id = event.target.dataset.devicePick; if (event.target.checked) state.devicePicker.selected.add(id); else state.devicePicker.selected.delete(id); renderDevicePicker(); return; }
    if (event.target.matches("[data-device-select-all]")) { devicePickerList().forEach((device) => { if (event.target.checked) state.devicePicker.selected.add(device.id); else state.devicePicker.selected.delete(device.id); }); renderDevicePicker(); return; }
    if (event.target.matches("[data-work-mode]")) { const work = workOfDevice(byId(state.devices, state.workViewer.deviceId)); if (work) { work.mode = event.target.value; showToast(`作业模式已更新为${work.mode}`); } return; }
    if (event.target.matches('[data-inspection-field="cycle"]')) { const cycle = event.target.value; document.querySelectorAll("[data-cycle-field]").forEach((field) => { field.style.display = field.dataset.cycleField === (cycle === "每周" ? "weekly" : cycle === "每月" ? "monthly" : "") ? "" : "none"; }); }
    if (event.target.matches('input[name="inspection-item-input-type"]')) { const box = document.getElementById("inspectionOptionsField"); if (box) box.style.display = ["单选", "多选"].includes(event.target.value) ? "" : "none"; }
    if (event.target.matches("[data-config-select]")) { if (event.target.checked) state.configSelected.add(event.target.dataset.configSelect); else state.configSelected.delete(event.target.dataset.configSelect); const batchButton = document.querySelector('[data-inspection-action="config-batch-delete"]'); if (batchButton) batchButton.disabled = !state.configSelected.size; }
    if (event.target.matches("[data-config-select-all]")) { document.querySelectorAll("[data-config-select]").forEach((box) => { box.checked = event.target.checked; if (event.target.checked) state.configSelected.add(box.dataset.configSelect); else state.configSelected.delete(box.dataset.configSelect); }); const batchButton = document.querySelector('[data-inspection-action="config-batch-delete"]'); if (batchButton) batchButton.disabled = !state.configSelected.size; }
    if (event.target.matches('[data-inspection-field="system"]')) { const categorySelect = document.querySelector('[data-inspection-field="category"]'); if (categorySelect) { const options = categoriesForSystem(event.target.value); const placeholder = !event.target.value ? "请先选择所属系统" : options.length ? "请选择" : "当前系统暂无设备分类"; categorySelect.innerHTML = `<option value="">${placeholder}</option>${options.map((entry) => `<option value="${esc(entry)}">${esc(entry)}</option>`).join("")}`; categorySelect.disabled = !event.target.value || !options.length; } }
    if (event.target.matches("[data-inspection-select]")) { if (event.target.checked) state.selected.add(event.target.dataset.inspectionSelect); else state.selected.delete(event.target.dataset.inspectionSelect); render(); }
    if (event.target.matches("[data-inspection-select-all]")) { const list = pageKey === "inspection.plans" ? state.plans : state.tasks; list.forEach((item) => event.target.checked ? state.selected.add(item.id) : state.selected.delete(item.id)); render(); }
  });
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-person-dept-keyword]")) { state.picker.deptKeyword = event.target.value; renderPersonDeptTree(); return; }
    if (event.target.matches("[data-config-project-search]")) { const keyword = event.target.value.trim().toLowerCase(); document.querySelectorAll("[data-config-project]").forEach((card) => { card.style.display = card.querySelector(".project-name").textContent.toLowerCase().includes(keyword) ? "" : "none"; }); return; }
    const formField = event.target.closest(".form-field");
    if (formField && event.target.matches("[data-inspection-field]") && event.target.maxLength > 0) { const count = formField.querySelector(".field-count"); if (count) count.textContent = `${event.target.value.length} / ${event.target.maxLength}`; }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.querySelector(".inspection-works-mask")) { closeWorkModal(); event.stopPropagation(); return; }
    if (document.querySelector(".inspection-mini-mask")) { closeMiniModal(); event.stopPropagation(); return; }
    if (document.querySelector(".inspection-work-mask")) { closeWorkViewer(); event.stopPropagation(); return; }
    if (document.querySelector(".inspection-device-mask")) { closeDevicePicker(); event.stopPropagation(); return; }
    if (document.querySelector(".inspection-person-mask")) { closePersonPicker(); event.stopPropagation(); }
  }, true);
  document.addEventListener("click", (event) => { if (!event.target.closest(".inspection-more")) hideMoreMenus(); });
  render();
})();
