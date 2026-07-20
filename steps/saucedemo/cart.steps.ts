import { expect } from '@playwright/test';
import { Given, Then, When } from '../../fixtures/test';

import { productsByName } from '../../data/products';

When("User adds {string} to the cart", async ({ inventoryPage }, itemName: string) => {
    await inventoryPage.addItemToCart(itemName);
})

When("User removes {string} from the cart", async ({ inventoryPage }, itemName: string) => {
    await inventoryPage.removeItemFromCart(itemName);
})

Then("User sees {string} items in the cart", async ({ inventoryPage }, cartCount: string) => {
    await expect(inventoryPage.cartBadge).toHaveText(cartCount);
})

Then("User sees the inventory list", async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryList).toBeVisible();
})

Then("User sees correct details for {string}", async ({ inventoryPage }, itemName: string) => {
    const actualDetails = await inventoryPage.getInventoryItemDetails(itemName);
    const expectedDetails = productsByName[itemName];
    if (!expectedDetails) {
        throw new Error(`No product data found for "${itemName}" in productsByName`);
    }
    expect(actualDetails).toEqual(expectedDetails);
})