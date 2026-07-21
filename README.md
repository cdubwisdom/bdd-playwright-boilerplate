# Playwright BDD Boilerplate

A starting point for UI and API test suites built on [Playwright](https://playwright.dev) and
[playwright-bdd](https://vitalets.github.io/playwright-bdd/), written in TypeScript and organised
around the Page Object Model. It targets two public demo storefronts, so the suite runs out of the
box with no environment setup.

The repo deliberately demonstrates **three testing styles side by side** so you can pick the one
that fits your team:

- **`pure-playwright`** — plain `@playwright/test` specs, including a raw version and a Page Object
  version of the same test, to show what POM actually buys you.
- **`bdd-playwright`** — Gherkin `.feature` files backed by step definitions, for teams that want
  business-readable scenarios.
- **`toolshop-bdd`** — the same BDD approach, plus **blended UI + API testing**: a REST client used
  as the source of truth for UI assertions, and vice versa.

All three run from the same fixtures and conventions.

## Target applications

Two apps, because neither one demonstrates everything:

| App | UI | API |
|---|---|---|
| **saucedemo** | `https://www.saucedemo.com` | none |
| **Toolshop** | `https://practicesoftwaretesting.com` | `https://api.practicesoftwaretesting.com` |

saucedemo is the classic login/inventory practice site, but it has no API — so the API and blending
work lives against Toolshop.

## Prerequisites

- **Node.js 24** (what CI runs; anything modern will likely work)
- **npm**

Browser binaries are **not** installed by `npm ci` — `@playwright/test` has no postinstall hook, so
you install them explicitly. See below.

## Quick start

```bash
npm ci                            # install dependencies from the lockfile
npx playwright install chromium   # download the browser binary
npm test                          # generate BDD specs, then run everything
```

> **Heads up:** `npm test` finishes with **2 failing tests, and that is correct.** They fail on
> purpose. See the next section before you go debugging.

For a run that should be entirely green:

```bash
npm run test:ci
```

## The intentional failures

Two tests are hardcoded to fail:

- `features/saucedemo/login.feature` → *"User with standard role can Login (Intentionally Fails)"*
- `tests/login.spec.ts` → *"Login with valid credentials (POM, Intentionally Fails)"*

Both log in with a wrong password and then assert they landed on the inventory page. They exist so
the repo always has a realistic failure to look at — traces, error context, and screenshots in the
HTML report are much easier to understand when you can see a real one.

Both are tagged **`@failureExample`**, which makes them easy to exclude:

| Command | Result |
|---|---|
| `npm test` | Runs everything. **Exits non-zero** because of the two deliberate failures. |
| `npm run test:ci` | Excludes `@failureExample`. Exits zero when the suite is healthy. |

CI runs `test:ci`, which is why the pipeline stays green. If you fork this as a real project, delete
both tests and the `--grep-invert` from the `test:ci` script.

## Project layout

| Path | Role |
|---|---|
| `features/` | Gherkin `.feature` files — the BDD scenarios. Split per app. |
| `steps/` | Step definitions that bind Gherkin text to code. Split per app. |
| `pages/` | Page Objects. Locators and actions for a single page. Split per app. |
| `models/` | TypeScript interfaces describing domain and API data. Split per app. |
| `data/` | Expected test data and lookup tables. Split per app. |
| `api/` | API clients. `ToolshopAPI.ts` wraps the Toolshop REST endpoints. |
| `fixtures/` | The extended Playwright `test` object that injects page objects, the API client, and scenario state. |
| `tests/` | Plain `@playwright/test` specs (the non-BDD project). |
| `playwright.config.ts` | Runner config: projects, reporters, timeouts, base URLs. |
| `.features-gen/` | **Generated** specs produced from `features/` by `bddgen`. Gitignored — never edit by hand. |
| `playwright-report/` | **Generated** HTML report. Gitignored, wiped on every run. |

Anything app-specific is namespaced — `pages/toolshop/`, `models/saucedemo/`, and so on. `api/` and
`fixtures/` stay flat: `ToolshopAPI` names its app already, and the fixture file is shared by all
three projects.

## The three Playwright projects

`playwright.config.ts` defines three projects, and by default all run:

```bash
npx playwright test --project=pure-playwright   # just the plain specs
npx playwright test --project=bdd-playwright    # just the saucedemo BDD scenarios
npx playwright test --project=toolshop-bdd      # just the Toolshop UI + API scenarios
```

The BDD projects do not point at `features/` directly. `bddgen` reads the `.feature` files and
generates real Playwright specs, and *those* are what the runner executes. This is why `npm test` is
`bddgen && playwright test` — the generate step has to happen first. If you run `npx playwright test`
on its own after editing a feature file, you will be testing stale generated output.

Each BDD project gets its **own** `defineBddConfig` with a separate `outputDir`
(`.features-gen/saucedemo`, `.features-gen/toolshop`) so their generated specs don't collide.
`toolshop-bdd` also overrides `baseURL`, since the two apps live on different hosts.

## Blended UI + API testing

The Toolshop project demonstrates two directions of blending. Both are in
`features/toolshop/api-cart.feature`.

**API → UI.** Fetch data from REST, then assert the UI renders it. The API decides what's expected,
so no product data is hardcoded:

```gherkin
When User selects product "Claw Hammer" from list
Then User sees the correct product details
```

The step fetches the product from `GET /products/{id}`, scrapes the rendered detail page, and
compares the two objects.

**UI → API.** Act in the browser, then assert the backend actually persisted it. The bridge is the
cart id, which the app stores in **session storage** (not local storage) under the key `cart_id`:

```gherkin
When User adds product to cart
And User navigates to cart
Then User can see correct items in cart
And User sees correct cart total
```

The step reads `cart_id` out of session storage, calls `GET /carts/{id}`, and asserts the rendered
rows match. The cart total is checked against `Σ(quantity × price)`, because the API doesn't return
a computed total.

Deliberately out of scope: token-injection auth bypass, and standalone contract tests.

### Why nothing is hardcoded

Toolshop's product ids are **ULIDs, and the dataset resets periodically** — ids were observed
changing several times within a single working session. Every expectation is therefore fetched at
runtime, and locators that need an id build it from an API response:

```ts
page.getByTestId(`product-${product.id}`)
```

Hardcoding an id, price, or cart id into a test gives it a shelf life measured in hours.

## Adding a new test (BDD)

Working outside-in, from the scenario to the code:

**1. Write the scenario** in a `features/<app>/*.feature` file:

```gherkin
@cart
Scenario: User can add a single item to the cart
    When User adds "Sauce Labs Bike Light" to the cart
    Then User sees "1" items in the cart
```

**2. Add any missing step definitions** in the matching `steps/<app>/*.steps.ts` file. Import
`Given`/`When`/`Then` from the fixtures file, not from `playwright-bdd` directly:

```ts
import { Given, Then, When } from '../../fixtures/test';

Then('User sees {string} items in the cart', async ({ inventoryPage }, cartCount: string) => {
    await expect(inventoryPage.cartBadge).toHaveText(cartCount);
});
```

`{string}` matches a quoted value in the Gherkin and passes it as an argument. Page objects arrive
via destructuring — see [Fixtures](#fixtures).

**3. Add page object methods** in `pages/<app>/` for any new interaction. Keep the assertion in the
step definition and the interaction in the page object.

**4. Add expected data** to `data/saucedemo/products.ts` if the assertion compares against static
product details. Register it in `productsByName` so steps can look it up by name. For Toolshop, don't
— fetch from the API instead.

Run `npm test` and the new scenario is picked up automatically — no registration step.

### Scenario Outline

For data-driven cases, use an `Examples` table. Each row becomes its own test:

```gherkin
@itemDetails
Scenario Outline: User sees correct item details
    Then User sees correct details for <itemName>
    Examples:
        | itemName                |
        | "Sauce Labs Backpack"   |
        | "Sauce Labs Bike Light" |
```

Note the quotes live inside the table cells, so the substituted step text still matches `{string}`.

## Page Object conventions

Looking at `pages/saucedemo/InventoryPage.ts` and `pages/toolshop/CartPage.ts` as the references:

- **Static locators** are assigned in the constructor as `readonly` fields.
- **Parameterised locators** are methods returning a `Locator` — e.g. `getCartLineItem(productName)`
  filters the row list by a nested locator.
- **Actions** are `async` methods that click, fill, or navigate.
- **Assertions do not belong here.** Page objects expose locators and data; steps and specs assert.
  Page objects *may* wait (`waitFor`, `waitForFunction`) — synchronising is their job, judging
  correctness isn't.

`testIdAttribute: "data-test"` is set in `playwright.config.ts`, so `page.getByTestId('foo')`
resolves both apps' `data-test="foo"` attributes rather than the default `data-testid`.

### Locator priority

Role → label → test id → CSS, in that order. Two cases in this repo are worth calling out because
they're the exceptions:

- **Toolshop's CO₂ badge** uses a class (`.co2-letter.active`) because the element has no role or
  label. Note the Angular `_ngcontent-*` attributes on that markup are build-generated hashes —
  never locate on them.
- **Toolshop's cart rows** use `tbody tr` rather than `getByRole('row')`, because updating a
  quantity changes the table's computed `display`, which strips the implicit ARIA table semantics
  and makes the role-based locator stop matching.

### Scraping vs. web-first assertions

`expect(locator).toHaveText()` retries until it matches; `textContent()` / `innerText()` read once
and don't. Where a page object must return scraped data (`scrapeProductDetails()`,
`getDisplayedItems()`), gate it first:

| One-shot, no retry | Retrying equivalent |
|---|---|
| `evaluate()` | `waitForFunction()` |
| `count()`, `all()` | `expect(...).toHaveCount()` |
| `isVisible()` | `waitFor()` / `expect(...).toBeVisible()` |

## Fixtures

Step definitions do not construct page objects. `fixtures/test.ts` extends the Playwright `test`
object, so any step can request what it needs by destructuring:

```ts
When('User adds {string} to the cart', async ({ inventoryPage }, itemName: string) => {
    await inventoryPage.addItemToCart(itemName);
});
```

Fixtures are lazy — a page object is only constructed for tests that actually ask for it.

Three are worth understanding:

- **`api`** builds its own `APIRequestContext` pointed at the API's `baseURL`, because the API host
  differs from the project's UI `baseURL`. It disposes the context after `use()`.
- **`state`** is a plain object, created fresh per scenario, that steps read and write. It's how a
  `When` hands a product or a cart id to a later `Then` — steps are independent functions and can't
  otherwise share anything. Its fields are optional, so steps guard before use and throw a named
  error if a prerequisite step didn't run.
- **Page object fixtures** (`loginPage`, `productListPage`, …) each wrap `new PageObject(page)`.

> **Gotcha:** `defineBddConfig`'s `steps` option must include the fixtures directory:
> ```ts
> steps: ['./steps/toolshop/**/*.ts', './fixtures/**/*.ts'],
> ```
> `bddgen` scans those paths to find which `test` object your steps use. Drop `fixtures/` and
> generation fails with *"Can't guess test instance."*

## Typing API responses

Interfaces in `models/` describe what the API **actually returns**, not what would be convenient:

- Model only the fields you consume. `Paginated<T>` declares three of the envelope's seven fields;
  the rest are ignored at runtime.
- Narrow where the payload narrows. `CartItem.product` is `Omit<Product, 'category' | 'brand'>`,
  because `GET /carts/{id}` returns a *reduced* product. Typing it as the full `Product` compiles
  fine and then hands you `undefined` at runtime.
- Page objects return their own narrowed types (`DisplayedProduct`, `DisplayedCartItem`) built with
  `Pick<>`, describing what that page can actually show. Deriving them from the API model means a
  renamed field breaks the build instead of silently drifting.

## Tags and filtering

| Tag | Applied to |
|---|---|
| `@login` | `saucedemo/login.feature` (feature level — all its scenarios) |
| `@inventory` | `saucedemo/cart.feature` (feature level — all its scenarios) |
| `@toolshop` | `toolshop/api-cart.feature` (feature level) |
| `@itemDetails` | The item-details `Scenario Outline` |
| `@cart` | The add-to-cart and remove-from-cart scenarios |
| `@apiUi` | Scenarios that blend UI and API assertions |
| `@failureExample` | Both deliberately failing tests |

Tags are cumulative: a scenario tagged `@cart` inside an `@inventory` feature carries both. Tag
matching is **case-sensitive** — `@apiUi` and `@apiui` are different tags.

Filter with Playwright's own `--grep` flags:

```bash
npx playwright test --grep "@itemDetails"            # only these
npx playwright test --grep-invert "@failureExample"  # everything except
npx playwright test --grep "@apiUi"                  # only the blended scenarios

# Combine to narrow: all @inventory scenarios apart from the outline
npx playwright test --grep "@inventory" --grep-invert "@itemDetails"
```

Tagging works in both styles. In `.feature` files you write Gherkin tags above the scenario; in
plain specs you pass them as test details:

```ts
test('Login with valid credentials (POM, Intentionally Fails)', { tag: '@failureExample' }, async ({ page }) => {
```

## Scripts

| Script | What it does |
|---|---|
| `npm test` | `bddgen` then the full suite. Exits non-zero — see [intentional failures](#the-intentional-failures). |
| `npm run test:ci` | Same, excluding `@failureExample`. This is what CI runs. |
| `npm run test:saucedemo` | The `bdd-playwright` project only. |
| `npm run test:toolshop` | The `toolshop-bdd` project only. |
| `npm run typecheck` | `tsc --noEmit`. Fast feedback on type errors without running browsers. |
| `npm run bddgen` | Regenerates `.features-gen/` only. Rarely needed directly. |

## Reports

The HTML reporter is configured with `open: 'never'`, so runs do not pop open a browser. View the
last run with:

```bash
npx playwright show-report
```

Traces are captured with `retain-on-failure` — recorded for every test, kept only for failures. Open
one from the failed test in the report to step through the run, including a DOM snapshot at the
moment of failure. For a locator that stopped matching, that snapshot usually diagnoses it without a
re-run.

**Two things to know before sharing a report:**

1. **It is not a single self-contained file.** Test results are inlined into `index.html`, but
   traces and screenshots are separate files under `playwright-report/data/`. Emailing
   `index.html` alone produces a report with no attachments. Zip the whole folder instead, and have
   the recipient open it with `npx playwright show-report report.zip` — that reads the archive
   directly, no extraction needed.
2. **The folder is wiped on every run.** There is no history. CI solves this by uploading each run's
   report as a separate artifact.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`:

1. Checkout, set up Node 24
2. `npm ci`
3. `npx playwright install --with-deps chromium` — `--with-deps` pulls the Linux system libraries a
   bare runner lacks
4. `npm run typecheck` — fails fast before spending time on browsers
5. `npm run test:ci` — the tag-filtered run, so deliberate failures do not turn CI red
6. Zip and upload the HTML report as `playwright-report-<run-number>-<timestamp>.zip`

The report steps use `if: always()` so the artifact is still uploaded when tests fail — which is
exactly when you want it. Download it from the run's summary page and open it with
`npx playwright show-report <file>.zip`.

Retries are enabled **in CI only** (`retries: process.env.CI ? 2 : 0`). Both target apps are live
third-party sites, and Toolshop's dataset resets on its own schedule — a retry absorbs a reset that
lands mid-run, while local runs stay strict so real flakiness still surfaces.

## Troubleshooting

**`Cannot find module '@playwright/test'` (or similar) after pulling**
`node_modules/` is not tracked by git, so it does not update with a pull. Run `npm ci`.

**Feature file changes are not taking effect**
You are running stale generated specs. Run `npm test` (which regenerates first) rather than
`npx playwright test` on its own.

**`Can't guess test instance for: features\*.feature`**
`bddgen` cannot find the file exporting your extended `test`. Confirm `fixtures/**/*.ts` is still in
the `steps` array for that app's `defineBddConfig` — see [Fixtures](#fixtures).

**A Toolshop test fails with a product not found, or an unexpected id**
The dataset reset. Anything hardcoded from a previous run — a product id, a cart id — is now stale.
Expectations should be fetched at runtime; see [Why nothing is hardcoded](#why-nothing-is-hardcoded).

**A price comparison fails with `NaN`**
A price was parsed from text that includes a currency symbol. The two apps format prices
differently, and even different pages of the same app do — the product detail page renders a bare
`14.24` while the cart renders `$14.24`. Strip non-numeric characters before converting.

**Browser window stays open after a run in VS Code**
That is the Playwright extension's "Show browser" mode reusing a single browser across runs, not a
leak in the tests. Toggle it off in the Testing sidebar, or stop the run from there.
