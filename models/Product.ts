export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    in_stock: boolean;
    category: Category;
    brand: Brand;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Brand {
    id: string;
    name: string;
}