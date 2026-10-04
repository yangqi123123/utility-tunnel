(function () {
  const PROFILE_HREF = "../profile/profile.html";
  // All management pages live under web/pages/<module>; logout returns to the
  // prototype entry page so users can choose either login experience again.
  const LOGIN_HREF = "../../../index.html";

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("app-theme", nextTheme);
  }

  function applySidebar(collapsed) {
    const nextState = collapsed ? "collapsed" : "expanded";
    document.documentElement.dataset.sidebar = nextState;
    localStorage.setItem("app-sidebar-collapsed", String(collapsed));
  }

  function isSidebarCollapsed() {
    return localStorage.getItem("app-sidebar-collapsed") === "true";
  }

  function setupFilterLayouts() {
    document.querySelectorAll(".filters .filter-actions").forEach((container) => {
      if (container.dataset.filterLayoutReady === "true") return;
      const fields = [...container.children].filter((item) => item.matches(".form-field"));
      if (!fields.length) return;
      const children = [...container.children];
      const existingToggle = children.find((item) => item.matches("button.btn-ghost") && /收起|展开/.test(item.textContent));
      const fieldWrap = document.createElement("div");
      fieldWrap.className = "filter-fields";
      fields.forEach((field, index) => {
        if (index >= 4) field.classList.add("filter-field-extra");
        fieldWrap.append(field);
      });

      const controlWrap = document.createElement("div");
      controlWrap.className = "filter-controls";
      const controls = children.filter((item) => item.matches("button"));
      let toggle = fields.length > 4 ? existingToggle : null;
      if (fields.length > 4 && !toggle) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "btn btn-ghost filter-toggle";
      }
      if (toggle) {
        toggle.classList.add("filter-toggle");
        toggle.dataset.filterToggle = "true";
        toggle.innerHTML = `展开 <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>`;
        toggle.addEventListener("click", (event) => {
          event.preventDefault();
          const expanded = container.classList.toggle("is-expanded");
          toggle.innerHTML = `${expanded ? "收起" : "展开"} <i class="fa-solid ${expanded ? "fa-chevron-up" : "fa-chevron-down"}" aria-hidden="true"></i>`;
        });
      }
      if (toggle) controlWrap.append(toggle);
      controls.filter((item) => item !== existingToggle && item !== toggle).forEach((button) => controlWrap.append(button));
      container.replaceChildren(fieldWrap, controlWrap);
      container.classList.add("filter-layout");
      container.dataset.filterLayoutReady = "true";
    });
  }

  applyTheme(localStorage.getItem("app-theme") || "light");
  applySidebar(isSidebarCollapsed());

  function mountHeader() {
    const target = document.getElementById("app-header");
    if (!target) return;

    const title = document.body.dataset.pageTitle || "设备监测";
    const section = document.body.dataset.pageSection || "科学岛管廊监控中心";
    const theme = document.documentElement.dataset.theme || "light";
    const collapsed = isSidebarCollapsed();
    const isDark = theme === "dark";
    target.innerHTML = `
      <div class="header-top">
       <div class="header-left">
        <button class="sidebar-toggle" type="button" title="${collapsed ? "展开侧边栏" : "收缩侧边栏"}" aria-label="${collapsed ? "展开侧边栏" : "收缩侧边栏"}" data-sidebar-toggle>
          <i class="fa-solid ${collapsed ? "fa-menu-unfold" : "fa-menu-fold"}" aria-hidden="true"></i>
        </button>
        <div class="breadcrumb">${section} / <strong>${title}</strong></div>
       </div>
      <div class="search-wrap">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input class="search" type="search" placeholder="搜索导航菜单" aria-label="搜索导航菜单">
      </div>
       <div class="header-actions">
        <button class="header-action header-message" type="button" data-message-center aria-label="打开告警消息"><i class="fa-regular fa-bell"></i><span class="label">消息</span><span class="message-badge" data-message-badge hidden>0</span></button>
        <button class="theme-toggle" type="button" title="${isDark ? "切换浅色模式" : "切换夜间模式"}" aria-label="${isDark ? "切换浅色模式" : "切换夜间模式"}" data-theme-toggle>
          <i class="fa-regular ${isDark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>
        </button>
        <div class="user-menu">
          <button class="user-trigger" type="button" aria-expanded="false" aria-label="打开用户菜单">
            <span class="user-avatar">Li</span>
            <span class="label">疯狂的狮子Li</span>
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </button>
          <div class="user-dropdown" role="menu">
            <a class="user-dropdown-item" href="${PROFILE_HREF}" role="menuitem"><i class="fa-regular fa-user"></i>个人中心</a>
            <a class="user-dropdown-item danger" href="${LOGIN_HREF}" role="menuitem"><i class="fa-solid fa-right-from-bracket"></i>退出登录</a>
          </div>
        </div>
       </div>
      </div>
      <div class="route-tabs" data-route-tabs>
        <button class="tabs-arrow" type="button" data-tabs-prev aria-label="向左滚动标签">‹</button>
        <div class="tabs-viewport" data-tabs-viewport><div class="tabs-list" data-tabs-list></div></div>
        <button class="tabs-arrow" type="button" data-tabs-next aria-label="向右滚动标签">›</button>
      </div>
    `;

    setupFilterLayouts();

    const alarmPageHref = "../alarm-center/alarm-info.html";
    const alarmMessages = [
      { id: 1, device: "配电室网关-01", type: "设备离线", message: "设备离线持续超过 60 秒", level: "告警", time: "2026-09-07 09:42:16" },
      { id: 2, device: "冷水机组-01", type: "设备属性", message: "冷冻水供水温度高于 12℃", level: "预警", time: "2026-09-07 09:18:42" },
      { id: 3, device: "地下车库水泵-02", type: "设备属性", message: "水泵运行电流异常", level: "提醒", time: "2026-09-07 08:56:30" },
      { id: 4, device: "消防水箱液位计", type: "第三方报警信息", message: "消防水箱液位低于下限", level: "告警", time: "2026-09-06 22:11:08" },
      { id: 5, device: "楼宇自控网关-03", type: "设备离线", message: "设备通信中断，请及时检查", level: "预警", time: "2026-09-06 18:35:27" },
      { id: 6, device: "地下车库排风机-01", type: "设备属性", message: "排风机运行频率低于设定值", level: "预警", time: "2026-09-08 10:16:24" },
      { id: 7, device: "屋顶消防泵-02", type: "设备离线", message: "设备通信中断，请及时检查", level: "告警", time: "2026-09-08 09:48:11" },
      { id: 8, device: "办公区照明控制器-05", type: "第三方报警信息", message: "照明回路状态异常", level: "提醒", time: "2026-09-08 09:22:37" }
    ];
    const readKey = "alarm-info-read-state";
    function readState() { try { return JSON.parse(localStorage.getItem(readKey) || "{}"); } catch { return {}; } }
    function updateMessageBadge() { const state = readState(); const unread = alarmMessages.filter((item) => !state[item.id]).length; const badge = target.querySelector("[data-message-badge]"); if (!badge) return; badge.textContent = unread > 99 ? "99+" : unread; badge.hidden = unread === 0; }
    function openMessageCenter() { const state = readState(); const body = `<div class="message-list">${alarmMessages.map((item) => `<button class="message-item ${state[item.id] ? "is-read" : ""}" type="button" data-message-alarm="${item.id}"><span class="message-item-dot"></span><span class="message-item-content"><strong>${item.device} · ${item.type}</strong><span>${item.message}</span><small>${item.time}</small></span></button>`).join("")}</div>`; window.openAppDrawer({ title: "告警消息", subtitle: "报警中心 · 报警信息", body, footer: `<button class="btn btn-secondary" type="button" data-drawer-close>关闭</button><button class="btn btn-primary" type="button" data-message-read-all>全部已读</button>` }); }
    target.querySelector("[data-message-center]")?.addEventListener("click", openMessageCenter);
    document.addEventListener("click", (event) => { const item = event.target.closest("[data-message-alarm]"); if (item) { const state = readState(); state[item.dataset.messageAlarm] = true; localStorage.setItem(readKey, JSON.stringify(state)); updateMessageBadge(); location.href = alarmPageHref; } if (event.target.closest("[data-message-read-all]")) { const state = readState(); alarmMessages.forEach((alarm) => { state[alarm.id] = true; }); localStorage.setItem(readKey, JSON.stringify(state)); updateMessageBadge(); openMessageCenter(); } });
    window.addEventListener("storage", updateMessageBadge);
    updateMessageBadge();

    const searchWrap = target.querySelector(".search-wrap");
    const searchInput = searchWrap.querySelector(".search");
    const searchPanel = document.createElement("div");
    searchPanel.className = "nav-search-panel";
    searchPanel.innerHTML = `<div class="nav-search-title">菜单导航</div><div class="nav-search-results"></div>`;
    searchWrap.append(searchPanel);
    function flattenMenu(items) {
      return (items || [])
        .filter((item) => !item.hidden)
        .flatMap((item) => (item.children?.length ? flattenMenu(item.children) : [item]));
    }
    const menuItems = flattenMenu(window.APP_MENU || []);
    function renderMenuResults(keyword = "") {
      const results = menuItems.filter((item) => item.href && item.href !== "#" && (!keyword || item.label.includes(keyword)));
      searchPanel.querySelector(".nav-search-results").innerHTML = results.length ? results.map((item) => `<button class="nav-search-item" type="button" data-search-href="${item.href}"><span>${item.label}</span></button>`).join("") : `<div class="nav-search-empty">未找到匹配菜单</div>`;
    }
    renderMenuResults();
    searchInput.addEventListener("focus", () => { renderMenuResults(searchInput.value.trim()); searchPanel.classList.add("open"); });
    searchInput.addEventListener("input", () => { renderMenuResults(searchInput.value.trim()); searchPanel.classList.add("open"); });
    searchPanel.addEventListener("click", (event) => { const item = event.target.closest("[data-search-href]"); if (item) location.href = item.dataset.searchHref; });
    document.addEventListener("click", (event) => { if (!searchWrap.contains(event.target)) searchPanel.classList.remove("open"); });

    let activePath = location.pathname;
    const homePath = new URL("../home/home.html", location.href).pathname;
    const tabsKey = "app-route-tabs";
    const defaultTab = { path: activePath, title, closable: activePath === homePath ? false : true };
    let tabs = JSON.parse(sessionStorage.getItem(tabsKey) || "[]");
    tabs = tabs.filter((item) => item && item.path);
    const homeTab = tabs.find((item) => item.path === homePath) || { path: homePath, title: "设备监测", closable: false };
    homeTab.title = "设备监测";
    homeTab.closable = false;
    tabs = [homeTab, ...tabs.filter((item) => item.path !== homePath)];
    if (!tabs.some((item) => item.path === activePath)) tabs.push(defaultTab);
    tabs = tabs.map((item) => ({ ...item, closable: item.path === homePath ? false : true }));
    sessionStorage.setItem(tabsKey, JSON.stringify(tabs));

    const list = target.querySelector("[data-tabs-list]");
    const viewport = target.querySelector("[data-tabs-viewport]");
    function renderTabs() {
      list.innerHTML = tabs.map((item) => `
        <div class="route-tab ${item.path === activePath ? "active" : ""}" data-tab-path="${item.path}">
          <button class="route-tab-label" type="button">${item.title}</button>
          ${item.closable !== false ? `<button class="route-tab-close" type="button" aria-label="关闭${item.title}" data-tab-close="${item.path}">×</button>` : ""}
        </div>
      `).join("");
      const overflow = viewport.scrollWidth > viewport.clientWidth + 1;
      target.querySelector("[data-tabs-prev]").classList.toggle("visible", overflow);
      target.querySelector("[data-tabs-next]").classList.toggle("visible", overflow);
      const active = list.querySelector(".route-tab.active");
      active?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    function activatePath(path) {
      if (!path) return;
      if (path.startsWith("lot-host:")) {
        window.dispatchEvent(new CustomEvent("lot-host:navigate-request", {
          detail: { key: path.slice("lot-host:".length) }
        }));
        return;
      }
      location.href = path;
    }

    window.addEventListener("lot-host:navigate", (event) => {
      const detail = event.detail || {};
      if (!detail.key) return;
      activePath = `lot-host:${detail.key}`;
      const existing = tabs.find((item) => item.path === activePath);
      if (existing) existing.title = detail.title || existing.title;
      else tabs.push({ path: activePath, title: detail.title || "智能物联", closable: true });
      sessionStorage.setItem(tabsKey, JSON.stringify(tabs));
      renderTabs();
    });

    renderTabs();
    list.addEventListener("click", (event) => {
      const close = event.target.closest("[data-tab-close]");
      if (close) {
        event.stopPropagation();
        const index = tabs.findIndex((item) => item.path === close.dataset.tabClose);
        if (index < 0 || tabs[index].closable === false) return;
        const wasActive = tabs[index].path === activePath;
        tabs.splice(index, 1);
        sessionStorage.setItem(tabsKey, JSON.stringify(tabs));
        if (wasActive) activatePath(tabs[Math.max(0, index - 1)]?.path || tabs[0]?.path || location.pathname);
        else renderTabs();
        return;
      }
      const tab = event.target.closest("[data-tab-path]");
      if (tab && tab.dataset.tabPath !== activePath) activatePath(tab.dataset.tabPath);
    });
    target.querySelector("[data-tabs-prev]").addEventListener("click", () => viewport.scrollBy({ left: -180, behavior: "smooth" }));
    target.querySelector("[data-tabs-next]").addEventListener("click", () => viewport.scrollBy({ left: 180, behavior: "smooth" }));

    const themeToggle = target.querySelector("[data-theme-toggle]");
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      const nextDark = next === "dark";
      themeToggle.title = nextDark ? "切换浅色模式" : "切换夜间模式";
      themeToggle.setAttribute("aria-label", themeToggle.title);
      themeToggle.innerHTML = `<i class="fa-regular ${nextDark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
    });

    const sidebarToggle = target.querySelector("[data-sidebar-toggle]");
    sidebarToggle.addEventListener("click", () => {
      const nextCollapsed = document.documentElement.dataset.sidebar !== "collapsed";
      applySidebar(nextCollapsed);
      sidebarToggle.title = nextCollapsed ? "展开侧边栏" : "收缩侧边栏";
      sidebarToggle.setAttribute("aria-label", sidebarToggle.title);
      sidebarToggle.innerHTML = `<i class="fa-solid ${nextCollapsed ? "fa-menu-unfold" : "fa-menu-fold"}" aria-hidden="true"></i>`;
    });

    const userMenu = target.querySelector(".user-menu");
    const userTrigger = target.querySelector(".user-trigger");
    userTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = userMenu.classList.toggle("open");
      userTrigger.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", () => {
      userMenu.classList.remove("open");
      userTrigger.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("DOMContentLoaded", mountHeader);
})();

