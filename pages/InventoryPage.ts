import {type Page, type Locator} from '@playwright/test';
import { InventoryItem } from '../models/InventoryItem';

/**
 * Page Object for the saucedemo inventory (product listing) page shown after
 * a successful login.
 *
 * Item-specific locators are exposed as methods rather than constructor
 * fields, because they are scoped to a product card matched by name.
 */
export class InventoryPage {
    readonly page: Page;
    readonly cartBadge: Locator;
    readonly inventoryList: Locator;
    readonly URL = /inventory\.htm/; //URL pattern for this page. Use with `expect(page).toHaveURL(...)`. 

    constructor(page: Page) {
        this.page = page;
        this.cartBadge = page.getByTestId('shopping-cart-badge');
        this.inventoryList = page.getByTestId('inventory-list');
    }

    /**
     * @param itemName Exact product name as displayed on the card.
     * @returns The "Add to cart" button within that product's card.
     */
    addItemToCartButton(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName}).getByRole('button', {name: 'Add to cart'});
    }

    /**
     * @param itemName Exact product name as displayed on the card.
     * @returns The "Remove" button within that product's card, present only
     * once the item has been added.
     */
    removeItemToCartButton(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName}).getByRole('button', {name: 'Remove'});
    }

    /**
     * @param itemName Exact product name as displayed on the card.
     * @returns The product card, scoped for querying its details.
     */
    inventoryItem(itemName: string): Locator {
        return this.page.getByTestId('inventory-item').filter({hasText: itemName});
    }

    /** Navigates straight to the inventory page, bypassing the login flow. */
     async goto() {
        await this.page.goto('/inventory.html');
    }

    /**
     * Scrapes a product card into a plain object for comparison against the
     * expected data in `data/products.ts`.
     *
     * `price` is parsed out of the displayed `$29.99` string into a number, so
     * the result can be deep-compared with `toEqual`.
     *
     * @param itemName Exact product name as displayed on the card.
     * @returns The card's contents as an {@link InventoryItem}.
     */
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

    /** @param itemName Exact product name as displayed on the card. */
    async addItemToCart(itemName: string) {
        await this.addItemToCartButton(itemName).click();
    }

    /** @param itemName Exact product name as displayed on the card. */
    async removeItemFromCart(itemName: string) {
        await this.removeItemToCartButton(itemName).click();
    }

}
