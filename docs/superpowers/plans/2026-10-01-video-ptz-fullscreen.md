# Video PTZ and Fullscreen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a compact top-area PTZ controller and per-feed fullscreen viewing to the video monitoring page.

**Architecture:** Keep the existing single-page rendering model. Add a replaceable stats/PTZ region, capability-aware feed actions, and browser Fullscreen API with a CSS fallback state.

**Tech Stack:** Existing HTML, CSS, vanilla JavaScript, Font Awesome.

---

### Task 1: Add PTZ and fullscreen UI

**Files:**
- Modify: `web/pages/monitoring/video-monitor.html`
- Modify: `web/assets/css/monitoring.css`

- [ ] Add a top stats region with a PTZ panel template and close control.
- [ ] Mark dome cameras as PTZ-capable in camera data.
- [ ] Add per-feed PTZ and fullscreen buttons with accessible labels.
- [ ] Implement direction press/release, stop, panel switching, and fullscreen behavior.
- [ ] Add responsive styles for the top panel, feed action buttons, and fullscreen state.

### Task 2: Verify behavior

**Files:**
- Test: `tests/video-monitor-browser.mjs` (if browser harness is available)

- [ ] Run existing test suite.
- [ ] Open the page in a browser and verify PTZ panel switching, stop behavior, unsupported camera handling, and fullscreen entry/exit.
