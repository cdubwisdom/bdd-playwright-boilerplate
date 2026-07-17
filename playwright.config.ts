import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on'
  },
  projects: [{
    name: 'chromium',
    use: {...devices['Desktop Chrome']}
    }]
});