import {type Page, type Locator} from '@playwright/test';

/**
 * Page Object for the saucedemo login page (the site's landing page).
 *
 * Exposes locators and actions only — assertions belong in the step
 * definitions and specs that use this class.
 */
export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.getByPlaceholder('Username');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', {name: 'Login'});
    }

    /** Navigates to the site root, which serves the login form. */
    async goto() {
        await this.page.goto('/');
    }

    /**
     * Fills both credential fields and submits the form.
     *
     * Does not verify the outcome — a failed login leaves the browser on the
     * login page, and it is the caller's job to assert where it ended up.
     *
     * @param username Login name, e.g. `standard_user`.
     * @param password Password, e.g. `secret_sauce`.
     */
    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}
