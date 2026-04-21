const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Capture all console output
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request => console.log('BROWSER_FAIL_REQ:', request.url(), request.failure().errorText));

  // Navigate to Vite dev server
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 }).catch(e => console.log('Nav Error:', e.message));

  // Wait a bit to let React hydrate and crash if it wants to
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
})();
