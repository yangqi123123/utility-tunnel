# Device Location Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace device house/hierarchy/electricity-subitem fields with project-corridor-room-section-pipeline cascading location fields across the device management workflow.

**Architecture:** Keep the existing single-page device prototype in `web/pages/device/list.html`, but replace the house cascader with a reusable five-level cascader backed by a location tree. Store each selected level as a separate device property and render the same values in filters, list, forms, detail, related-device and import/export workflows.

**Tech Stack:** HTML, inline JavaScript, existing TOB CSS, XLSX browser library.

---

### Task 1: Update device data and five-level cascade

**Files:**
- Modify: `web/pages/device/list.html`

- [ ] Remove house/attachment/powerSubitem properties and add project/corridor/room/section/pipeline properties in mock and blank device data.
- [ ] Replace house cascade markup and binding with a five-level cascade using the existing popover styling.
- [ ] Update save validation and form serialization to require the five location values.

### Task 2: Synchronize all views and data exchange

**Files:**
- Modify: `web/pages/device/list.html`

- [ ] Replace old labels and values in filters, list rows, detail info, related-device and association markup.
- [ ] Remove hierarchy-dependent related-device tabs and association logic.
- [ ] Update import/export headers, row mapping and empty-state column counts.

### Task 3: Verify behavior

**Files:**
- Modify: `web/pages/device/list.html` only if verification finds regressions.

- [ ] Run reference searches to confirm removed labels/properties are absent.
- [ ] Parse the inline script with Node and load the page through a local static server for smoke verification.
