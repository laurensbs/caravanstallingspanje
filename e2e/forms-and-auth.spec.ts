import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('form renders with required fields', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByLabel(/naam/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/onderwerp/i)).toBeVisible();
    await expect(page.getByLabel(/bericht/i)).toBeVisible();
  });

  test('form validation prevents empty submission', async ({ page }) => {
    await page.goto('/contact');

    const submitButton = page.getByRole('button', { name: /verstuur|verzend/i });
    await submitButton.click();

    // Browser validation should prevent submission — form should still be visible
    await expect(page.getByLabel(/naam/i)).toBeVisible();
  });

  test('form fields have aria-required', async ({ page }) => {
    await page.goto('/contact');

    const nameField = page.getByLabel(/naam/i);
    await expect(nameField).toHaveAttribute('aria-required', 'true');
  });
});

test.describe('Admin login', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/admin');

    // Should show login form (not authenticated)
    await expect(page.getByText(/Beheerportaal/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /inloggen/i })).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/admin');

    await page.fill('input[type="email"]', 'wrong@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.getByRole('button', { name: /inloggen/i }).click();

    // Should show error
    await expect(page.getByText(/ongeldig|mislukt|fout/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Staff login', () => {
  test('staff login page renders', async ({ page }) => {
    await page.goto('/staff');

    // Should show staff login
    await expect(page.getByText(/Staff Portal/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /inloggen/i })).toBeVisible();
  });
});
