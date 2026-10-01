# 录像回放 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在智能监测下增加可检索、可多画面回放并支持取证下载反馈的录像回放页面。

**Architecture:** 复用现有 sidebar/header/drawer 与 monitoring.css，在菜单配置中新增入口，创建独立 `video-replay.html` 承载 Mock 录像数据、时间轴和播放状态；新增 `video-replay-*` 样式避免影响现有视频监控页。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Font Awesome、现有后台 UI 组件。

---

### Task 1: 注册菜单入口

**Files:** `app/config/menu.js`

- [ ] 在 `smart-monitoring.children` 中紧接视频监控之后加入 `smart-monitoring.video-replay`，链接 `../monitoring/video-replay.html`。
- [ ] 保留现有停车记录、人行通行记录隐藏状态和其他菜单顺序。

### Task 2: 创建录像回放页面

**Files:** `web/pages/monitoring/video-replay.html`

- [ ] 复用现有页面头部脚本和 `monitoring-page` body 元数据。
- [ ] 构建楼层/摄像机筛选、日期时间检索、同步/异步模式、宫格切换、视频画面、回放工具栏、分段时间轴和关键片段下载入口。
- [ ] 使用内联 Mock 数据渲染画面与时间轴；实现检索、宫格分页、同步/异步切换、时间指针定位、播放/暂停、前后跳转、倍速切换、片段切换和抽屉反馈。

### Task 3: 增加回放视觉样式

**Files:** `web/assets/css/monitoring.css`

- [ ] 添加 `video-replay-*` 布局、时间轴、录像分段、工具栏和状态样式。
- [ ] 补充 1100px、900px、640px 下的响应式规则，确保页面不产生水平溢出。

### Task 4: 浏览器验证

**Files:** 无

- [ ] 启动本地静态服务器并打开 `video-replay.html`。
- [ ] 验证菜单入口、筛选检索、宫格切换、同步/异步、时间轴点击、倍速和下载抽屉反馈。
- [ ] 运行现有测试命令，确认没有破坏既有页面。
