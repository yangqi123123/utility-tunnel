(function () {
  const menu = window.APP_MENU || [];

  const navIcons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"></path><path d="M9 21v-6h6v6"></path>',
    project: '<path d="M3 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path><path d="M17 8h2a2 2 0 0 1 2 2v11H3"></path><path d="M7 7h4M7 11h4M7 15h4"></path>',
    device: '<path d="m12 3 8 4-8 4-8-4 8-4Z"></path><path d="m4 12 8 4 8-4"></path><path d="m4 16 8 4 8-4"></path>',
    system: '<path d="M12.22 2h-.44a2 2 0 0 0-1.99 1.82l-.18 1.37a7 7 0 0 0-1.24.72l-1.31-.5a2 2 0 0 0-2.5 1.16l-.16.4a2 2 0 0 0 .78 2.65l1.13.71a7 7 0 0 0 0 1.43l-1.13.71a2 2 0 0 0-.78 2.65l.16.4a2 2 0 0 0 2.5 1.16l1.31-.5c.39.28.8.52 1.24.72l.18 1.37A2 2 0 0 0 11.78 22h.44a2 2 0 0 0 1.99-1.82l.18-1.37a7 7 0 0 0 1.24-.72l1.31.5a2 2 0 0 0 2.5-1.16l.16-.4a2 2 0 0 0-.78-2.65l-1.13-.71a7 7 0 0 0 0-1.43l1.13-.71a2 2 0 0 0 .78-2.65l-.16-.4a2 2 0 0 0-2.5-1.16l-1.31.5a7 7 0 0 0-1.24-.72l-.18-1.37A2 2 0 0 0 12.22 2Z"></path><circle cx="12" cy="12" r="3"></circle>',
    lot: '<path d="M4 7h16M4 17h16M7 4v16M17 4v16"></path><circle cx="7" cy="7" r="2"></circle><circle cx="17" cy="17" r="2"></circle>',
    energy: '<path d="m13 2-9 12h6l-1 8 9-12h-6l1-8Z"></path>',
    "alarm-center": '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path>',
    emergency: '<path d="M3 21h18"></path><path d="M5 21v-7l7-4 7 4v7"></path><path d="M12 4v6"></path><path d="M9 7h6"></path><path d="M9 17h6"></path>',
    "service-center": '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 9h4M7 13h7M15 9h2"></path>',
  };

  function renderNavIcon(item) {
    const paths = navIcons[item.key] || '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 9h8M8 13h8M8 17h5"></path>';
    return `<span class="nav-icon nav-icon-${item.key}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${paths}</svg></span>`;
  }

  function isActive(item, currentKey) {
    if (item.key === currentKey) return true;
    return Array.isArray(item.children) && item.children.some((child) => isActive(child, currentKey));
  }

  function firstHref(item) {
    if (item.href) return item.href;
    const child = Array.isArray(item.children) ? item.children.find((entry) => firstHref(entry)) : null;
    return child ? firstHref(child) : "#";
  }

  function renderChildren(children, currentKey, depth = 1) {
    if (!children || !children.length) return "";
    return `
      <div class="submenu submenu-depth-${depth}">
        ${children.map((child) => {
          const active = isActive(child, currentKey);
          const href = firstHref(child);
          const lotRoute = child.key?.startsWith("lot.") ? ` data-lot-route="${child.key}"` : "";
          return child.children?.length
            ? `<div class="submenu-group ${active ? "open" : ""}">
                <a class="submenu-group-label ${active ? "active" : ""}" href="#" data-nav-subtoggle="${child.key}"><span>${child.label}</span><i class="fa-solid ${active ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i></a>
                ${renderChildren(child.children, currentKey, depth + 1)}
              </div>`
            : `<a class="submenu-item ${child.key === currentKey ? "active" : ""}" href="${href}"${lotRoute}><span>${child.label}</span></a>`;
        }).join("")}
      </div>
    `;
  }

  const LOT_TITLES = {
    "lot.overview": "IoT 总览",
    "lot.integration": "接入管理",
    "lot.devices": "设备管理",
    "lot.models": "物模型",
    "lot.mapping": "点位映射",
    "lot.tasks": "采集任务",
    "lot.monitor": "运行监控",
    "lot.commands": "指令中心",
    "lot.alarms": "告警事件",
  };

  function showLotInCurrentFrame(link, target) {
    const routeKey = link.dataset.lotRoute;
    const href = link.getAttribute("href");
    if (!routeKey || !href) return;

    const main = document.querySelector(".app-shell > .main");
    if (!main) return;

    target.querySelectorAll(".submenu-item.active, .nav-item.active, .submenu-group-label.active").forEach((item) => item.classList.remove("active"));
    target.querySelectorAll(".nav > .nav-block").forEach((block) => block.classList.remove("open"));
    link.classList.add("active");
    const block = link.closest(".nav-block");
    block?.classList.add("open");
    block?.querySelector(":scope > .nav-item")?.classList.add("active");

    let frame = main.querySelector(".lot-host-frame");
    if (!frame) {
      main.replaceChildren();
      frame = document.createElement("iframe");
      frame.className = "lot-host-frame";
      frame.title = "智能物联内容";
      frame.setAttribute("aria-label", "智能物联内容");
      frame.style.cssText = "display:block;width:100%;height:100%;min-height:640px;border:0;background:#f5f7fc;";
      main.appendChild(frame);
    }

    const title = LOT_TITLES[routeKey] || link.textContent.trim();
    document.body.dataset.menuKey = routeKey;
    document.body.dataset.pageSection = "智能物联";
    document.body.dataset.pageTitle = title;
    const breadcrumb = document.querySelector("#app-header .breadcrumb");
    if (breadcrumb) breadcrumb.innerHTML = `智能物联 / <strong>${title}</strong>`;

    frame.onload = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      doc.querySelector(".sidebar")?.remove();
      doc.querySelector(".topbar")?.remove();
      doc.getElementById("lot-host-style")?.remove();
      const style = doc.createElement("style");
      style.id = "lot-host-style";
      style.textContent = `
        html, body { min-height:100%; overflow:auto !important; background:#f5f7fc !important; }
        .app { display:block !important; min-height:100% !important; background:#f5f7fc !important; }
        .sidebar, .topbar { display:none !important; }
        .main { width:100% !important; min-height:100% !important; height:auto !important; overflow:visible !important; padding:0 !important; }
        .content { width:100% !important; max-width:none !important; margin:0 !important; padding:0 !important; }
        .page-head { justify-content:flex-end !important; min-height:0 !important; margin:0 0 16px !important; }
        .page-head > div:first-child { display:none !important; }
        .head-actions { margin-left:auto !important; }
        .stat-grid { gap:16px !important; margin-bottom:16px !important; }
        .stat, .panel { background:#fff !important; border:1px solid var(--line) !important; border-radius:4px !important; box-shadow:0 8px 24px rgba(19,90,250,.04) !important; }
        .stat { position:relative !important; min-height:142px !important; padding:20px !important; overflow:hidden !important; }
        .stat::after { content:""; position:absolute; right:-24px; top:-28px; width:120px; height:120px; background:linear-gradient(135deg,rgba(19,90,250,.12),rgba(20,201,186,.05)); transform:rotate(24deg); pointer-events:none; }
        .stat-top, .stat-value, .stat-note { position:relative; z-index:1; }
        .panel { margin-bottom:16px !important; }
        .panel-head { min-height:56px !important; padding:0 24px !important; }
        .table th { background:#f3f6ff !important; }
        .drawer-backdrop { z-index:1200 !important; background:rgba(26,28,31,.45) !important; }
        .drawer { width:min(560px,90vw) !important; border-left:1px solid var(--line) !important; border-radius:0 !important; box-shadow:-8px 0 24px rgba(26,28,31,.12) !important; transform:none !important; }
        .drawer-head { min-height:56px !important; padding:16px 24px !important; align-items:flex-start !important; }
        .drawer-head h2 { font-size:16px !important; font-weight:600 !important; }
        .drawer-body { padding:24px !important; overflow-y:auto !important; }
        .drawer-foot { min-height:56px !important; padding:12px 24px !important; border-top:1px solid var(--line) !important; background:#fff !important; }
      `;
      doc.head.appendChild(style);
      doc.documentElement.scrollTop = 0;
      doc.body.scrollTop = 0;
    };

    const embeddedUrl = new URL(href, location.href);
    embeddedUrl.searchParams.set("embedded", "1");
    const absoluteHref = embeddedUrl.href;
    if (frame.src !== absoluteHref) frame.src = absoluteHref;
    window.dispatchEvent(new CustomEvent("lot-host:navigate", {
      detail: { key: routeKey, title, href, frame }
    }));
  }

  function navigateLotRoute(routeKey) {
    const link = document.querySelector(`[data-lot-route="${routeKey}"]`);
    const target = document.getElementById("app-sidebar");
    if (link && target) showLotInCurrentFrame(link, target);
  }

  window.addEventListener("lot-host:navigate-request", (event) => {
    const routeKey = event.detail?.key;
    if (routeKey) navigateLotRoute(routeKey);
  });

  function renderItem(item, currentKey) {
    const active = isActive(item, currentKey);
    const href = firstHref(item);
    return `
      <div class="nav-block ${active ? "open" : ""}">
        <a class="nav-item ${active ? "active" : ""}" href="${item.children ? "#" : href}" ${item.children ? `data-nav-toggle="${item.key}"` : ""}>
          ${renderNavIcon(item)}
          <span class="nav-text">${item.label}</span>
          ${item.children ? `<i class="nav-arrow fa-solid ${active ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i>` : '<i class="nav-arrow fa-solid fa-chevron-right" aria-hidden="true"></i>'}
        </a>
        ${renderChildren(item.children, currentKey)}
      </div>
    `;
  }

  function mountSidebar() {
    const target = document.getElementById("app-sidebar");
    if (!target) return;

    const currentKey = document.body.dataset.menuKey || "home";
    target.innerHTML = `
      <div class="brand">
        <a class="brand-link" href="../home/home.html" aria-label="返回工作台">
          <img class="brand-logo" src="../../assets/images/cscec-logo.png" alt="中建四局">
          <span class="brand-name">智能运营管理系统</span>
        </a>
      </div>
      <nav class="nav" aria-label="主导航">
        ${menu.map((item) => renderItem(item, currentKey)).join("")}
      </nav>
    `;
    target.querySelectorAll("[data-nav-toggle]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const block = link.closest(".nav-block");
        const shouldOpen = !block.classList.contains("open");
        target.querySelectorAll(".nav > .nav-block.open").forEach((item) => item.classList.remove("open"));
        target.querySelectorAll(".nav > .nav-block [data-nav-toggle] .nav-arrow").forEach((arrow) => { arrow.classList.remove("fa-chevron-up"); arrow.classList.add("fa-chevron-down"); });
        target.querySelectorAll(".submenu-group.open").forEach((item) => item.classList.remove("open"));
        target.querySelectorAll(".submenu-group-label i").forEach((arrow) => { arrow.classList.remove("fa-chevron-up"); arrow.classList.add("fa-chevron-down"); });
        if (shouldOpen) {
          block.classList.add("open");
          link.querySelector(".nav-arrow")?.classList.remove("fa-chevron-down");
          link.querySelector(".nav-arrow")?.classList.add("fa-chevron-up");
        }
      });
    });
    target.querySelectorAll("[data-nav-subtoggle]").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const group = link.closest(".submenu-group");
        const shouldOpen = !group.classList.contains("open");
        group.parentElement.querySelectorAll(":scope > .submenu-group.open").forEach((item) => item.classList.remove("open"));
        group.parentElement.querySelectorAll(":scope > .submenu-group .submenu-group-label i").forEach((arrow) => { arrow.classList.remove("fa-chevron-up"); arrow.classList.add("fa-chevron-down"); });
        if (shouldOpen) {
          group.classList.add("open");
          const arrow = link.querySelector("i");
          arrow?.classList.remove("fa-chevron-down");
          arrow?.classList.add("fa-chevron-up");
        }
      });
    });
    target.querySelectorAll("a[href]:not([data-nav-toggle]):not([data-nav-subtoggle])").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.dataset.lotRoute) {
          event.preventDefault();
          showLotInCurrentFrame(link, target);
          return;
        }
        const href = new URL(link.getAttribute("href"), location.href).pathname;
        const title = link.querySelector("span")?.textContent?.trim() || document.body.dataset.pageTitle || "页面";
        const key = "app-route-tabs";
        const tabs = JSON.parse(sessionStorage.getItem(key) || "[]");
        const existing = tabs.find((item) => item.path === href);
        if (existing) existing.title = title;
        else tabs.push({ path: href, title, closable: href !== location.pathname });
        sessionStorage.setItem(key, JSON.stringify(tabs));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", mountSidebar);
})();
