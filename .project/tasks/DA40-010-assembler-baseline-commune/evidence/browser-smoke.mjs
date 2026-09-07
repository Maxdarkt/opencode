import { chromium, expect } from "../../../../packages/app/node_modules/@playwright/test/index.mjs"
import { existsSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const root = "/Users/leanbot/Documents/40_Daidalon/features/50-integration"
const evidence = `${root}/.project/tasks/DA40-010-assembler-baseline-commune/evidence`
const empty = mkdtempSync(join(tmpdir(), "da40-010-browser-"))
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Users/leanbot/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
})
const page = await browser.newPage()
page.setDefaultTimeout(60_000)
const requests = []
const errors = []
page.on("request", (request) => {
  if (request.url().includes(":4150")) requests.push({ method: request.method(), url: request.url() })
})
page.on("pageerror", (error) => errors.push(error.message))

try {
  expect(existsSync(`${empty}/.git`)).toBe(false)
  await page.goto("http://127.0.0.1:4450", { waitUntil: "domcontentloaded" })
  const add = page.locator('[data-action="home-add-project-row"]')
  await expect(add).toBeEnabled()
  await add.click()
  const dialog = page.getByRole("dialog")
  const input = dialog.getByRole("combobox")
  const confirm = dialog.getByRole("button", { name: /^(Select folder|Sélectionner le dossier)$/ })
  await input.fill(empty)
  await input.press("Enter")
  await expect(confirm).toBeEnabled()
  await expect(dialog.locator('[data-component="project-context"]')).toContainText(empty)
  await input.fill(`${empty}/missing`)
  await expect(confirm).toBeDisabled()
  await input.press("Enter")
  await expect(dialog).toContainText(/Folder is missing|Le dossier est introuvable/)
  await expect(confirm).toBeDisabled()
  await dialog.getByRole("button", { name: /^(Cancel|Annuler)$/ }).click()
  await expect(dialog).toBeHidden()
  expect(existsSync(`${empty}/.git`)).toBe(false)

  await add.click()
  await input.fill(root)
  await input.press("Enter")
  await expect(confirm).toBeEnabled()
  await confirm.click()
  await expect(dialog).toBeHidden()
  const panel = page.locator('[data-component="project-context"]')
  await expect(panel).toContainText(/Folder is available|Dossier disponible/)
  await expect(panel).toContainText(root)
  await panel.getByText(/Project context details|Détails du contexte projet/, { exact: true }).click()
  await expect(panel).toContainText("baseline-integration")
  await page.getByLabel(/Base reference|Référence de base/).fill("HEAD")
  await page.getByRole("button", { name: /Refresh context|Actualiser le contexte/, exact: true }).click()
  await expect(panel).toContainText(/Base resolved|Base résolue/)
  await expect(panel).toContainText("702bf7dcd7468638c17fd95b110deb38bd253e9a")
  expect(existsSync(`${empty}/.git`)).toBe(false)
  expect(requests.filter((request) => request.method === "POST" && /project.*git/.test(request.url))).toEqual([])
  expect(errors).toEqual([])
  writeFileSync(
    `${evidence}/browser-smoke.json`,
    JSON.stringify(
      {
        pass: true,
        url: page.url(),
        candidate: root,
        fixture: empty,
        no_dot_git: true,
        requests,
        pageerrors: errors,
      },
      null,
      2,
    ),
  )
  console.log("PASS: absent/cancel/open/context/branch/HEAD/base; no initGit or page error")
} catch (error) {
  writeFileSync(`${evidence}/browser-smoke-failure.txt`, await page.locator("body").innerText())
  throw error
} finally {
  await browser.close()
}
