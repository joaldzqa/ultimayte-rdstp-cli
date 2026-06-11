/**
 * create-profiles.mjs — Crea todos los storage states de los perfiles
 * Uso: node helpers/create-profiles.mjs
 */
import { chromium } from 'file:///C:/Users/JoséDíaz/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';

const APP_URL = 'https://rdglobaldx.com/rdstp_app_prd_qa';
const CONNECT_URL = 'https://rdglobaldx.com/rdstp_connect_prd_qa';
const PROFILES_DIR = '.playwright/profiles';

mkdirSync(PROFILES_DIR, { recursive: true });

const profiles = [
  // App TpT
  { name: 'hcp-venezuela',     url: APP_URL,     email: 'diego.rodriguez@tbtbglobal.com',    password: '@Diego123' },
  { name: 'hcp-venezuela-alt', url: APP_URL,     email: 'anderson.garcia@yopmail.com',       password: '@Usuario123' },
  { name: 'hcp-brasil',        url: APP_URL,     email: 'testbrazilqa@yopmail.com',           password: 'Test@1234' },
  { name: 'hcp-usa',           url: APP_URL,     email: 'testlabcorpqa@yopmail.com',          password: 'Test@1234' },
  { name: 'hcp-gulf',          url: APP_URL,     email: 'gulfhcpqa@yopmail.com',              password: 'Gulf@1234' },
  { name: 'hi-venezuela',      url: APP_URL,     email: 'anderson.garcia.hi@yopmail.com',     password: '@Usuario123' },
  { name: 'hi-japan',          url: APP_URL,     email: 'hijapansebas@yopmail.com',           password: '@Usuario123' },
  { name: 'psc-humania',       url: APP_URL,     email: 'qahumania@yopmail.com',              password: '@Usuario123' },
  // Connect AZ
  { name: 'control-tower',     url: CONNECT_URL, email: 'qa.connectprd@yopmail.com',          password: '@ConnectPrd1' },
  { name: 'admin-tbtb',        url: CONNECT_URL, email: 'anderson.garcia@tbtbglobal.com',     password: '@Usuario1234' },
  { name: 'labcorp',           url: CONNECT_URL, email: 'labcorp@yopmail.com',                password: 'Admin123@' },
  { name: 'humania',           url: CONNECT_URL, email: 'qahumania@yopmail.com',              password: '@Usuario123' },
];

const results = { ok: [], fail: [] };

for (const p of profiles) {
  console.log(`\n→ [${p.name}] ${p.email}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });

    // Llenar email y password
    await page.getByRole('textbox', { name: /email/i }).fill(p.email);
    await page.getByRole('textbox', { name: /password|characters/i }).fill(p.password);
    await page.getByRole('button', { name: /log in|iniciar/i }).click();

    // Esperar navegación fuera del login
    await page.waitForURL(url => !url.includes('/login'), { timeout: 15000 });

    const statePath = join(PROFILES_DIR, `${p.name}.json`);
    await context.storageState({ path: statePath });
    console.log(`  ✅ OK → ${statePath}`);
    results.ok.push(p.name);
  } catch (err) {
    console.log(`  ❌ FAIL: ${err.message.split('\n')[0]}`);
    results.fail.push({ name: p.name, email: p.email, error: err.message.split('\n')[0] });
  } finally {
    await browser.close();
  }
}

console.log('\n========================================');
console.log(`✅ Creados: ${results.ok.length} perfiles`);
if (results.ok.length) console.log('  ' + results.ok.join(', '));
if (results.fail.length) {
  console.log(`❌ Fallidos: ${results.fail.length}`);
  results.fail.forEach(f => console.log(`  - ${f.name} (${f.email}): ${f.error}`));
}
