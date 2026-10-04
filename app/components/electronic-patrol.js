(function () {
  const store = window.ELECTRONIC_PATROL_STORE;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  function filterRecords(records, filters = {}) {
    const date = String(filters.date || "");
    const person = String(filters.person || "").trim().toLowerCase();
    const point = String(filters.point || "").trim().toLowerCase();
    const result = String(filters.result || "");
    return records.filter((record) => {
      const matchesDate = !date || record.patrolAt.startsWith(date);
      const matchesPerson = !person || record.person.toLowerCase().includes(person);
      const matchesPoint = !point || record.point.toLowerCase().includes(point);
      const matchesResult = !result || record.result === result;
      return matchesDate && matchesPerson && matchesPoint && matchesResult;
    });
  }

  function renderRecords(list) {
    const body = document.getElementById("recordBody");
    const count = document.getElementById("recordCount");
    if (!body || !count) return;
    body.innerHTML = list.length
      ? list.map((record, index) => `
        <tr>
          <td>${index + 1}</td><td>${escapeHtml(record.person)}</td><td>${escapeHtml(record.route)}</td>
          <td>${escapeHtml(record.point)}</td><td>${escapeHtml(record.patrolAt)}</td><td>${escapeHtml(record.method)}</td>
          <td class="record-result ${record.result === "正常" ? "success" : "fail"}">${escapeHtml(record.result)}</td>
          <td class="patrol-exception">${escapeHtml(record.exception)}</td>
          <td><button class="table-action" type="button" data-view-patrol="${escapeHtml(record.id)}">查看</button></td>
        </tr>`).join("")
      : '<tr><td colspan="9" class="table-empty">暂无匹配的巡更记录</td></tr>';
    count.textContent = list.length;
  }

  function openPatrolDetail(record) {
    if (!record || typeof window.openAppDrawer !== "function") return;
    const body = `<section class="detail-section"><h3 class="detail-title">巡更记录</h3><div class="detail-grid">
      <div class="info-item"><span class="info-label">巡更人员</span><span class="info-value">${escapeHtml(record.person)}</span></div>
      <div class="info-item"><span class="info-label">巡更结果</span><span class="info-value record-result ${record.result === "正常" ? "success" : "fail"}">${escapeHtml(record.result)}</span></div>
      <div class="info-item"><span class="info-label">巡更时间</span><span class="info-value">${escapeHtml(record.patrolAt)}</span></div>
      <div class="info-item"><span class="info-label">巡更方式</span><span class="info-value">${escapeHtml(record.method)}</span></div>
      <div class="info-item"><span class="info-label">巡更路线</span><span class="info-value">${escapeHtml(record.route)}</span></div>
      <div class="info-item"><span class="info-label">巡更点位</span><span class="info-value">${escapeHtml(record.point)}</span></div>
    </div></section><section class="detail-section"><h3 class="detail-title">同步信息</h3><div class="detail-grid">
      <div class="info-item"><span class="info-label">记录编号</span><span class="info-value">${escapeHtml(record.id)}</span></div>
      <div class="info-item"><span class="info-label">数据来源</span><span class="info-value">${escapeHtml(record.source)}</span></div>
      <div class="info-item"><span class="info-label">同步时间</span><span class="info-value">${escapeHtml(record.syncedAt)}</span></div>
      <div class="info-item"><span class="info-label">异常说明</span><span class="info-value">${escapeHtml(record.exception)}</span></div>
    </div></section>`;
    window.openAppDrawer({ title: "电子巡更记录详情", body, footer: '<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>' });
  }

  function showExportFeedback() {
    if (typeof window.openAppDrawer !== "function") return;
    window.openAppDrawer({ title: "导出电子巡更记录", body: "<p>已按当前筛选条件生成电子巡更记录文件（Mock）。</p>", footer: '<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-drawer-close>确认导出</button>' });
  }

  function readFilters() {
    return {
      date: document.querySelector('[data-filter="date"]')?.value || "",
      person: document.querySelector('[data-filter="person"]')?.value || "",
      point: document.querySelector('[data-filter="point"]')?.value || "",
      result: document.querySelector('[data-filter="result"]')?.value || "",
    };
  }

  function resetFilters() {
    document.querySelectorAll("[data-filter]").forEach((field) => { field.value = ""; });
    renderRecords(store.getRecords());
  }

  function bind() {
    if (!store) return;
    const records = store.getRecords();
    renderRecords(records);
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "search") renderRecords(filterRecords(records, readFilters()));
      if (action === "reset") resetFilters();
      if (action === "export") showExportFeedback();
      const trigger = event.target.closest("[data-view-patrol]");
      if (trigger) openPatrolDetail(records.find((record) => record.id === trigger.dataset.viewPatrol));
    });
  }

  window.electronicPatrol = { filterRecords, renderRecords, openPatrolDetail, showExportFeedback };
  document.addEventListener("DOMContentLoaded", bind);
})();
