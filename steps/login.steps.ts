// Step definitions for features/login.feature.
// Given/When/Then come from the fixtures file so page objects can be injected.
import { expect } from '@playwright/test';
import { Given, Then, When } from '../fixtures/test';

Given('User is on login page', async ({ loginPage }) => {
    await loginPage.goto();
});

When("User logs in as {string} with password {string}", async ({ loginPage }, username: string, password: string) => {
    await loginPage.login(username, password);
});

Then("User sees Inventory page", async ({ inventoryPage, page }) => {
    await expect(page).toHaveURL(inventoryPage.URL);
});