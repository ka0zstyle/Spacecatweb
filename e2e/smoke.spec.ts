import { test, expect } from "@playwright/test"

test.describe("SpaceCatWeb smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("uwf_lang_selected", "true")
    })
  })

  test("homepage loads and renders key elements", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveTitle(/SpaceCatWeb/)

    const headingCount = await page.locator("h2").count()
    expect(headingCount).toBeGreaterThanOrEqual(5)

    await expect(page.locator("#home")).toBeVisible()
    await expect(page.locator("#about")).toBeVisible()
    await expect(page.locator("#services")).toBeVisible()
    await expect(page.locator("#portfolio")).toBeVisible()
    await expect(page.locator("#pricing")).toBeVisible()
    await expect(page.locator("#blog")).toBeVisible()
    await expect(page.locator("#contact")).toBeVisible()
  })

  test("language switcher toggles to English", async ({ page }) => {
    await page.goto("/?lang=en")
    await expect(page.locator("text=Web Design")).toBeVisible()

    await page.goto("/")
    await expect(page.locator("text=Diseño Web")).toBeVisible()
  })

  test("header desktop nav scrolls to section", async ({ page }) => {
    await page.goto("/")

    const desktopNav = page.locator("header nav.hidden")
    await expect(desktopNav.locator("button").last()).toBeVisible()
    await desktopNav.locator("button").last().click()
    await expect(page.locator("#contact")).toBeVisible()
  })

  test("contact form submits", async ({ page }) => {
    await page.goto("/")

    await page.locator("#contact-name").fill("Test User")
    await page.locator("#contact-email").fill("test@example.com")
    await page.locator("#contact-country").selectOption("US")
    await page.locator("#contact-whatsapp").fill("+1234567890")
    await page.locator("#contact-message").fill("This is a test message.")
    await page.locator("#contact button[type=submit]").click()

    await expect(page.locator("text=Message sent successfully!")).toBeVisible({ timeout: 5000 })
  })

  test("chat bubble opens and closes", async ({ page }) => {
    await page.goto("/")

    await page.evaluate(() => {
      const portal = document.querySelector("nextjs-portal")
      if (portal) portal.remove()
      const btn = document.querySelector("button[aria-label='Chat']") as HTMLButtonElement
      if (btn) btn.click()
    })
    await expect(page.locator("text=Chat SpaceCatWeb")).toBeVisible({ timeout: 3000 })

    await page.evaluate(() => {
      const btn = document.querySelector("button[aria-label='Chat']") as HTMLButtonElement
      if (btn) btn.click()
    })
  })

  test("scroll-to-top button appears after scrolling", async ({ page }) => {
    await page.goto("/")

    const scrollButton = page.locator("button[aria-label='Scroll to top']")
    await expect(scrollButton).toHaveClass(/opacity-0/)

    await page.evaluate(() => window.scrollTo(0, 1000))
    await page.waitForTimeout(500)
    await expect(scrollButton).toHaveClass(/opacity-100/)

    await scrollButton.click()
    await page.waitForTimeout(500)
    await expect(scrollButton).toHaveClass(/opacity-0/)
  })

  test("all section heading text is visible", async ({ page }) => {
    await page.goto("/")

    const sections = ["about", "services", "portfolio", "pricing", "blog", "contact"]
    for (const id of sections) {
      const section = page.locator(`#${id}`)
      await expect(section).toBeVisible()
      await expect(section.locator("h2")).not.toBeEmpty()
    }
  })
})
