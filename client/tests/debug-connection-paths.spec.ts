/**
 * @file debug-connection-paths.spec.ts
 * @description Simple test to verify debug logging and connection path calculations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-13
 */

import { test, expect } from '@playwright/test'

test('debug connection path calculations', async ({ page }) => {
  // Enable console logging
  const consoleMessages: string[] = []
  page.on('console', (msg) => {
    if (
      msg.type() === 'debug' ||
      msg.text().includes('🔗') ||
      msg.text().includes('📍') ||
      msg.text().includes('🛤️')
    ) {
      consoleMessages.push(msg.text())
    }
  })

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Set a specific viewport size
  await page.setViewportSize({ width: 1280, height: 900 })

  // Wait for layout to render
  await page.waitForSelector('[data-testid="controlled-flow-layout"]', {
    state: 'visible',
    timeout: 10000,
  })

  // Wait for traces to render
  await page.waitForSelector('[data-testid="trace-drawer"]', { state: 'visible' })

  // Trigger a resize to force path recalculation and generate debug output
  await page.setViewportSize({ width: 800, height: 600 })
  await page.waitForTimeout(600) // Wait for debounce

  // Get trace information
  const traceInfo = await page.evaluate(() => {
    const traces = Array.from(document.querySelectorAll('.circuit-trace'))
    const panels = Array.from(document.querySelectorAll('.circuit-board-panel'))
    const solderPoints = Array.from(document.querySelectorAll('.circuit-solder-point'))

    return {
      traceCount: traces.length,
      panelCount: panels.length,
      solderPointCount: solderPoints.length,
      collisionTraces: traces.filter((t) => t.classList.contains('collision')).length,
      tracePaths: traces.map((t) => t.getAttribute('d')),
    }
  })

  console.log('Console messages captured:', consoleMessages.length)
  console.log('Sample debug messages:', consoleMessages.slice(0, 5))
  console.log('Trace info:', traceInfo)

  // Basic assertions
  expect(traceInfo.traceCount, 'Should have traces').toBeGreaterThan(0)
  expect(traceInfo.panelCount, 'Should have panels').toBeGreaterThan(0)
  expect(traceInfo.solderPointCount, 'Should have solder points').toBeGreaterThan(0)

  // Log results for manual inspection
  console.log(
    `Found ${traceInfo.traceCount} traces, ${traceInfo.panelCount} panels, ${traceInfo.solderPointCount} solder points`,
  )
  console.log(`Collision traces: ${traceInfo.collisionTraces}`)
})
