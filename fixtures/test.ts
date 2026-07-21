import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/saucedemo/LoginPage';
import { InventoryPage } from '../pages/saucedemo/InventoryPage';
import { request } from '@playwright/test'
import { ToolshopAPI } from '../api/ToolshopAPI';
import { ProductListPage } from '../pages/toolshop/ProductListPage';
import { ProductDetailsPage } from '../pages/toolshop/ProductDetailsPage';
import { CartPage } from '../pages/toolshop/CartPage';
import type { Product } from '../models/toolshop/Product';

const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com';
export type ScenarioState = {
    product?: Product;
    cartId?: string;
}

export const test = base.extend<{
    state: ScenarioState;
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    api: ToolshopAPI;
    productListPage: ProductListPage;
    productDetailsPage: ProductDetailsPage;
    cartPage: CartPage;
}>({
    state: async ({}, use) => {
        await use({});
    },
    api: async ({}, use) => {
        const context = await request.newContext({ baseURL: API_BASE_URL });
        await use(new ToolshopAPI(context));
        await context.dispose();
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    productDetailsPage: async ({page}, use) => {
        await use(new  ProductDetailsPage(page));
    },
    productListPage: async ({page}, use) => {
        await use(new  ProductListPage(page));
    },
    cartPage: async ({page}, use) => {
        await use(new  CartPage(page));
    }
});

export const { Given, When, Then } = createBdd(test);