import { test as base, createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

/**
 * The Playwright `test` object extended with a page object per fixture.
 *
 * Extends playwright-bdd's `test` (not the one from `@playwright/test`), since
 * `createBdd` needs the BDD step machinery attached.
 *
 * Fixtures are lazy: a page object is only constructed for tests that actually
 * destructure it, and it is torn down with the `page` it was built from.
 */
export const test = base.extend<{
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
}>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
});

/**
 * Step definition builders bound to the extended `test` above.
 *
 * Step files must import these rather than calling `createBdd()` themselves —
 * a bare call binds to the default test object, and the page object fixtures
 * would not be available inside step callbacks.
 *
 * Note that `defineBddConfig`'s `steps` glob in `playwright.config.ts` must
 * keep covering the fixtures directory, so `bddgen` can find this file.
 */
export const { Given, When, Then } = createBdd(test);
