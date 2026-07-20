import {type Page, type Locator} from '@playwright/test';
import { InventoryItem } from '../models/InventoryItems';

export class InventoryPage {
    readonly page: Page;
    readonly cartBadge: Locator;
    readonly inventoryList: Locator;
    static readonly URL = /inventory\.htm/;

    constructor(page: Page) {
        this.page = page;
        this.cartBadge = page.getByTestId('shopping-cart-badge');
        this.inventoryList = page.getByTestId('inventory-list');
    }

    addItemToCartButton(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName}).getByRole('button', {name: 'Add to cart'});
    }

    removeItemToCartButton(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName}).getByRole('button', {name: 'Remove'});
    }

    inventoryItem(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName});
    }

     async goto() {
        await this.page.goto('/inventory.html');
    }

   async getInventoryItemDetails(itemName: string): Promise<InventoryItem> {
        const card = this.inventoryItem(itemName);
        const priceText = await card.getByTestId('inventory-item-price').innerText();

        return {
            name: await card.getByTestId('inventory-item-name').innerText(),
            description: await card.getByTestId('inventory-item-desc').innerText(),
            price: parseFloat(priceText.replace('$', '')),
            imageAlt: await card.getByRole('img').getAttribute('alt') ?? '',
        }
    }

    async addItemToCart(itemName: string) {
        await this.addItemToCartButton(itemName).click();
    }

    async removeItemFromCart(itemName: string) {
        await this.removeItemToCartButton(itemName).click();
    }

}