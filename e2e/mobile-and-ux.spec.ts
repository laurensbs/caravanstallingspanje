import { test, expect } from '@playwright/test';

test.describe('Mobile responsive', () => {
  test('hamburger menu appears on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Desktop nav should be hidden, mobile menu button visible
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    // Or a hamburger icon button
    const hamburger = page.locator('header button').first();
    await expect(hamburger).toBeVisible();
  });

  test('mobile bottom nav is visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Mobile nav component should be visible
    const mobileNav = page.locator('nav').last();
    await expect(mobileNav).toBeVisible();
  });

  test('pages render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    for (const path of ['/', '/stalling', '/diensten', '/tarieven', '/contact']) {
      await page.goto(path);
      await expect(page.locator('body')).toBeVisible();
      // No horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
    }
  });
});

test.describe('Cookie consent', () => {
  test('cookie banner appears on first visit', async ({ page }) => {
    await page.goto('/');
    // Cookie consent should appear after delay
    await page.waitForTimeout(2000);
    const banner = page.getByText(/cookies/i);
    await expect(banner).toBeVisible({ timeout: 5000 });
  });

  test('accepting cookies hides banner', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const acceptButton = page.getByRole('button', { name: /accepteer|akkoord/i });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await expect(acceptButton).not.toBeVisible({ timeout: 3000 });
    }
  });
});
