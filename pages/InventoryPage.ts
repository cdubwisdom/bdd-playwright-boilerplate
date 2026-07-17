import {type Page, type Locator} from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    static readonly URL = /inventory\.htm/;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('/inventory.html');
    }

}
