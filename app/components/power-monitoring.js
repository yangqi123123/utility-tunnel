(function () {
  const data = window.POWER_MONITORING_DATA;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderStatus(status) {
    const tone = escapeHtml(status?.tone || "neutral");
    return `<span class="power-status power-status-${tone}"><i aria-hidden="true"></i>${escapeHtml(status?.label || "未知")}</span>`;
  }

  function renderSummary() {
    const target = document.getElementById("powerSummary");
    if (!target) return;
    target.innerHTML = (data?.summary || []).map((item) => `
      <article class="power-metric power-metric-${escapeHtml(item.tone || "neutral")}">
        <span class="power-metric-label">${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.value)}<small>${escapeHtml(item.unit)}</small></strong>
      </article>
    `).join("") || '<div class="power-empty">暂无指标数据</div>';
  }

  function renderSystemDiagram() {
    const target = document.getElementById("powerSystemDiagram");
    if (!target) return;
    const lines = data?.systemLines || [];
    target.innerHTML = lines.length ? `${lines.map((line) => `
      <div class="power-system-line" data-line-id="${escapeHtml(line.id)}">
        ${(line.nodes || []).map((node, index) => `
          <div class="power-system-node power-system-node-${escapeHtml(node.status?.tone || "neutral")}">
            <strong>${escapeHtml(node.label)}</strong><small>${escapeHtml(node.value)}</small>
          </div>${index < line.nodes.length - 1 ? '<span class="power-system-wire" aria-hidden="true"></span>' : ""}
        `).join("")}
      </div>
    `).join("")}<div class="power-legend"><span><i class="power-legend-ok"></i>正常</span><span><i class="power-legend-warn"></i>关注</span><span><i class="power-legend-alarm"></i>告警</span></div>` : '<div class="power-empty">暂无一次系统数据</div>';
  }

  function renderDevices() {
    const target = document.getElementById("powerDevices");
    if (!target) return;
    target.innerHTML = (data?.devices || []).map((device) => `
      <div class="power-device-row" data-device-id="${escapeHtml(device.id)}">
        <div class="power-device-main"><span class="power-device-icon"><i class="${escapeHtml(device.icon)}" aria-hidden="true"></i></span><div><strong>${escapeHtml(device.name)}</strong><small>${escapeHtml(device.detail)}</small></div></div>
        ${renderStatus(device.status)}
      </div>
    `).join("") || '<div class="power-empty">暂无关键设备数据</div>';
  }

  function renderEvents(targetId, rows) {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.innerHTML = (rows || []).map((item) => `
      <div class="power-event-row"><time>${escapeHtml(item.time)}</time><span>${escapeHtml(item.message)}</span>${renderStatus(item.status)}</div>
    `).join("") || '<div class="power-empty">暂无记录</div>';
  }

  function renderHead() {
    const title = document.getElementById("powerPageTitle");
    const view = document.body.dataset.powerView || "overview";
    if (title && view !== "overview") title.textContent = view === "devices" ? "关键设备监控" : "电力事件记录";
    const connection = document.getElementById("powerConnection");
    const updatedAt = document.getElementById("powerUpdatedAt");
    if (connection) connection.textContent = data?.connection?.label || "数据接入状态未知";
    if (updatedAt) updatedAt.textContent = data?.updatedAt ? `更新于 ${data.updatedAt}` : "暂无更新时间";
  }

  function openAlarmDrawer() {
    if (typeof window.openAppDrawer !== "function") return;
    const rows = (data?.alarms || []).map((item) => `<tr><td>${escapeHtml(item.time)}</td><td>${escapeHtml(item.message)}</td><td>${renderStatus(item.status)}</td></tr>`).join("");
    window.openAppDrawer({
      title: "全部实时告警",
      body: `<div class="power-drawer-table-wrap"><table class="table"><thead><tr><th>时间</th><th>事件</th><th>状态</th></tr></thead><tbody>${rows || '<tr><td colspan="3">暂无记录</td></tr>'}</tbody></table></div>`,
    });
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const drawerTrigger = event.target.closest("[data-power-drawer]");
      if (drawerTrigger?.dataset.powerDrawer === "alarms") openAlarmDrawer();
    });
  }

  function mount() {
    if (!data) return;
    renderHead();
    renderSummary();
    renderSystemDiagram();
    renderDevices();
    renderEvents("powerAlarms", data.alarms);
    renderEvents("powerEvents", data.events);
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
