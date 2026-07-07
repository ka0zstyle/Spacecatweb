import { test, expect } from "@playwright/test"

const SECTIONS = ["payment", "about", "services", "portfolio", "pricing", "blog", "contact"] as const

test.describe("Scrollytelling centering diagnostic", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("uwf_lang_selected", "true")
    })
    test.setTimeout(120000)
  })

  test("desktop 1440: cada frame centrado horizontalmente", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1500)

    const reports: {
      section: string
      step: number
      frameLeft: number
      frameWidth: number
      horizOffsetPct: number
      verdict: string
    }[] = []

    for (const id of SECTIONS) {
      const section = page.locator(`#${id}`)
      if (!(await section.count())) continue
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)

      const frames = await section.locator(".scrolly-frame").all()
      if (frames.length === 0) {
        reports.push({ section: id, step: -1, frameLeft: 0, frameWidth: 0, horizOffsetPct: 0, verdict: "no-frames" })
        continue
      }

      for (let i = 0; i < frames.length; i++) {
        const box = await frames[i].boundingBox()
        if (!box) {
          reports.push({ section: id, step: i, frameLeft: 0, frameWidth: 0, horizOffsetPct: 0, verdict: "no-box" })
          continue
        }
        const horizOffsetPct = +((box.x / 1440) * 100).toFixed(2)
        const verdict = Math.abs(horizOffsetPct) > 10 ? "off-center" : box.width === 0 ? "zero-width" : "centered"
        reports.push({
          section: id,
          step: i,
          frameLeft: Math.round(box.x),
          frameWidth: Math.round(box.width),
          horizOffsetPct,
          verdict,
        })
      }
    }

    console.log("\n=== SCROLLY CENTERING REPORT (desktop 1440) ===\n" + JSON.stringify(reports, null, 2))

    const broken = reports.filter((r) => r.verdict !== "centered")
    expect(broken, "Frames with centering issues:\n" + JSON.stringify(broken, null, 2)).toHaveLength(0)
  })

  test("desktop 1440: capturas de cada seccion scrolly", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1500)

    for (const id of SECTIONS) {
      const section = page.locator(`#${id}`)
      if (!(await section.count())) continue
      await section.evaluate((el) => el.scrollIntoView({ block: "start" }))
      await page.waitForTimeout(900)
      await page.screenshot({
        path: `test-results/scrolly-${id}-1.png`,
        animations: "disabled",
      })

      const y = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
      await page.evaluate((top) => window.scrollTo(0, top + 600), y)
      await page.waitForTimeout(900)
      await page.screenshot({
        path: `test-results/scrolly-${id}-2.png`,
        animations: "disabled",
      })

      await page.evaluate((top) => window.scrollTo(0, top + 1200), y)
      await page.waitForTimeout(900)
      await page.screenshot({
        path: `test-results/scrolly-${id}-3.png`,
        animations: "disabled",
      })
    }
    expect(true).toBe(true)
  })

  test("mobile 375: capturas de cada seccion scrolly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1500)

    for (const id of SECTIONS) {
      const section = page.locator(`#${id}`)
      if (!(await section.count())) continue
      await section.evaluate((el) => el.scrollIntoView({ block: "start" }))
      await page.waitForTimeout(700)
      await page.screenshot({
        path: `test-results/scrolly-${id}-m1.png`,
        animations: "disabled",
        fullPage: false,
      })

      const y = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
      await page.evaluate((top) => window.scrollTo(0, top + 400), y)
      await page.waitForTimeout(700)
      await page.screenshot({
        path: `test-results/scrolly-${id}-m2.png`,
        animations: "disabled",
        fullPage: false,
      })
    }
    expect(true).toBe(true)
  })
})