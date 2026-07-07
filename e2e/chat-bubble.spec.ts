import { test, expect } from "@playwright/test"

test.describe("Chat Bubble", () => {
  test("should open chat bubble, fill form and send message", async ({ page }) => {
    await page.goto("/")

    // Click the chat bubble button (bottom-left)
    const chatButton = page.locator('button[aria-label="Abrir chat"]')
    await expect(chatButton).toBeVisible()
    await chatButton.click()

    // The chat panel should open with the form
    const form = page.locator("form", { hasText: "Ingresa tus datos" })
    await expect(form).toBeVisible()

    // Fill the form
    await page.fill('input[placeholder="Tu nombre"]', "Test User")
    await page.fill('input[placeholder="tu@correo.com"]', "test@example.com")
    await page.fill('input[placeholder="Ej: 999 888 777"]', "999888777")

    // Submit the form
    await page.click('button:has-text("Iniciar Chat")')

    // Wait for chat session to start (form disappears, message area appears)
    await expect(page.locator("text=En qué puedo ayudarte")).toBeVisible({ timeout: 10000 })

    // Type a message
    await page.fill('input[placeholder="Escribe tu mensaje..."]', "Hola, esto es una prueba")

    // Send it
    await page.click('button[aria-label="Enviar"]')

    // The message should appear in the chat
    await expect(page.locator("text=Hola, esto es una prueba")).toBeVisible({ timeout: 5000 })
  })
})
