import { type Page, type Locator } from '@playwright/test';
import { type Paginated } from '../../models/toolshop/Paginated';
import { type Product } from '../../models/toolshop/Product';
import { productsByName } from '../../data/saucedemo/products';

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

    getProductInAPIFromName(products: Paginated<Product>, productName: string): Product {
        const product = products.data.find(p => p.name === productName);

        if (!product) {
            throw new Error(`Product "${productName}" not found in page ${products.current_page}`);
        }

        return product;

    }

}