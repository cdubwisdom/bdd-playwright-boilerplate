import { type Page, type Locator } from '@playwright/test';
import { type Brand, type Category, type Product } from '../../models/toolshop/Product';

export type DisplayedProduct = Pick<Product, 'name' | 'description' | 'price' | 'co2_rating' | 'in_stock'>
    & {category: Pick<Category, 'name'>; brand: Pick<Brand, 'name'>};

export class ProductDetailsPage {
    readonly page: Page;
    readonly productName: Locator;
    readonly productDescription: Locator;
    readonly productPrice: Locator;
    readonly increaseQtyButton: Locator;
    readonly decreaseQtyButton: Locator;
    readonly qtyField: Locator;
    readonly co2Rating: Locator;
    readonly productBrand: Locator;
    readonly productCategory: Locator;
    readonly outOfStockTag: Locator;
    readonly addToCartButton: Locator;
    readonly openCartButton: Locator;
    readonly cartBadge: Locator;

    constructor(page: Page) {
        this.page = page;
        this.productName = page.getByTestId('product-name');
        this.productDescription = page.getByTestId('product-description');
        this.productPrice = page.getByTestId('unit-price');
        this.increaseQtyButton = page.getByRole('button', { name: 'Increase quantity' });
        this.decreaseQtyButton = page.getByRole('button', { name: 'Decrease quantity' });
        this.qtyField = page.getByRole('spinbutton', { name:  'Quantity'});
        this.co2Rating = page.getByTestId('co2-rating-badge').locator('.co2-letter.active');
        this.productBrand = page.getByLabel('brand', { exact: true });
        this.productCategory = page.getByLabel('category', { exact: true });
        this.outOfStockTag = page.getByTestId('out-of-stock');
        this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
        this.openCartButton = page.getByRole('menuitem', { name: 'cart' });
        this.cartBadge = page.getByTestId('cart-quantity');
    
    }

    async goto(productId: string) {
        await this.page.goto(`/product/${productId}`);
    }

    async scrapeProductDetails(): Promise<DisplayedProduct> {
        const productDetails = {
            name: (await this.productName.innerText()).trim(),
            description: (await this.productDescription.innerText()).trim(),
            co2_rating: (await this.co2Rating.innerText()).trim(),
            price: Number(await this.productPrice.innerText()),
            in_stock: (await this.outOfStockTag.count() === 0),
            category: { name: (await this.productCategory.innerText()).trim() },
            brand: { name: (await this.productBrand.innerText()).trim() }
        }

        return productDetails;
    }

    async getCurrentQty(): Promise<number> {
        return Number((await this.qtyField.innerText()).trim());
    }

    async setCurrentQty(qty: string) {
        await this.qtyField.fill(qty);
    }

    async increastQty(): Promise<number> {
        await this.increaseQtyButton.click();
        return await this.getCurrentQty();
    }

    async decreaseQty(): Promise<number> {
        await this.decreaseQtyButton.click();
        return await this.getCurrentQty();
    }

    async addToCart() {
        await this.addToCartButton.click();
    }

    async openCart() {
        await this.openCartButton.click();
    }

    async getCartQty(): Promise<number> {
        if(await this.openCartButton.count() != 0){
            return Number(await this.cartBadge.innerText());
        }
        else{
            return 0;
        }
    }
}