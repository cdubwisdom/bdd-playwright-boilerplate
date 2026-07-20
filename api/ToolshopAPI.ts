import { type APIResponse, type APIRequestContext } from '@playwright/test';
import { type Paginated } from '../models/Paginated';
import { type Product } from '../models/Product'
import { type Cart } from '../models/Cart';

export class ToolshopAPI {
    readonly request: APIRequestContext;

    constructor(request: APIRequestContext){
        this.request = request;
    }

    private async parse<T>(response: APIResponse, operation: string): Promise<T>{
        if(!response.ok()){
            throw new Error(`${operation} failed: ${response.status()} for ${response.url()}`);
        }
        return await response.json();
    }

    async getPageProducts(pageNumber: number = 1): Promise<Paginated<Product>> {
        const response = await this.request.get('/products', { params: { page: pageNumber } });
        return await this.parse<Paginated<Product>>(response, "getPageProducts");
    }

    async getProduct(productId: string): Promise<Product> {
        const response = await this.request.get(`/products/${productId}`);
        return await this.parse<Product>(response, "getProduct");
    }

    async getCart(cartId: string): Promise<Cart> {
        const response = await this.request.get(`/carts/${cartId}`);
        return await this.parse<Cart>(response, "getCart");
    }

    async createCart(): Promise<string> {
        const response = await this.request.post('/carts');
        return (await this.parse<{ id: string }>(response, "createCart")).id;
    }


}

