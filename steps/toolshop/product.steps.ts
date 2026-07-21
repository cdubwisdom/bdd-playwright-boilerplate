import { expect } from '@playwright/test';
import { Given, Then, When } from '../../fixtures/test';


When('User selects product {string} from list', async ({productListPage, api, state}, productName: string) => {
    const apiResponsePaginated = await api.getPageProducts();
    state.product = productListPage.getProductInAPIFromName(apiResponsePaginated, productName);
    await productListPage.goToProductPage(state.product.id);

})

When('User adds product to cart', async ({productDetailsPage, cartPage, state}) => {
    await productDetailsPage.addProductToCart();
    state.cartId = await cartPage.getCartId();
})

Then('User sees the correct product details', async ({productDetailsPage, api, state}) => {
    const product = state.product;
    if (!product) throw new Error('No product in state — did the "User selects product" step run?');

    const apiResponseProductDetials = await api.getProduct(product.id);
    const displayedProductDetails = await productDetailsPage.scrapeProductDetails();

    expect(displayedProductDetails).toEqual({ 
            name: apiResponseProductDetials.name, 
            price: apiResponseProductDetials.price,
            description: apiResponseProductDetials.description,
            co2_rating: apiResponseProductDetials.co2_rating,
            in_stock: apiResponseProductDetials.in_stock,
            category: { name: apiResponseProductDetials.category.name },
            brand: {name: apiResponseProductDetials.brand.name}
    })
})

Given('User is on toolshop products page', async ({productListPage}) => {
    await productListPage.goto();
})

Then('User can see correct items in cart', async ({cartPage, api, state}) => {
    const cartId = state.cartId;
    if (!cartId) throw new Error('No cartId in state — did the add-to-cart step run?');

    const apiCart = await api.getCart(cartId);

    // gate before scraping — toHaveCount retries, all() does not
    await expect(cartPage.cartLineItems).toHaveCount(apiCart.cart_items.length);

    const displayedCart = await cartPage.getDisplayedItems();

    for (const apiItem of apiCart.cart_items) {
        const row = displayedCart.find(d => d.product.name === apiItem.product.name);
        expect(row, `No cart row displayed for "${apiItem.product.name}"`).toBeDefined();
        expect(row).toEqual({
            quantity: apiItem.quantity,
            product: {
                name: apiItem.product.name,
                price: apiItem.product.price,
            },
        });
    }
})

Then('User sees correct cart total', async ({cartPage, api, state}) => {
    const cartId = state.cartId;
    if (!cartId) throw new Error('No cartId in state — did the add-to-cart step run?');

    const apiCart = await api.getCart(cartId);

    const apiTotalPrice = apiCart.cart_items
        .reduce((sum, i) => sum + i.quantity * i.product.price, 0);

    expect(await cartPage.getCartTotalPrice()).toBeCloseTo(apiTotalPrice, 2);
})

When('User navigates to cart', async ({productDetailsPage, cartPage}) => {
  await productDetailsPage.openCart();
})