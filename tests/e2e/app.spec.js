import { test, expect } from '@playwright/test'

// Collect hard failures: uncaught page errors and console errors.
// These must be zero — the course requires "0 console errors, 0 broken assets".
test.beforeEach(({ page }) => {
  page.__errors = []
  page.on('pageerror', (e) => page.__errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') page.__errors.push(`console: ${m.text().slice(0, 200)}`)
  })
})

test.afterEach(({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) return
  const noise = page.__blockApi ? ['net::ERR_FAILED'] : []
  expect(
    page.__errors.filter((e) => !noise.some((n) => e.includes(n))),
    `${testInfo.title}: no errors on this path`
  ).toEqual([])
})

// The corpus is fetched lazily on first visit; a cold load can take a while,
// so navigation assertions get generous timeouts everywhere.
async function openApp(page) {
  await page.goto('/')
  await expect(page.locator('nav')).toBeVisible({ timeout: 60000 })
}

test('app shell loads with title and corpus header', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Motif Atlas').first()).toBeVisible({ timeout: 60000 })
  await expect(page.locator('header')).toContainText(/5,?\d{3}/, { timeout: 60000 })
})

test('keyword search finds results', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Keyword' }).click()
  const input = page.locator('main input').first()
  await input.fill('trickster')
  await input.press('Enter')
  await expect(page.getByText(/results/).first()).toBeVisible({ timeout: 15000 })
})

// The deterministic reading (understand.js) renders instantly, before the
// semantic model has even loaded — so these assertions never depend on the
// model download or the CDN being reachable.
test('semantic mode shows how the engine read a natural-language request', async ({ page }) => {
  await openApp(page)
  const input = page.locator('main input').first()
  await input.fill('Can you show me flood stories without a boat?')
  await input.press('Enter')
  const panel = page.locator('[data-testid="understanding-panel"]')
  await expect(panel).toBeVisible({ timeout: 15000 })
  // scaffolding stripped, negation honoured
  await expect(panel.getByText('Interpreted as')).toBeVisible()
  await expect(panel.getByText(/flood stories/)).toBeVisible()
  await expect(panel.getByText(/can you show me/i)).toBeVisible()
  await expect(panel.getByText('Deliberately excluded')).toBeVisible()
  await expect(panel.locator('.line-through', { hasText: 'boat' })).toBeVisible()
})

test('compare reads a pasted narrative as story beats before matching', async ({ page }) => {
  await openApp(page)
  await page.locator('nav').getByText('Compare', { exact: true }).click()
  await page
    .locator('main textarea')
    .fill('A great flood drowns the world. One man builds a boat. He survives and founds a new people.')
  await page.locator('main').getByRole('button', { name: 'Compare', exact: true }).click()
  const panel = page.locator('[data-testid="understanding-panel"]')
  await expect(panel).toBeVisible({ timeout: 15000 })
  await expect(panel.getByText('Story beats compared one by one')).toBeVisible()
  await expect(panel.getByText(/^3$/)).toBeVisible()
})

test('every view opens without crashing', async ({ page }) => {
  await openApp(page)
  for (const name of ['Compare', 'Database', 'Map', 'Network', 'Embedding Map', 'Notebook', 'Character Chat']) {
    await page.locator('nav').getByText(name, { exact: true }).click()
    await expect(page.locator('main')).toBeVisible()
    await page.waitForTimeout(1000)
  }
})

test('database lists the frozen corpus scale', async ({ page }) => {
  await openApp(page)
  await page.locator('nav').getByText('Database', { exact: true }).click()
  await expect(page.locator('main')).toContainText(/5,?\d{3}/, { timeout: 20000 })
})

test('character chat replies via the mock fallback when the API is unavailable', async ({ page }) => {
  await openApp(page)
  await page.locator('nav').getByText('Character Chat', { exact: true }).click()
  await page.route('**/api/chat', (r) => {
    page.__blockApi = true
    r.abort()
  })
  const input = page.locator('main input').last()
  await input.fill('How did the world begin?')
  await input.press('Enter')
  // The empty-state placeholder must disappear once a reply arrives.
  await expect(page.locator('main').getByText(/No conversation|Ask the character/i).first()).toBeHidden({ timeout: 20000 })
})

test('first load transfers a small JS payload (corpus is fetched, not bundled)', async ({ page }) => {
  let jsBytes = 0
  page.on('response', async (r) => {
    if (r.request().resourceType() === 'script') {
      try {
        jsBytes += (await r.body()).length
      } catch {
        /* aborted requests don't count */
      }
    }
  })
  await page.goto('/')
  await expect(page.locator('header')).toContainText(/5,?\d{3}/, { timeout: 60000 })
  expect(jsBytes).toBeLessThan(3 * 1024 * 1024)
})

test('network view stays responsive while re-thresholding', async ({ page }) => {
  await openApp(page)
  await page.locator('nav').getByText('Network', { exact: true }).click()
  const slider = page.locator('input[type=range]').first()
  await slider.waitFor({ timeout: 30000 })
  for (const v of ['0.3', '0.45', '0.6', '0.75', '0.4']) {
    await slider.fill(v)
    await page.waitForTimeout(250)
  }
  // the app must still react immediately after all those layout recomputes
  await page.locator('nav').getByText('Notebook', { exact: true }).click()
  await expect(page.locator('main')).toBeVisible()
})

test('database cards offer an explicit full-text open', async ({ page }) => {
  await openApp(page)
  await page.locator('nav').getByText('Database', { exact: true }).click()
  // cards live inside collapsed tradition groups — expand one first
  await page.locator('section button').first().click()
  await page.getByRole('button', { name: /details/i }).first().click()
  await expect(page.getByText(/passages|excerpt/i).first()).toBeVisible({ timeout: 15000 })
})

test('language switch renders Traditional Chinese and persists', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: '繁體中文' }).first().click()
  await expect(page.locator('nav')).toContainText('比較')
  // A translated passage shows the AI-translation badge with a toggle back
  // to the English original (prometheus-fire:1 is translated).
  await page.getByRole('button', { name: '關鍵字' }).click()
  const input = page.locator('main input').first()
  await input.fill('prometheus fire')
  await input.press('Enter')
  await page.getByText(/results|結果/).first().waitFor({ timeout: 20000 })
  await page.locator('main article button, main [role=button]').first().click()
  await expect(page.getByText(/AI 譯文/).first()).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: '查看英文原文' }).click()
  await expect(page.getByText(/Prometheus/i).first()).toBeVisible({ timeout: 10000 })
  await page.reload()
  await expect(page.locator('nav')).toContainText('資料庫', { timeout: 60000 })
  await expect(page.locator('nav')).toContainText('比較')
})
