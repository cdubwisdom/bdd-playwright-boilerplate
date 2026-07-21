import {defineConfig, devices} from '@playwright/test';
import {defineBddConfig} from 'playwright-bdd';

// Generates Playwright specs from the .feature files into .features-gen/.
// `steps` must include fixtures/ so bddgen can find the extended `test` object;
// without it, generation fails with "Can't guess test instance".
const saucedemoTestDir = defineBddConfig({
  features: './features/saucedemo/**/*.feature',
  steps: ['./steps/saucedemo/**/*.ts', './fixtures/**/*.ts'],
  outputDir: '.features-gen/saucedemo',
});

const toolshopTestDir = defineBddConfig({
  features: './features/toolshop/**/*.feature',
  steps: ['./steps/toolshop/**/*.ts', './fixtures/**/*.ts'],
  outputDir: '.features-gen/toolshop',
});


export default defineConfig({
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',    // Recorded for every test, kept only for failures.
    testIdAttribute: "data-test"   // Both apps mark elements with data-test, not the default data-testid.
  },
  projects: [
    {
    // Plain @playwright/test specs.
    name: 'pure-playwright',
    testDir: './tests',
    use: {...devices['Desktop Chrome']}
    },
    {
    // Specs generated from features/ — not the .feature files themselves.
    name: 'bdd-playwright',
    testDir: saucedemoTestDir,
    use: {...devices['Desktop Chrome']}
    },
    {
    name: 'toolshop-bdd',
    testDir: toolshopTestDir,
    use: {...devices['Desktop Chrome'], baseURL: 'https://practicesoftwaretesting.com'}
    }
  ],
  // `list` keeps terminal output; `open: 'never'` stops the report stealing
  // focus after every run (view it with `npx playwright show-report`).
  reporter: [['list'], ['html', {open: 'never'}]],
});