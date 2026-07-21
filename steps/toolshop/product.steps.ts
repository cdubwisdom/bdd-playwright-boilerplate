import { expect } from '@playwright/test';
import { Given, Then, When } from '../../fixtures/test';

When("Test is done", async ({ api }) => {
    const products = await api.getPageProducts();
    expect(products.total).toBeGreaterThan(0);
    expect(products.data.length).toBeGreaterThan(0)
})