import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const browser = await chromium.launch({
  headless: true,
  args: ['--ignore-certificate-errors']
});
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();

// Login
await page.goto('https://rdglobaldx.com/rdstp_app_prd_qa/#/login');
await page.getByPlaceholder('example.email@gmail.com').fill('diego.rodriguez@tbtbglobal.com');
await page.getByPlaceholder('Enter at least 8+ characters').fill('@Diego123');
await page.getByRole('button', { name: 'Log in' }).click();
await page.waitForURL('**/home');
console.log('Logged in');

// Navigate to samples
await page.goto('https://rdglobaldx.com/rdstp_app_prd_qa/#/samples');
await page.waitForSelector('button:text("View TRF")', { timeout: 10000 });
console.log('Samples loaded');

// Wait for PDF response
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View TRF'));
    btn?.click();
  })
]);

await newPage.waitForLoadState('networkidle').catch(() => {});
console.log('New page URL:', newPage.url());

// Try to get the blob URL content
const pdfData = await newPage.evaluate(async () => {
  const url = location.href;
  const response = await fetch(url);
  const buf = await response.arrayBuffer();
  return Array.from(new Uint8Array(buf));
});

writeFileSync('D:/qa-prdtest/evidencia/exploratorio/trf-downloaded.pdf', Buffer.from(pdfData));
console.log('PDF saved, size:', pdfData.length);

await browser.close();
