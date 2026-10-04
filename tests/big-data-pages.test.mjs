import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const pages = [
  ["device-diagnosis", "big-data.diagnosis", "设备诊断"],
  ["abnormal-warning", "big-data.warning", "异常预警"],
  ["energy-analysis", "big-data.energy", "能耗分析"],
];

test("menu places big data analysis right after the alarm center", async () => {
  const source = await read("app/config/menu.js");
  const alarmIndex = source.indexOf('key: "alarm-center"');
  const bigDataIndex = source.indexOf('key: "big-data"');
  const configurationIndex = source.indexOf('key: "configuration"');
  assert.ok(alarmIndex >= 0 && bigDataIndex >= 0 && configurationIndex >= 0);
  assert.ok(alarmIndex < bigDataIndex && bigDataIndex < configurationIndex);
  assert.match(source, /label: "大数据分析"/);
  assert.match(source, /big-data\.diagnosis[\s\S]*?label: "设备诊断"/);
  assert.match(source, /big-data\.warning[\s\S]*?label: "异常预警"/);
  assert.match(source, /big-data\.energy[\s\S]*?label: "能耗分析"/);
});

test("menu children point at existing placeholder pages", async () => {
  for (const [page] of pages) {
    await access(new URL(`../web/pages/big-data/${page}.html`, import.meta.url));
  }
});

test("sidebar provides a big data navigation icon", async () => {
  const source = await read("app/components/sidebar.js");
  assert.match(source, /"big-data":\s*'[\s\S]*?<path/);
});

for (const [page, key, title] of pages) {
  test(`${page} page renders the coming soon placeholder`, async () => {
    const source = await read(`web/pages/big-data/${page}.html`);
    assert.match(source, /class="app-shell"/);
    assert.match(source, new RegExp(`data-menu-key="${key.replace(".", "\\.")}"`));
    assert.match(source, /data-page-section="大数据分析"/);
    assert.match(source, new RegExp(`data-page-title="${title}"`));
    assert.match(source, new RegExp(`<title>${title}`));
    assert.match(source, /tob-ui\.css/);
    assert.match(source, /coming-soon\.css/);
    assert.match(source, /功能建设中，敬请期待/);
    assert.match(source, /app\/config\/menu\.js\?v=/);
    assert.match(source, /app\/components\/sidebar\.js\?v=/);
    assert.match(source, /app\/components\/header\.js\?v=/);
  });
}

test("big data pages declare no business data layer", async () => {
  for (const [page] of pages) {
    const source = await read(`web/pages/big-data/${page}.html`);
    assert.doesNotMatch(source, /app\/data\//);
    assert.doesNotMatch(source, /<table/);
  }
});
