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

test('app shell loads with title and corpus header', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Motif Atlas')).toBeVisible()
  await expect(page.locator('header')).toContainText(/5,?\d{3}/)
})

test('keyword search finds results', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Keyword' }).click()
  const input = page.locator('main input').first()
  await input.fill('trickster')
  await input.press('Enter')
  await expect(page.getByText(/results/).first()).toBeVisible({ timeout: 15000 })
})

test('every view opens without crashing', async ({ page }) => {
  await page.goto('/')
  for (const name of ['Compare', 'Database', 'Map', 'Network', 'Embedding Map', 'Notebook', 'Character Chat']) {
    await page.locator('nav').getByText(name, { exact: true }).click()
    await expect(page.locator('main')).toBeVisible()
    await page.waitForTimeout(1000)
  }
})

test('database lists the frozen corpus scale', async ({ page }) => {
  await page.goto('/')
  await page.locator('nav').getByText('Database', { exact: true }).click()
  await expect(page.locator('main')).toContainText(/5,?\d{3}/, { timeout: 15000 })
})

test('character chat replies via the mock fallback when the API is unavailable', async ({ page }) => {
  await page.goto('/')
  await page.locator('nav').getByText('Character Chat', { exact: true }).click()
  await page.route('**/api/chat', (r) => {
    page.__blockApi = true
    r.abort()
  })
  const input = page.locator('main input').last()
  await input.fill('How did the world begin?')
  await input.press('Enter')
  // The empty-state placeholder must disappear once a reply arrives.
  await expect(page.locator('main').getByText(/No conversation/i)).toBeHidden({ timeout: 20000 })
})
