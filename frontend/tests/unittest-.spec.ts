import { test, expect } from '@playwright/test';


test.describe('Persistance Test: Register a transaction and verify it exists in TransactionList after reloading the page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('http://localhost:4321');

  test('Data persistance', async ({ page }) => {
    console.log('Starting data persistence test');

    // Register a new transaction
    await page.click('text=Add Transaction');
    await page.fill('input[name="description"]', 'Test Transaction');
    await page.fill('input[name="amount"]', '100');
    await page.click('text=Save');
  });
});








});