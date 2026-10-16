import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests', testMatch:'rsvp.e2e.js', workers:1, timeout:60000,
  use:{ baseURL:'http://127.0.0.1:4173', headless:true, screenshot:'only-on-failure', trace:'retain-on-failure' },
  webServer:{ command:'npm run serve', url:'http://127.0.0.1:4173', reuseExistingServer:true },
});
