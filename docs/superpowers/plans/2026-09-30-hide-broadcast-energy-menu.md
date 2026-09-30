# 隐藏广播与能源菜单入口 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 隐藏侧边栏中的广播管理和能源管理入口，同时保留两个模块的 HTML 页面和功能。

**Architecture:** 继续使用 `app/config/menu.js` 作为菜单唯一数据源，由现有 `app/components/sidebar.js` 自动渲染。只删除两个一级菜单对象，不修改页面、脚本或路由。

**Tech Stack:** 原生 JavaScript、静态 HTML、Git。

---

### Task 1: Remove hidden menu entries

**Files:**
- Modify: `app/config/menu.js`

- [ ] **Step 1: Remove the `broadcast` object and the `energy` object from `window.APP_MENU`.**

- [ ] **Step 2: Verify the menu source no longer contains either label or key, while broadcast and energy HTML files remain present.**

Run:

```powershell
rg -n -S "广播管理|能源管理|key: \"broadcast\"|key: \"energy\"" app/config/menu.js
Test-Path web/pages/broadcast/console.html
Test-Path web/pages/energy/electricity-overview.html
```

Expected: the first command produces no output; both `Test-Path` commands return `True`.

- [ ] **Step 3: Inspect the diff and ensure unrelated user changes are untouched.**

Run: `git diff -- app/config/menu.js`

Expected: only the two menu objects are removed.
