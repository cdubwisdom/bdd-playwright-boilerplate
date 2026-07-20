/**
 * A single product as displayed on the inventory page.
 *
 * Shared by both sides of the comparison: `data/products.ts` holds the
 * expected values, and {@link InventoryPage.getInventoryItemDetails} returns
 * the actual scraped values in this same shape so the two can be deep-compared.
 */
export interface InventoryItem {
    name: string;
    description: string;     // Numeric price, parsed from the displayed `$29.99` string. 
    price: number; //The product image's `alt` text — the only assertable part of the image. 
    imageAlt: string;
}
