import {test, expect} from '@playwright/test';
import {LoginPage} from '../pages/LoginPage';
import {InventoryPage} from '../pages/InventoryPage';

//Login with valid credentials without using Page Object Model (POM)
test('Login with valid credentials (Non-POM)', async ({page}) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', {name: 'Login'}).click();
    await expect(page).toHaveURL(/inventory/);
})

//Login with valid credentials using Page Object Model (POM)
test('Login with valid credentials (POM)', async ({page}) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(inventoryPage.URL);
})


//Deliberatly fails to show failure artifacts in the report.
test('Login with valid credentials (POM, Intentionally Fails)', { tag: '@failureExample' }, async ({page}) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');
    await expect(page).toHaveURL(inventoryPage.URL);
})