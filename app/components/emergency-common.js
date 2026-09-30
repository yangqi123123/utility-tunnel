(function () {
  const routes = {
    dispatch: "dispatch.html",
    events: "events.html",
    plans: "plans.html",
    resources: "resources.html",
    personnel: "personnel.html",
    calls: "calls.html",
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function statusClass(status) {
    const value = String(status || "");
    if (/在线|可用|已接通|已完成|正常|已发布/.test(value)) return "success";
    if (/低库存|忙碌|已占用|处理中|执行中|待确认|维修|草稿/.test(value)) return "warning";
    if (/离线|不可|报废|失败|拒接|超时|误报|停用/.test(value)) return "danger";
    return "info";
  }

  function renderStatus(status, label) {
    const text = label || status || "未知";
    return `<span class="emergency-status ${statusClass(status)}">${escapeHtml(text)}</span>`;
  }

  function renderPagination({ total = 0, page = 1, pageSize = 10, id = "emergencyPagination" } = {}) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(Math.max(1, page), pages);
    return `<div class="emergency-pagination" id="${escapeHtml(id)}" data-page="${current}" data-pages="${pages}"><span>共 ${total} 条，每页 ${pageSize} 条</span><button type="button" data-page-prev aria-label="上一页" ${current <= 1 ? "disabled" : ""}>‹</button><strong>${current}</strong><button type="button" data-page-next aria-label="下一页" ${current >= pages ? "disabled" : ""}>›</button></div>`;
  }

  function showToast(message, type = "success") {
    document.querySelectorAll(".emergency-toast").forEach((item) => item.remove());
    const toast = document.createElement("div");
    toast.className = `emergency-toast ${escapeHtml(type)}`;
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2400);
  }

  function openEntityDrawer({ title, body, footer, onOpen } = {}) {
    if (typeof window.openAppDrawer === "function") {
      window.openAppDrawer({ title: title || "详情", body: body || "", footer: footer || `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>` });
      onOpen?.(document.getElementById("drawer"));
      return;
    }
    const mask = document.getElementById("drawerMask");
    if (mask) mask.classList.add("open");
  }

  function navigate(key, query = {}) {
    const path = routes[key] || routes.events;
    const url = new URL(path, location.href);
    Object.entries(query || {}).forEach(([name, value]) => { if (value !== undefined && value !== null && value !== "") url.searchParams.set(name, value); });
    location.href = url.href;
  }

  function nowText(date = new Date()) {
    const value = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(value.getTime())) return "-";
    const pad = (number) => String(number).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
  }

  function showApiError(error) {
    const message = error?.message || "操作失败，请稍后重试";
    showToast(message, "error");
  }

  function value(id) { return document.getElementById(id)?.value?.trim() || ""; }
  function setValue(id, value) { const input = document.getElementById(id); if (input) input.value = value ?? ""; }

  window.EMERGENCY_UI = { escapeHtml, statusClass, renderStatus, renderPagination, showToast, openEntityDrawer, navigate, nowText, showApiError, value, setValue };
})();
