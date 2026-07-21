import { type Page, type Locator } from '@playwright/test';
import { type Paginated } from '../../models/toolshop/Paginated';
import { type Product } from '../../models/toolshop/Product';

export class ProductListPage {
    readonly page: Page;
    readonly productCardNames: Locator

    constructor(page: Page) {
        this.page = page;
        this.productCardNames = page.getByTestId('product-name');
    }

    getProductCard(productId: string): Locator {
        return this.page.getByTestId(`product-${productId}`);
    }

    getProductPrice(productCard: Locator): Locator {
        return productCard.getByTestId('product-price');
    }

    getProductName(productCard: Locator): Locator {
        return productCard.getByTestId('product-name');
    }

    getProductEnvRating(productCard: Locator): Locator {
        return productCard.locator('.co2-letter.active');
    }

    async goto() {
        await this.page.goto('/');
    }

    async goToProductPage(productId: string) {
        await this.getProductCard(productId).click();
    }

}