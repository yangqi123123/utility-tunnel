import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const menu = fs.readFileSync('app/config/menu.js', 'utf8');
const page = fs.readFileSync('web/pages/network/configuration.html', 'utf8');

test('网络管理平台包含组态系统菜单路由', () => {
  assert.match(menu, /service-center\.configuration/);
  assert.match(menu, /\.\.\/network\/configuration\.html/);
});

test('组态页面包含双页签和 SVG 拓扑画布', () => {
  assert.match(page, /data-tab="gateway"/);
  assert.match(page, /data-tab="device"/);
  assert.match(page, /id="topologyCanvas"/);
  assert.match(page, /function renderTopology/);
});

test('组态页面包含节点详情、告警定位和抽屉能力', () => {
  assert.match(page, /function focusNode/);
  assert.match(page, /data-alarm-id/);
  assert.match(page, /openAppDrawer/);
  assert.match(page, /statusTableBody/);
});
