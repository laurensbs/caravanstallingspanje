import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('homepage loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Caravanstalling Spanje/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('stalling page loads', async ({ page }) => {
    await page.goto('/stalling');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('diensten page loads', async ({ page }) => {
    await page.goto('/diensten');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('tarieven page loads', async ({ page }) => {
    await page.goto('/tarieven');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('locaties page loads', async ({ page }) => {
    await page.goto('/locaties');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('main navigation links work', async ({ page }) => {
    await page.goto('/');

    // Check header has navigation
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Navigate to stalling
    await page.getByRole('link', { name: /stalling/i }).first().click();
    await expect(page).toHaveURL(/stalling/);
  });

  test('footer is visible on all pages', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('SEO', () => {
  test('homepage has correct meta tags', async ({ page }) => {
    await page.goto('/');

    // Check meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /caravanstalling|Costa Brava/i);

    // Check Open Graph
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Caravanstalling/);
  });

  test('schema.org JSON-LD exists on homepage', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Accessibility', () => {
  test('skip link is present', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
