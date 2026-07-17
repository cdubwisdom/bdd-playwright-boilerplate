import {type Page, type Locator} from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    readonly cartBadge: Locator;
    static readonly URL = /inventory\.htm/;

    constructor(page: Page) {
        this.page = page;
        this.cartBadge = page.getByTestId('shopping-cart-badge');
    }

    inventoryItem(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName});
    }

    addItemToCartButton(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName}).getByRole('button', {name: 'Add to cart'});
    }

    async goto() {
        await this.page.goto('/inventory.html');
    }

    async addItemToCart(itemName: string) {
        await this.addItemToCartButton(itemName).click();
    }

}
