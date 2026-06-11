async page => {
  // Close any open calendar first
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // Click directly on the start date input
  const startInput = await page.$('input[placeholder*="start date"]');
  if (!startInput) return 'start input not found';

  const rect = await startInput.boundingBox();
  await page.mouse.click(rect.x + 10, rect.y + rect.height / 2);
  await page.waitForTimeout(300);

  // Type the date (PrimeNG masked input)
  await page.keyboard.type('01152024');
  await page.waitForTimeout(500);

  const val = await page.evaluate(() =>
    document.querySelector('input[placeholder*="start date"]')?.value || ''
  );
  return 'start value: "' + val + '"';
}
