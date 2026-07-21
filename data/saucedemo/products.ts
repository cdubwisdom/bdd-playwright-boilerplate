/**
 * Expected product data for assertions, mirroring what saucedemo renders.
 *
 * Add a new product here and register it in {@link productsByName} to make it
 * usable from a feature file.
 */
import { type InventoryItem } from '../../models/saucedemo/InventoryItem';


export const backpack: InventoryItem = {
    name: 'Sauce Labs Backpack',
    description: 'carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.',
    price: 29.99,
    imageAlt: 'Sauce Labs Backpack',
};

export const bikeLight: InventoryItem = {
    name: 'Sauce Labs Bike Light',
    description: 'A red light isn\'t the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.',
    price: 9.99,
    imageAlt: 'Sauce Labs Bike Light',
};

/**
 * Lookup from product name to its expected data, so a step definition can
 * resolve whatever product name a scenario passes it.
 *
 * Keys are computed from each product's own `name` field rather than typed as
 * literals, so a key can never drift out of sync with the data it points at.
 */
export const productsByName: Record<string, InventoryItem> = {
    [backpack.name]: backpack,
    [bikeLight.name]: bikeLight
};