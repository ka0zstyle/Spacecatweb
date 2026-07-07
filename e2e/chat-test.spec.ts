import { test } from "@playwright/test"

test("Chat bubble interactivo", async ({ page }) => {
  test.setTimeout(300000)

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" })

  // Esperar que cargue el splash
  const espanol = page.locator("button:has-text('Español'), div:has-text('Español')").first()
  if (await espanol.isVisible({ timeout: 5000 }).catch(() => false)) {
    await espanol.click()
    // Aceptar política de privacidad
    const accept = page.locator("button:has-text('Aceptar')")
    if (await accept.isVisible({ timeout: 3000 }).catch(() => false)) {
      await accept.click()
    }
  }

  await page.waitForTimeout(3000)

  // Click chat button
  const chatButton = page.locator('button[aria-label="Abrir chat"]')
  await chatButton.waitFor({ state: "visible", timeout: 10000 })
  await chatButton.click()

  await page.waitForTimeout(500)

  await page.pause()
})
