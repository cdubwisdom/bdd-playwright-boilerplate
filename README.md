# Playwright BDD Boilerplate

A starting point for UI test suites built on [Playwright](https://playwright.dev) and
[playwright-bdd](https://vitalets.github.io/playwright-bdd/), written in TypeScript and organised
around the Page Object Model. It targets [saucedemo.com](https://www.saucedemo.com), a public demo
storefront, so the suite runs out of the box with no environment setup.

The repo deliberately demonstrates **two testing styles side by side** so you can pick the one that
fits your team:

- **`pure-playwright`** — plain `@playwright/test` specs, including a raw version and a Page Object
  version of the same test, to show what POM actually buys you.
- **`bdd-playwright`** — Gherkin `.feature` files backed by step definitions, for teams that want
  business-readable scenarios.

Both run from the same page objects, fixtures, and test data.

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

- `features/login.feature` → *"User with standard role can Login (Intentionally Fails)"*
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
| `features/` | Gherkin `.feature` files — the BDD scenarios. |
| `steps/` | Step definitions that bind Gherkin text to code. One file per feature. |
| `pages/` | Page Objects. Locators and actions for a single page. |
| `fixtures/` | The extended Playwright `test` object that injects page objects into steps. |
| `models/` | TypeScript interfaces describing domain data. |
| `data/` | Expected test data and lookup tables. |
| `tests/` | Plain `@playwright/test` specs (the non-BDD project). |
| `playwright.config.ts` | Runner config: projects, reporters, timeouts, base URL. |
| `.features-gen/` | **Generated** specs produced from `features/` by `bddgen`. Gitignored — never edit by hand. |
| `playwright-report/` | **Generated** HTML report. Gitignored, wiped on every run. |

## The two Playwright projects

`playwright.config.ts` defines two projects, and by default both run:

```bash
npx playwright test --project=pure-playwright   # just the plain specs
npx playwright test --project=bdd-playwright    # just the BDD scenarios
```

`bdd-playwright` does not point at `features/` directly. `bddgen` reads the `.feature` files and
generates real Playwright specs into `.features-gen/`, and *those* are what the runner executes.
This is why `npm test` is `bddgen && playwright test` — the generate step has to happen first. If you
run `npx playwright test` on its own after editing a feature file, you will be testing stale
generated output.

## Adding a new test (BDD)

Working outside-in, from the scenario to the code:

**1. Write the scenario** in a `features/*.feature` file:

```gherkin
@cart
Scenario: User can add a single item to the cart
    When User adds "Sauce Labs Bike Light" to the cart
    Then User sees "1" items in the cart
```

**2. Add any missing step definitions** in the matching `steps/*.steps.ts` file. Import
`Given`/`When`/`Then` from the fixtures file, not from `playwright-bdd` directly:

```ts
import { Given, Then, When } from '../fixtures/test';

Then('User sees {string} items in the cart', async ({ inventoryPage }, cartCount: string) => {
    await expect(inventoryPage.cartBadge).toHaveText(cartCount);
});
```

`{string}` matches a quoted value in the Gherkin and passes it as an argument. Page objects arrive
via destructuring — see [Fixtures](#fixtures).

**3. Add page object methods** in `pages/` for any new interaction. Keep the assertion in the step
definition and the interaction in the page object.

**4. Add expected data** to `data/products.ts` if the assertion compares against product details.
Register it in `productsByName` so steps can look it up by name.

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

Looking at `pages/InventoryPage.ts` as the reference:

- **Static locators** are assigned in the constructor as `readonly` fields.
- **Parameterised locators** are methods returning a `Locator` — e.g.
  `addItemToCartButton(itemName)` filters the item list by text.
- **Actions** are `async` methods that click, fill, or navigate.
- **Assertions do not belong here.** Page objects expose locators and data; steps and specs assert.

`testIdAttribute: "data-test"` is set in `playwright.config.ts`, so `page.getByTestId('foo')`
resolves saucedemo's `data-test="foo"` attributes rather than the default `data-testid`.

## Fixtures

Step definitions do not construct page objects. `fixtures/test.ts` extends the Playwright `test`
object with `loginPage` and `inventoryPage` fixtures, so any step can request one by destructuring:

```ts
When('User adds {string} to the cart', async ({ inventoryPage }, itemName: string) => {
    await inventoryPage.addItemToCart(itemName);
});
```

Fixtures are lazy — a page object is only constructed for tests that actually ask for it.

> **Gotcha:** `defineBddConfig`'s `steps` option must include the fixtures directory:
> ```ts
> steps: ['./steps/**/*.ts', './fixtures/**/*.ts'],
> ```
> `bddgen` scans those paths to find which `test` object your steps use. Drop `fixtures/` and
> generation fails with *"Can't guess test instance."*

## Tags and filtering

| Tag | Applied to |
|---|---|
| `@login` | `login.feature` (feature level — all its scenarios) |
| `@inventory` | `cart.feature` (feature level — all its scenarios) |
| `@itemDetails` | The item-details `Scenario Outline` |
| `@cart` | The add-to-cart and remove-from-cart scenarios |
| `@failureExample` | Both deliberately failing tests |

Tags are cumulative: a scenario tagged `@cart` inside a `@inventory` feature carries both.

Filter with Playwright's own `--grep` flags:

```bash
npx playwright test --grep "@itemDetails"            # only these (2 tests)
npx playwright test --grep-invert "@failureExample"  # everything except (7 tests)

# Combine to narrow: all @inventory scenarios apart from the outline
npx playwright test --grep "@inventory" --grep-invert "@itemDetails"
```

Tagging works in both projects. In `.feature` files you write Gherkin tags above the scenario;
in plain specs you pass them as test details:

```ts
test('Login with valid credentials (POM, Intentionally Fails)', { tag: '@failureExample' }, async ({ page }) => {
```

## Scripts

| Script | What it does |
|---|---|
| `npm test` | `bddgen` then the full suite. Exits non-zero — see [intentional failures](#the-intentional-failures). |
| `npm run test:ci` | Same, excluding `@failureExample`. This is what CI runs. |
| `npm run typecheck` | `tsc --noEmit`. Fast feedback on type errors without running browsers. |
| `npm run bddgen` | Regenerates `.features-gen/` only. Rarely needed directly. |

## Reports

The HTML reporter is configured with `open: 'never'`, so runs do not pop open a browser. View the
last run with:

```bash
npx playwright show-report
```

Traces are captured with `retain-on-failure` — recorded for every test, kept only for failures. Open
one from the failed test in the report to step through the run.

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
6. Zip and upload the HTML report as `saucedemo-report-<run-number>-<timestamp>.zip`

The report steps use `if: always()` so the artifact is still uploaded when tests fail — which is
exactly when you want it. Download it from the run's summary page and open it with
`npx playwright show-report <file>.zip`.

## Troubleshooting

**`Cannot find module '@playwright/test'` (or similar) after pulling**
`node_modules/` is not tracked by git, so it does not update with a pull. Run `npm ci`.

**Feature file changes are not taking effect**
You are running stale generated specs. Run `npm test` (which regenerates first) rather than
`npx playwright test` on its own.

**`Can't guess test instance for: features\*.feature`**
`bddgen` cannot find the file exporting your extended `test`. Confirm `fixtures/**/*.ts` is still in
the `steps` array in `playwright.config.ts` — see [Fixtures](#fixtures).

**Browser window stays open after a run in VS Code**
That is the Playwright extension's "Show browser" mode reusing a single browser across runs, not a
leak in the tests. Toggle it off in the Testing sidebar, or stop the run from there.
