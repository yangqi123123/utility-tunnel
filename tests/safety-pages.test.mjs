import assert from "node:assert/strict";
import fs from "node:fs";

const menu = fs.readFileSync("app/config/menu.js", "utf8");
const plans = fs.readFileSync("web/pages/safety/plans.html", "utf8");
const regulations = fs.readFileSync("web/pages/safety/regulations.html", "utf8");

assert.match(menu, /key: "safety"/);
assert.match(menu, /safety\.plans/);
assert.match(menu, /safety\.regulations/);
assert.match(plans, /data-menu-key="safety\.plans"/);
assert.match(plans, /提交审核/);
assert.match(plans, /修订/);
assert.match(plans, /safety-toolbar/);
assert.match(plans, /safetyPlanCount/);
assert.match(regulations, /data-menu-key="safety\.regulations"/);
assert.match(regulations, /国家/);
assert.match(regulations, /失效/);
assert.match(regulations, /safety-toolbar/);
assert.match(regulations, /safetyRegCount/);

console.log("safety pages static checks passed");
