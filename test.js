const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:8081');
  
  // Click admin login
  await page.click('#tab-btn-admin');
  
  // wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // click login
  await page.click('#login-form button[type=submit]');
  await new Promise(r => setTimeout(r, 1000));
  
  await browser.close();
})();
