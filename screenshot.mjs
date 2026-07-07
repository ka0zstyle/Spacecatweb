// @ts-check
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Accept cookies
  const acceptBtn = page.locator('button:has-text("Aceptar")');
  if (await acceptBtn.count() > 0) {
    await acceptBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Wait for hero animations to settle
  await page.waitForTimeout(8000);
  
  await page.screenshot({ path: 'C:\\Users\\kaoz-\\AppData\\Local\\Temp\\opencode\\hero-final.png', fullPage: false });
  await browser.close();
})();
