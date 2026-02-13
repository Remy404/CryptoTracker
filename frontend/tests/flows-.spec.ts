import { test, expect } from '@playwright/test';


test.describe('Critical User Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:4321');
  });

  test('Smoke test - Register new transaction', async ({ page }) => {
    await page.getByPlaceholder('e.g. 500.00').click(); // Fiat amount
    await page.getByPlaceholder('e.g. 500.00').fill('5678'); //Fill fiat amount
    await page.getByRole('textbox', { name: 'e.g.' }).click(); // Crypto amount
    await page.getByRole('textbox', { name: 'e.g.' }).fill('1234'); // Fill crypto amount
    await page.getByRole('combobox').selectOption('LTC'); // Select LTC from dropdown
    // page.once('dialog', dialog => {
    //  console.log(`Dialog message: ${dialog.message()}`);
    //  dialog.dismiss().catch(() => {});
    // });
    await page.getByRole('button', { name: 'Register Transaction' }).click(); // Click register button
    await expect(page.locator('.asset-card', { hasText: 'LTC' })).toBeVisible(); // Assert new transaction appears
  });

  test('Smoke test - Edit transaction ', async ({ page }) => {
    const ltcCard = page.locator('.asset-card', { hasText: 'LTC' });
    await expect(ltcCard).toBeVisible();
    await ltcCard.locator('.card-header').click();

    const row = page.getByRole('row').nth(1);
    await expect(row).toBeVisible();
    await row.locator('.edit').click();


    const amountInput = page.locator('input[name="cryptoAmount"]');
    await page.locator('astro-island').filter({ hasText: 'LTCCurrent Price$52.' }).getByRole('textbox').click();

    await expect(amountInput).toBeVisible();
    await amountInput.fill('9999'); // Change crypto amount to 9999
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.dismiss().catch(() => {});
    });
    
    await page.locator('.btn-save').click();

    await expect(amountInput).not.toBeVisible();
    await expect(row).toContainText('9999');

  });

  test('Smoke test - Delete transaction', async ({ page }) => {

    const ltcCard = page.locator('.asset-card', { hasText: 'LTC' });
    await expect(ltcCard).toBeVisible();

    await ltcCard.locator('.card-header').click();

    const row = page.getByRole('row', { name: '9999' });
    await expect(row).toBeVisible();

    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept();
    });

    await row.locator('.delete').click();
    await expect(row).not.toBeVisible();
  });
});

