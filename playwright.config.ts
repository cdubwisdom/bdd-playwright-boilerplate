import {defineConfig, devices} from '@playwright/test';
import {defineBddConfig} from 'playwright-bdd';

const bddTestDir = defineBddConfig({
  features: './features/**/*.feature',
  steps: './steps/**/*.ts',
});


export default defineConfig({
  timeout: 30 * 1000,
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on'
  },
  projects: [
    {
    name: 'pure-playwright',
    testDir: './tests',
    use: {...devices['Desktop Chrome']}
    },
    {
    name: 'bdd-playwright',
    testDir: bddTestDir,
    use: {...devices['Desktop Chrome']}
    }
  ]
});