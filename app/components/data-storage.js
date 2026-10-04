(function () {
  const store = window.DATA_STORAGE_STORE || { systems: [], devices: [], historyReadings: [], archiveConfig: {}, archiveTasks: [] };
  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const attr = (value) => esc(value);
  const systemName = (systemId) => store.systems.find((item) => item.id === systemId)?.name || "未分配系统";
  const deviceById = (id) => store.devices.find((item) => item.id === id);

  function statusClass(status) {
    if (status === "在线" || status === "有效" || status === "成功") return "status-success";
    if (status === "告警" || status === "超限") return "status-warning";
    if (status === "离线" || status === "中断") return "status-danger";
    return "status-default";
  }

  function statusTag(status) {
    return `<span class="data-storage-status ${statusClass(status)}"><i></i>${esc(status || "-")}</span>`;
  }

  function renderDeviceRows(devices, mode) {
    const body = document.getElementById("deviceTable");
    if (!body) return;
    if (!devices.length) {
      body.innerHTML = `<tr><td colspan="9"><div class="data-storage-empty"><i class="fa-regular fa-folder-open"></i><strong>暂无匹配设备</strong><span>请调整系统或设备筛选条件后重试</span></div></td></tr>`;
      return;
    }
    body.innerHTML = devices.map((device) => `
      <tr data-device-row="${attr(device.id)}">
        <td><strong class="data-device-name">${esc(device.name)}</strong><small>${esc(device.code)}</small></td>
        <td>${esc(systemName(device.systemId))}</td>
        <td>${esc(device.type)}</td>
        <td>${esc(device.project)}</td>
        <td>${esc(device.location)}</td>
        <td>${statusTag(device.status)}</td>
        <td>${esc(device.latestReportedAt)}</td>
        <td><button class="table-action" type="button" data-open-device="${attr(device.id)}" data-detail-mode="${attr(mode)}">详情</button></td>
      </tr>`).join("");
  }

  function detailInfo(device) {
    const values = [
      ["所属系统", systemName(device.systemId)], ["设备分类", device.type], ["项目", device.project], ["安装位置", device.location],
      ["设备名称", device.name], ["设备编码", device.code], ["品牌型号", `${device.info.brand} / ${device.info.model}`], ["供应商", device.info.vendor],
      ["安装日期", device.info.installDate], ["服务范围", device.info.service], ["最新上报", device.latestReportedAt], ["运行状态", device.status],
    ];
    return `<section class="data-storage-detail-section"><h3 class="detail-title">设备基本信息</h3><div class="detail-grid data-storage-info-grid">${values.map(([label, value]) => `<div class="info-item"><span class="info-label">${esc(label)}</span><span class="info-value">${esc(value)}</span></div>`).join("")}</div></section>`;
  }

  function filesBody(device) {
    return `<section class="data-storage-detail-section"><h3 class="detail-title">文件资料</h3><div class="table-wrap"><table class="table data-storage-files"><thead><tr><th>文件类型</th><th>文件名</th><th>操作</th></tr></thead><tbody>${(device.files || []).map((file, index) => `<tr><td>${esc(file.type)}</td><td>${esc(file.name)}</td><td><button class="table-action" type="button" data-file-action="preview" data-file-name="${attr(file.name)}">预览</button><button class="table-action" type="button" data-file-action="download" data-file-name="${attr(file.name)}">下载</button></td></tr>`).join("")}</tbody></table></div></section>`;
  }

  function renderRealtimeMetrics(device) {
    return `<section class="data-storage-detail-section"><div class="data-storage-section-head"><h3 class="detail-title">实时监测数据</h3><span class="panel-helper">共 ${device.metrics.length} 项指标 · ${esc(device.latestReportedAt)} 更新</span></div><div class="data-metric-grid">${device.metrics.map((metric) => `<article class="data-metric-card"><div class="data-metric-head"><span>${esc(metric.name)}</span>${statusTag(metric.quality)}</div><strong>${esc(metric.value)}<small>${esc(metric.unit)}</small></strong><div class="data-metric-foot"><span>${esc(metric.reportedAt)}</span><button class="table-action" type="button" data-metric-detail="${attr(device.id)}|${attr(metric.key)}">详情</button></div></article>`).join("")}</div></section>`;
  }

  function filterReadings(deviceId, range = {}) {
    return store.historyReadings.filter((reading) => {
      if (reading.deviceId !== deviceId) return false;
      const time = reading.reportedAt.replace(" ", "T");
      return (!range.start || time >= range.start) && (!range.end || time <= range.end);
    });
  }

  function renderHistoryRows(deviceId, range = {}) {
    const readings = filterReadings(deviceId, range);
    if (!readings.length) return `<div class="data-storage-empty data-storage-empty-inline"><i class="fa-regular fa-clock"></i><strong>暂无历史记录</strong><span>请调整时间范围后重试</span></div>`;
    return `<section class="data-storage-detail-section"><div class="data-storage-section-head"><h3 class="detail-title">历史监测数据</h3><span class="panel-helper">共 ${readings.length} 条记录</span></div><div class="table-wrap"><table class="table data-storage-history-table"><thead><tr><th>监测指标</th><th>数据</th><th>上报时间</th><th>质量状态</th><th>操作</th></tr></thead><tbody>${readings.map((reading) => `<tr><td>${esc(reading.metric)}</td><td><strong>${esc(reading.value)}</strong> ${esc(reading.unit)}</td><td>${esc(reading.reportedAt)}</td><td>${statusTag(reading.quality)}</td><td><button class="table-action" type="button" data-reading-detail="${attr(reading.id)}">详情</button></td></tr>`).join("")}</tbody></table></div></section>`;
  }

  function detailTabs(device, mode) {
    const dataPanel = mode === "history" ? renderHistoryRows(device.id) : renderRealtimeMetrics(device);
    return `<div class="data-storage-detail"><div class="tabs data-storage-tabs" role="tablist"><button class="tab active" type="button" data-detail-tab="info">基本信息</button><button class="tab" type="button" data-detail-tab="data">${mode === "history" ? "历史数据" : "实时数据"}</button><button class="tab" type="button" data-detail-tab="files">文件资料</button></div><div data-detail-panel="info">${detailInfo(device)}</div><div class="hidden" data-detail-panel="data">${dataPanel}</div><div class="hidden" data-detail-panel="files">${filesBody(device)}</div></div>`;
  }

  function openRecordDrawer(title, body) {
    const existing = document.querySelector(".data-storage-record-mask");
    existing?.remove();
    const mask = document.createElement("div");
    mask.className = "data-storage-record-mask";
    mask.innerHTML = `<aside class="data-storage-record-drawer" role="dialog" aria-modal="true"><header><h2>${esc(title)}</h2><button type="button" data-record-close aria-label="关闭">×</button></header><main>${body}</main><footer><button class="btn btn-secondary" type="button" data-record-close>关闭</button></footer></aside>`;
    document.body.append(mask);
    const close = () => mask.remove();
    mask.addEventListener("click", (event) => { if (event.target === mask || event.target.closest("[data-record-close]")) close(); });
  }

  function openMetricDetail(deviceId, metricKey) {
    const device = deviceById(deviceId);
    const metric = device?.metrics.find((item) => item.key === metricKey);
    if (!device || !metric) return;
    openRecordDrawer(`${metric.name} · 上报详情`, `<div class="detail-grid data-storage-info-grid"><div class="info-item"><span class="info-label">设备</span><span class="info-value">${esc(device.name)}</span></div><div class="info-item"><span class="info-label">当前数据</span><span class="info-value">${esc(metric.value)} ${esc(metric.unit)}</span></div><div class="info-item"><span class="info-label">上报时间</span><span class="info-value">${esc(metric.reportedAt)}</span></div><div class="info-item"><span class="info-label">质量状态</span><span class="info-value">${statusTag(metric.quality)}</span></div><div class="info-item"><span class="info-label">数据来源</span><span class="info-value">${esc(metric.source)}</span></div></div><section class="data-storage-payload"><h3>原始报文摘要</h3><pre>${esc(metric.rawPayload)}</pre></section>`);
  }

  function openReadingDetail(readingId) {
    const reading = store.historyReadings.find((item) => item.id === readingId);
    if (!reading) return;
    const device = deviceById(reading.deviceId);
    openRecordDrawer(`${reading.metric} · 历史记录`, `<div class="detail-grid data-storage-info-grid"><div class="info-item"><span class="info-label">设备</span><span class="info-value">${esc(device?.name || "-")}</span></div><div class="info-item"><span class="info-label">监测指标</span><span class="info-value">${esc(reading.metric)}</span></div><div class="info-item"><span class="info-label">数据</span><span class="info-value">${esc(reading.value)} ${esc(reading.unit)}</span></div><div class="info-item"><span class="info-label">上报时间</span><span class="info-value">${esc(reading.reportedAt)}</span></div><div class="info-item"><span class="info-label">质量状态</span><span class="info-value">${statusTag(reading.quality)}</span></div><div class="info-item"><span class="info-label">数据来源</span><span class="info-value">${esc(reading.source)}</span></div></div><section class="data-storage-payload"><h3>原始报文摘要</h3><pre>${esc(reading.rawPayload)}</pre></section>`);
  }

  function openDeviceDetail(deviceId, mode) {
    const device = deviceById(deviceId);
    if (!device || !window.openAppDrawer) return;
    window.openAppDrawer({
      title: `${device.name} · ${mode === "history" ? "历史数据" : "实时数据"}`,
      subtitle: `${systemName(device.systemId)} · ${device.code}`,
      body: detailTabs(device, mode),
      footer: '<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>',
    });
    bindDetailEvents(device, mode);
  }

  function bindDetailEvents(device, mode) {
    document.querySelectorAll("[data-detail-tab]").forEach((tab) => tab.addEventListener("click", () => {
      const key = tab.dataset.detailTab;
      document.querySelectorAll("[data-detail-tab]").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll("[data-detail-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.detailPanel !== key));
      if (key === "data" && mode === "history") document.querySelector('[data-detail-panel="data"]').innerHTML = renderHistoryRows(device.id, currentHistoryRange());
    }));
    document.querySelectorAll("[data-metric-detail]").forEach((button) => button.addEventListener("click", () => { const [id, key] = button.dataset.metricDetail.split("|"); openMetricDetail(id, key); }));
    document.querySelectorAll("[data-reading-detail]").forEach((button) => button.addEventListener("click", () => openReadingDetail(button.dataset.readingDetail)));
    document.querySelectorAll("[data-file-action]").forEach((button) => button.addEventListener("click", () => { if (window.showAppToast) window.showAppToast(`${button.dataset.fileAction === "preview" ? "已打开预览" : "已开始下载"}：${button.dataset.fileName}`); else window.openAppConfirm?.({ title: "提示", message: `${button.dataset.fileAction === "preview" ? "已打开预览" : "已开始下载"}：${button.dataset.fileName}`, confirmText: "知道了" }); }));
  }

  function currentHistoryRange() {
    return { start: document.querySelector("[data-history-start]")?.value || "", end: document.querySelector("[data-history-end]")?.value || "" };
  }

  function validateHistoryRange(start, end) {
    return !start || !end || start <= end;
  }

  function getFilteredDevices() {
    const system = document.querySelector("[data-system-filter]")?.value || "";
    const keyword = document.querySelector("[data-device-keyword]")?.value.trim().toLowerCase() || "";
    const status = document.querySelector("[data-device-status]")?.value || "";
    return store.devices.filter((device) => (!system || device.systemId === system) && (!status || device.status === status) && (!keyword || `${device.name} ${device.code}`.toLowerCase().includes(keyword)));
  }

  function renderDeviceList(mode) { renderDeviceRows(getFilteredDevices(), mode); }

  function renderArchiveConfig() {
    const config = store.archiveConfig;
    document.querySelectorAll("[data-archive-field]").forEach((field) => {
      const key = field.dataset.archiveField;
      if (field.type === "checkbox") field.checked = Boolean(config[key]);
      else field.value = config[key] ?? "";
    });
    const body = document.getElementById("archiveTaskTable");
    if (body) body.innerHTML = store.archiveTasks.map((task) => `<tr><td>${esc(task.name)}</td><td>${esc(task.schedule)}</td><td>${esc(task.lastRunAt)}</td><td>${statusTag(task.result)}</td><td>${esc(task.nextRunAt)}</td></tr>`).join("");
    const summary = {
      enabled: config.enabled ? "已启用" : "已停用",
      retention: `${config.retentionDays} ${config.retentionUnit}`,
      schedule: `${config.schedule} ${config.executeAt}`,
    };
    Object.entries(summary).forEach(([key, value]) => { const target = document.querySelector(`[data-summary="${key}"]`); if (target) target.textContent = value; });
  }

  function readArchiveConfig() {
    const values = {};
    document.querySelectorAll("[data-archive-field]").forEach((field) => { values[field.dataset.archiveField] = field.type === "checkbox" ? field.checked : field.value.trim(); });
    values.retentionDays = Number(values.retentionDays);
    values.retryTimes = Number(values.retryTimes);
    return values;
  }

  function saveArchiveConfig(values = readArchiveConfig()) {
    if (!Number.isFinite(values.retentionDays) || values.retentionDays <= 0 || !Number.isInteger(values.retryTimes) || values.retryTimes < 0) {
      window.openAppConfirm?.({ title: "配置校验", message: "历史保留时长必须为大于 0 的整数，失败重试次数不能小于 0。", confirmText: "知道了" });
      return false;
    }
    Object.assign(store.archiveConfig, values);
    window.openAppConfirm?.({ title: "保存成功", message: "历史归档配置已更新（静态演示）。", confirmText: "知道了" });
    return true;
  }

  function mountDataStorage() {
    const mode = document.body.dataset.storageMode;
    if (!mode) return;
    document.querySelector("[data-system-filter]")?.addEventListener("change", () => renderDeviceList(mode));
    document.querySelector("[data-device-keyword]")?.addEventListener("keydown", (event) => { if (event.key === "Enter") renderDeviceList(mode); });
    document.querySelector("[data-device-status]")?.addEventListener("change", () => renderDeviceList(mode));
    document.querySelector("[data-storage-action='search']")?.addEventListener("click", () => {
      if (mode === "history" && !validateHistoryRange(...Object.values(currentHistoryRange()))) { window.openAppConfirm?.({ title: "时间范围有误", message: "采集开始时间不能晚于采集结束时间。", confirmText: "知道了" }); return; }
      renderDeviceList(mode);
    });
    document.querySelector("[data-storage-action='reset']")?.addEventListener("click", () => { document.querySelectorAll("[data-system-filter], [data-device-keyword], [data-device-status], [data-history-start], [data-history-end]").forEach((field) => { field.value = ""; }); renderDeviceList(mode); });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-device]");
      if (button) openDeviceDetail(button.dataset.openDevice, button.dataset.detailMode || mode);
      const row = event.target.closest("[data-device-row]");
      if (row && !event.target.closest("button")) openDeviceDetail(row.dataset.deviceRow, mode);
    });
    if (mode === "archive") {
      renderArchiveConfig();
      document.querySelector("[data-archive-action='save']")?.addEventListener("click", () => { if (saveArchiveConfig()) renderArchiveConfig(); });
      document.querySelector("[data-archive-action='reset']")?.addEventListener("click", () => { store.resetArchiveConfig(); renderArchiveConfig(); });
      document.querySelector("[data-archive-action='run']")?.addEventListener("click", () => { const task = store.archiveTasks[0]; task.lastRunAt = "2026-10-01 10:30:00"; task.result = "成功"; renderArchiveConfig(); window.openAppConfirm?.({ title: "任务已触发", message: "历史数据归档任务已开始执行（静态演示）。", confirmText: "知道了" }); });
    } else renderDeviceList(mode);
  }

  window.DATA_STORAGE_COMPONENT = { renderDeviceRows, openDeviceDetail, renderRealtimeMetrics, renderHistoryRows, validateHistoryRange, saveArchiveConfig };
  document.addEventListener("DOMContentLoaded", mountDataStorage);
})();
