import { chromium } from "../../../../packages/app/node_modules/@playwright/test/index.mjs"
import path from "node:path"

const worktree = path.resolve(import.meta.dir, "../../../..")
const fixture = path.join(import.meta.dir, "c6-business-smoke.ts")
const uiURL = "http://127.0.0.1:4451/server/aHR0cDovLzEyNy4wLjAuMTo0MTUx/session/ses_da40_011_smoke_s2"
const draft = "C6 draft must remain intact"

function transition(state: "divergent" | "pending" | "resume") {
  const result = Bun.spawnSync(["bun", fixture, state], { cwd: worktree })
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString().trim() || `fixture transition ${state} failed`)
  }
}

const browser = await chromium.launch({ channel: "chrome", headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const postAttempts: string[] = []

await page.route("**/*", async (route) => {
  if (route.request().method() === "POST") {
    postAttempts.push(route.request().url())
    await route.abort("blockedbyclient")
    return
  }
  await route.continue()
})

try {
  transition("divergent")
  await page.goto(uiURL)
  await page.getByText("Active task context diverges", { exact: true }).waitFor()

  const prompt = page.getByRole("textbox", { name: "Invite" })
  await prompt.fill(draft)
  await page.getByRole("button", { name: "Envoyer" }).click()
  await page.waitForTimeout(100)
  const afterDivergent = await prompt.textContent()

  transition("pending")
  await page.getByRole("button", { name: "Refresh context" }).click()
  await page.getByText("Active task context requires recovery", { exact: true }).waitFor()
  await page.getByRole("button", { name: "Envoyer" }).click()
  await page.waitForTimeout(100)
  const afterPending = await prompt.textContent()

  if (postAttempts.length !== 0) throw new Error(`unexpected POST attempts: ${postAttempts.join(", ")}`)
  if (afterDivergent !== draft) throw new Error(`divergent draft changed: ${JSON.stringify(afterDivergent)}`)
  if (afterPending !== draft) throw new Error(`pending draft changed: ${JSON.stringify(afterPending)}`)

  transition("resume")
  await page.getByRole("button", { name: "Refresh context" }).click()
  await page.getByText("Active task context matches", { exact: true }).waitFor()

  console.log(
    JSON.stringify(
      {
        states: ["divergent", "resuming", "concordant"],
        postAttempts,
        draft: { expected: draft, afterDivergent, afterPending },
        finalOwner: await page.getByText("c6-smoke-resumed", { exact: true }).textContent(),
        finalGeneration: await page.getByText("2", { exact: true }).first().textContent(),
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
