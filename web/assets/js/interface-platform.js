(function () {
  const toast = (message) => {
    let node = document.getElementById("interfaceToast");
    if (!node) {
      node = document.createElement("div");
      node.id = "interfaceToast";
      node.style.cssText = "position:fixed;right:26px;bottom:26px;z-index:1500;padding:10px 16px;border:1px solid #d5e2f5;border-radius:5px;background:#fff;color:#27415f;box-shadow:0 8px 24px rgba(26,55,96,.14);font-size:13px;opacity:0;transform:translateY(8px);transition:.2s ease;pointer-events:none";
      document.body.append(node);
    }
    node.textContent = message;
    node.style.opacity = "1";
    node.style.transform = "translateY(0)";
    clearTimeout(window.__interfaceToastTimer);
    window.__interfaceToastTimer = setTimeout(() => { node.style.opacity = "0"; node.style.transform = "translateY(8px)"; }, 2200);
  };
  window.interfaceToast = toast;

  const forms = {
    protocol: `<label class="form-field"><span class="form-label form-required">协议类型</span><select class="form-control"><option>OPC UA</option><option>RESTful API</option><option>BACnet/IP</option><option>RS232 / RS485</option><option>Modbus/TCP</option></select></label><label class="form-field"><span class="form-label form-required">接入名称</span><input class="form-control" value="" placeholder="如：FAS 消防主机-01"></label><label class="form-field"><span class="form-label">连接地址</span><input class="form-control" placeholder="请输入 IP、端口或接口地址"></label><label class="form-field"><span class="form-label">数据标准</span><select class="form-control"><option>平台统一点位模型 v2.1</option><option>平台统一点位模型 v2.0</option></select></label>`,
    north: `<label class="form-field"><span class="form-label form-required">对接对象</span><select class="form-control"><option>区域管廊运维平台</option><option>市级城市生命线平台</option><option>电力管线单位</option><option>消防应急指挥平台</option></select></label><label class="form-field"><span class="form-label form-required">接口名称</span><input class="form-control" placeholder="如：安全事件主动上报"></label><label class="form-field"><span class="form-label">接口地址</span><input class="form-control" placeholder="https://api.example.com/v1/report"></label><label class="form-field"><span class="form-label">认证方式</span><select class="form-control"><option>OAuth 2.0 + HTTPS</option><option>AK/SK 签名</option><option>双向 TLS 证书</option></select></label>`,
    task: `<label class="form-field"><span class="form-label form-required">任务名称</span><input class="form-control" placeholder="如：每日安全事件汇总上报"></label><label class="form-field"><span class="form-label">上报对象</span><select class="form-control"><option>区域管廊运维平台</option><option>市级城市生命线平台</option><option>消防应急指挥平台</option></select></label><label class="form-field"><span class="form-label">执行周期</span><select class="form-control"><option>每 5 分钟</option><option>每 15 分钟</option><option>每小时</option><option>每日 00:00</option></select></label><label class="form-field"><span class="form-label">上报内容</span><textarea class="form-control textarea" placeholder="选择需要主动上报的数据主题"></textarea></label>`,
    security: `<label class="form-field"><span class="form-label">接口认证</span><select class="form-control"><option>必须认证，失败拒绝访问</option><option>按接口策略单独配置</option></select></label><label class="form-field"><span class="form-label">域间网关</span><select class="form-control"><option>启用双向校验与转发</option><option>仅允许单向上报</option></select></label><label class="form-field"><span class="form-label">调用日志保留</span><select class="form-control"><option>180 天</option><option>365 天</option><option>永久保留</option></select></label><label class="form-field"><span class="form-label">备注</span><textarea class="form-control textarea" placeholder="补充安全策略说明"></textarea></label>`
  };

  function openDrawer(type, title) {
    if (!window.openAppDrawer) return;
    window.openAppDrawer({ title, body: forms[type] || forms.protocol, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>取消</button><button class="btn btn-primary" type="button" data-interface-save>保存配置</button>` });
    document.querySelector("[data-interface-save]")?.addEventListener("click", () => { window.closeAppDrawer(); toast("配置已保存，等待下一个同步周期生效"); });
  }

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-interface-action]");
    if (action) {
      const type = action.dataset.interfaceAction;
      const titles = { protocol: "新增南向接入", north: "新增北向接口", task: "新建主动上报任务", security: "安全与权限策略" };
      openDrawer(type, titles[type] || "接口配置");
      return;
    }
    const detail = event.target.closest("[data-interface-detail]");
    if (detail) {
      const title = detail.dataset.interfaceDetail;
      window.openAppDrawer?.({ title, body: `<section class="detail-section"><h3 class="detail-title">连接与标准化</h3><div class="detail-grid"><div class="info-item"><span class="info-label">连接状态</span><span class="info-value"><span class="tag success">正常</span></span></div><div class="info-item"><span class="info-label">最近通信</span><span class="info-value">刚刚 · 86 ms</span></div><div class="info-item"><span class="info-label">数据标准</span><span class="info-value">统一点位模型 v2.1</span></div><div class="info-item"><span class="info-label">今日消息</span><span class="info-value">12,864 条</span></div></div></section><section class="detail-section"><h3 class="detail-title">运行说明</h3><p class="page-desc">接口数据经身份认证、字段映射和格式校验后进入平台标准数据总线，异常报文会被隔离并写入调用日志。</p></section>`, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button><button class="btn btn-primary" type="button" data-interface-action="security">查看安全策略</button>` });
      return;
    }
    const toggle = event.target.closest("[data-task-toggle]");
    if (toggle) {
      toggle.classList.toggle("on");
      toggle.setAttribute("aria-pressed", toggle.classList.contains("on"));
      toast(toggle.classList.contains("on") ? "主动上报任务已启用" : "主动上报任务已暂停");
      return;
    }
    const filter = event.target.closest("[data-log-filter]");
    if (filter) {
      document.querySelectorAll("[data-log-filter]").forEach((item) => item.classList.toggle("active", item === filter));
      const level = filter.dataset.logFilter;
      document.querySelectorAll("[data-log-row]").forEach((row) => { row.hidden = level !== "all" && row.dataset.logRow !== level; });
      return;
    }
    const toastAction = event.target.closest("[data-interface-toast]");
    if (toastAction) toast(toastAction.dataset.interfaceToast);
  });
})();
