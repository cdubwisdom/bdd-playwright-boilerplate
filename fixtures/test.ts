import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { request } from '@playwright/test'
import { ToolshopAPI } from '../api/ToolshopAPI';

const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com';
export const test = base.extend<{
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    api: ToolshopAPI;
}>({
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
});

export const { Given, When, Then } = createBdd(test);