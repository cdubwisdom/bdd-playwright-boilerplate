import { type Product } from './Product'

export interface Cart {
    id: string;
    cart_items: CartItem[];
}

export interface CartItem {
    id: string;
    quantity: number;
    product_id: string;
    product: Product;
}