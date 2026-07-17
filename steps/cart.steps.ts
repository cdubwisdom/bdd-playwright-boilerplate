import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPages';
import { InventoryPage } from '../pages/InventoryPage';

const { Given, When, Then } = createBdd();

When("User adds {string} to the cart", async ({ page }, itemName: string) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
})

Then("User sees {string} items in the cart", async ({ page }, cartCount: string) => {
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.cartBadge).toHaveText(cartCount);
})