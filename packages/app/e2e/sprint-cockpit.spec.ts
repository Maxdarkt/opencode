import { expect, test, type Page } from "@playwright/test"

async function openCockpit(page: Page) {
  await page.goto("/sprint/cockpit", { waitUntil: "domcontentloaded" })
  await expect(page.getByText("DA40-015-A").first()).toBeVisible()
  await expect(page.getByText("DA40-015-B").first()).toBeVisible()
  await page.getByRole("button", { name: "Commit" }).first().click()
  await expect(page.getByRole("dialog")).toContainText("will not run")
  await page.getByRole("button", { name: "Acknowledge simulation" }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
}

test.describe("Sprint cockpit smoke", () => {
  test("1440x900 keeps A/B readable and Commit inert", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openCockpit(page)
  })

  test("1024x768 keeps the compact rail usable", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await openCockpit(page)
  })
})
