import { chromium } from "playwright";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const acceptBtn = page.locator("button:has-text('Aceptar')");
  if (await acceptBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await acceptBtn.click();
  }
  await page.waitForTimeout(8000);
  await page.screenshot({ path: "C:\\Users\\kaoz-\\AppData\\Local\\Temp\\opencode\\cat-view2.png", fullPage: false });
  console.log("Screenshot saved");
  await browser.close();
})();
