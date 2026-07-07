# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-test.spec.ts >> Chat bubble interactivo
- Location: e2e\chat-test.spec.ts:3:5

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('button[aria-label="Abrir chat"]')
    - locator resolved to <button aria-label="Abrir chat" class="flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 bg-sc-primary text-white hover:bg-sc-primary-light hover:scale-110 shadow-sc-primary/30">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    242 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Test source

```ts
  1  | import { test } from "@playwright/test"
  2  | 
  3  | test("Chat bubble interactivo", async ({ page }) => {
  4  |   test.setTimeout(300000)
  5  | 
  6  |   await page.goto("http://localhost:3000", { waitUntil: "networkidle" })
  7  | 
  8  |   // Esperar que cargue el splash
  9  |   const espanol = page.locator("button:has-text('Español'), div:has-text('Español')").first()
  10 |   if (await espanol.isVisible({ timeout: 5000 }).catch(() => false)) {
  11 |     await espanol.click()
  12 |     // Aceptar política de privacidad
  13 |     const accept = page.locator("button:has-text('Aceptar')")
  14 |     if (await accept.isVisible({ timeout: 3000 }).catch(() => false)) {
  15 |       await accept.click()
  16 |     }
  17 |   }
  18 | 
  19 |   await page.waitForTimeout(3000)
  20 | 
  21 |   // Click chat button
  22 |   const chatButton = page.locator('button[aria-label="Abrir chat"]')
  23 |   await chatButton.waitFor({ state: "visible", timeout: 10000 })
> 24 |   await chatButton.click()
     |                    ^ Error: locator.click: Target page, context or browser has been closed
  25 | 
  26 |   await page.waitForTimeout(500)
  27 | 
  28 |   await page.pause()
  29 | })
  30 | 
```