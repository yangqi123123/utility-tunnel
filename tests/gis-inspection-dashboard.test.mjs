import { test, expect } from '@playwright/test';

test('inspection dashboard renders six modules and ten systems', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/web/pages/gis/gis-inspection.html');
  await expect(page.locator('[data-inspection-module="overview"]')).toBeVisible();
  await expect(page.locator('[data-inspection-module="systems"]')).toBeVisible();
  await expect(page.locator('[data-inspection-module="zones"]')).toBeVisible();
  await expect(page.locator('[data-inspection-module="devices"]')).toBeVisible();
  await expect(page.locator('[data-inspection-module="analysis"]')).toBeVisible();
  await expect(page.locator('[data-inspection-module="efficiency"]')).toBeVisible();
  await expect(page.locator('#systemsBody .inspection-system')).toHaveCount(10);
});

test('period switch refreshes overview and system filter refreshes device rows', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/web/pages/gis/gis-inspection.html');
  await page.locator('[data-period="month"]').first().click();
  await expect(page.locator('#overviewBody')).toContainText('186');
  await page.locator('#deviceSystem').selectOption({ label: '消防' });
  await expect(page.locator('#deviceTable tbody')).toContainText('消防');
});
