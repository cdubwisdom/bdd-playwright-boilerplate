import {defineConfig, devices} from '@playwright/test';
import {defineBddConfig} from 'playwright-bdd';

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
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    testIdAttribute: "data-test"
  },
  projects: [
    {
    name: 'pure-playwright',
    testDir: './tests',
    use: {...devices['Desktop Chrome']}
    },
    {
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
  reporter: [['list'], ['html', {open: 'never'}]],
});