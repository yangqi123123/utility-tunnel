# Alarm Emergency Event Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the alarm information page's work-order flow into a consistent emergency-event creation flow.

**Architecture:** Keep the existing single-page prototype structure and update its inline rendering, drawer form, validation, and persistence logic. Reuse `window.EMERGENCY_STORE.saveEvent` so converted alarms appear in the existing emergency event module.

**Tech Stack:** HTML, CSS classes from the existing admin prototype, vanilla JavaScript, browser localStorage-backed emergency store.

---

### Task 1: Update visible labels and entry points

**Files:**
- Modify: `web/pages/alarm-center/alarm-info.html`

- [ ] **Step 1: Change table and action labels**

Change the table column from `工单编号` to `事件编号`, and change both the row and batch `转工单` labels to `转应急事件`.

- [ ] **Step 2: Remove duplicate conversion actions**

Remove the old `data-alarm-action="emergency"` row button and its direct click handler. Keep `data-alarm-action="transfer"` as the only row conversion entry.

- [ ] **Step 3: Remove the detail conversion button**

Make the alarm detail drawer footer always render only the close button and remove the unused `data-detail-transfer` handler.

- [ ] **Step 4: Verify obsolete visible labels are absent**

Run:

```powershell
rg -n '转工单|工单类型|工单分类|工单编号' web/pages/alarm-center/alarm-info.html
```

Expected: no visible business labels remain; internal legacy compatibility names may remain only if required to read existing mock data.

### Task 2: Replace the conversion drawer fields

**Files:**
- Modify: `web/pages/alarm-center/alarm-info.html`

- [ ] **Step 1: Add the required event title field**

Add a full-width `data-transfer-field="title"` input before the contact field. Prefill a single conversion with `${item.device} ${item.type}` and prefill a batch conversion from the first selected alarm.

- [ ] **Step 2: Replace type and category controls**

Use `eventType` with options `设备异常、环境异常、安全事故、消防事件`, and `eventCategory` with options `设备故障、设备离线、燃气泄漏、火灾报警、积水报警、温湿度异常、其他`.

- [ ] **Step 3: Update validation**

Require `title`, `contact`, `phone`, `eventType`, `eventCategory`, `urgency`, and `description`, with matching Chinese error messages.

- [ ] **Step 4: Verify markup fields**

Run:

```powershell
rg -n 'data-transfer-field="(title|eventType|eventCategory)"|事件标题|事件类型|事件分类' web/pages/alarm-center/alarm-info.html
```

Expected: all three event fields and labels are present.

### Task 3: Persist emergency events and update alarm state

**Files:**
- Modify: `web/pages/alarm-center/alarm-info.html`

- [ ] **Step 1: Generate an event identifier per alarm**

Generate identifiers in the form `EVT-ALARM-${sourceAlarmId}-${Date.now()}` and store them in `item.emergencyEventId` and the transfer record.

- [ ] **Step 2: Save the event through the shared store**

Call `window.EMERGENCY_STORE.saveEvent` with `eventId`, `sourceAlarmId`, `title`, `eventType`, `eventCategory`, mapped priority, `source: "报警中心"`, alarm location/time/description, contact details, `status: "待确认"`, and an initial timeline entry.

- [ ] **Step 3: Update alarm state and history**

Set the alarm to `处理中`, mark it `已转单`, store the conversion time, and append a history entry containing `已转应急事件，事件编号`.

- [ ] **Step 4: Update detail rendering**

Render `转应急事件信息`, `事件标题`, `事件类型`, `事件分类`, `事件描述`, `事件编号`, and `转应急事件时间` from the saved conversion data.

### Task 4: Browser verification

**Files:**
- Verify: `web/pages/alarm-center/alarm-info.html`

- [ ] **Step 1: Start the existing static site server**

Use the repository's existing server command if present; otherwise serve the repository root with an available local static server.

- [ ] **Step 2: Verify the page at desktop width**

Confirm the table header, row action, batch action, conversion drawer fields, required validation, and detail footer match the design.

- [ ] **Step 3: Verify conversion behavior**

Submit one event, confirm the generated event number appears in the alarm list, then open the emergency event page and confirm the created event is present.

- [ ] **Step 4: Check console and layout**

Expected: no JavaScript errors, clipped labels, overlapping controls, or duplicate conversion actions.

