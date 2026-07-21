import { type Page, type Locator } from '@playwright/test';
import { type Cart, type CartItem } from '../../models/toolshop/Cart';
import type { Product } from '../../models/toolshop/Product';

export type DisplayedCartItem = Pick<CartItem, 'quantity'>
  & { product: Pick<Product, 'name' | 'price'> };

export type DisplayedCart = Pick<Cart, 'id'>
  & { cart_items: DisplayedCartItem[] };

export class CartPage {
    readonly page: Page;
    readonly cartTotalPrice: Locator;

    constructor(page: Page){
        this.page = page;
        this.cartTotalPrice = page.getByTestId('cart-total');
    }

    getCartLineItem(productName: string): Locator {
        return this.page.locator('tbody tr').filter({
            has: this.page.getByTestId('product-title').filter( 
                { hasText: new RegExp(`^${productName}$`) }
                )
        });
    }

    getCartItemQty(lineItem: Locator): Locator {
        return lineItem.getByTestId('product-quantity');
    }

    getCartItemUnitPrice(lineItem: Locator): Locator {
        return lineItem.getByTestId('product-price');
    }

    getCartItemLinePrice(lineItem: Locator): Locator {
        return lineItem.getByTestId('line-price');
    }

    getCartItemName(lineItem: Locator): Locator {
        return lineItem.getByTestId('product-title');
    }

    async getCartId(): Promise<string> {
        const cartId = await this.page.evaluate(() => localStorage.getItem('cart_id'));

        if (!cartId) {
            throw new Error('cart_id not found in local storage - was an item added to the cart?')
        }

        return cartId;
    }


    async getDisplayedItems(): Promise<DisplayedCartItem[]> {
        const rows = await this.page.locator('tbody tr').all();
        const items: DisplayedCartItem[] = [];

        for (const row of rows) {
            items.push({
            quantity: Number(await this.getCartItemQty(row).inputValue()),
            product: {
                name: (await this.getCartItemName(row).innerText()).trim(),
                price: Number(await this.getCartItemUnitPrice(row).innerText()),
            },
            });
        }

        return items;
    }

    async scrapeCart(): Promise<DisplayedCart> {
        const displayedCart = {
            id: (await this.getCartId()).trim(),
            cart_items: await this.getDisplayedItems()
        }

        return displayedCart
    }
    

}