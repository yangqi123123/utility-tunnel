(function () {
  function ensureDrawer() {
    let mask = document.getElementById("drawerMask");
    let drawer = document.getElementById("drawer");
    if (mask && drawer) return { mask, drawer };

    mask = document.createElement("div");
    mask.className = "drawer-mask";
    mask.id = "drawerMask";
    drawer = document.createElement("aside");
    drawer.className = "drawer";
    drawer.id = "drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.innerHTML = `
      <header class="drawer-header">
        <div>
          <h2 id="drawerTitle" class="drawer-title">详情</h2>
        </div>
        <button class="drawer-close" type="button" aria-label="关闭">×</button>
      </header>
      <main class="drawer-body" id="drawerBody"></main>
      <footer class="drawer-footer" id="drawerFooter"></footer>
    `;
    document.body.append(mask, drawer);
    mask.addEventListener("click", window.closeAppDrawer);
    drawer.querySelector(".drawer-close").addEventListener("click", window.closeAppDrawer);
    return { mask, drawer };
  }

  window.openAppDrawer = function ({ title, body, footer }) {
    const { mask, drawer } = ensureDrawer();
    drawer.querySelector("#drawerTitle").textContent = title || "详情";
    drawer.querySelector("#drawerBody").innerHTML = body || "";
    drawer.querySelector("#drawerFooter").innerHTML = footer || `
      <button class="btn btn-secondary" type="button" data-drawer-close>关闭</button>
    `;
    drawer.querySelectorAll("[data-drawer-close]").forEach((item) => {
      item.addEventListener("click", window.closeAppDrawer);
    });
    mask.classList.add("open");
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  window.closeAppDrawer = function () {
    const mask = document.getElementById("drawerMask");
    const drawer = document.getElementById("drawer");
    if (!mask || !drawer) return;
    mask.classList.remove("open");
    drawer.classList.remove("open");
    document.body.style.overflow = "";
  };

  window.openAppConfirm = function ({ title = "提示", message = "确认执行此操作吗？", confirmText = "确定", okClass = "btn-danger-outline", inputPlaceholder = "", onConfirm }) {
    document.querySelectorAll(".app-confirm-mask").forEach((item) => item.remove());
    const mask = document.createElement("div");
    mask.className = "app-confirm-mask";
    mask.innerHTML = `<div class="app-confirm-dialog" role="dialog" aria-modal="true"><div class="app-confirm-head"><i class="fa-solid fa-circle-exclamation"></i><strong>${title}</strong><button type="button" data-confirm-close aria-label="关闭">×</button></div><p>${message}</p>${inputPlaceholder ? `<textarea class="form-control textarea" data-confirm-input maxlength="500" placeholder="${inputPlaceholder}"></textarea>` : ""}<div class="app-confirm-actions"><button class="btn btn-secondary" data-confirm-close>取消</button><button class="btn ${okClass}" data-confirm-ok>${confirmText}</button></div></div>`;
    document.body.append(mask);
    const close = () => mask.remove();
    mask.querySelectorAll("[data-confirm-close]").forEach((button) => button.addEventListener("click", close));
    mask.querySelector("[data-confirm-ok]").addEventListener("click", () => { onConfirm?.(mask.querySelector("[data-confirm-input]")?.value?.trim() || ""); close(); });
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") window.closeAppDrawer();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".main table.table").forEach((table) => {
      if (table.querySelector("th:last-child")?.textContent.trim() === "操作") {
        table.classList.add("table-actions-sticky");
      }
    });
  });
})();
