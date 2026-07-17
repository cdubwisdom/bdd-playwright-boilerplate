import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

const { Given, When, Then } = createBdd();

Given('User is on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
});

When("User logs in as {string} with password {string}", async ({ page }, username: string, password: string) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
});

Then("User sees Inventory page", async ({ page }) => {
    await expect(page).toHaveURL(InventoryPage.URL);
});