import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { productsByName } from '../data/products';

const { Given, When, Then } = createBdd();

When("User adds {string} to the cart", async ({ page }, itemName: string) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addItemToCart(itemName);
})

When("User removes {string} from the cart", async ({ page }, itemName: string) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.removeItemFromCart(itemName);
})

Then("User sees {string} items in the cart", async ({ page }, cartCount: string) => {
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.cartBadge).toHaveText(cartCount);
})

Then("User sees the inventory list", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.inventoryList).toBeVisible();
})

Then("User sees correct details for {string}", async ({ page }, itemName: string) => {
    const inventoryPage = new InventoryPage(page);
    const actualDetails = await inventoryPage.getInventoryItemDetails(itemName);
    const expectedDetails = productsByName[itemName];
    if (!expectedDetails) {
        throw new Error(`No product data found for "${itemName}" in productsByName`);
    }
    expect(actualDetails).toEqual(expectedDetails);
})