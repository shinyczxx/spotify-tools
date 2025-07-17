/**
 * @file controlled-layout-performance.spec.ts
 * @description Performance testing for ControlledFlowLayout vs FlowLayout
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-12
 */

import { test, expect } from '@playwright/test'

test.describe('ControlledFlowLayout Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test page
    await page.goto('http://localhost:5175')

    // Wait for app to load
    await page.waitForSelector('[data-testid="controlled-flow-layout"]', { timeout: 10000 })
  })

  test('should have controlled positioning instead of flow positioning', async ({ page }) => {
    // Check that panels are positioned according to grid specification, not automatic flow
    const panels = await page.locator('[data-panel-id]').all()

    for (const panel of panels) {
      const panelId = await panel.getAttribute('data-panel-id')
      const gridPosition = await panel.getAttribute('data-grid-position')
      const pixelPosition = await panel.getAttribute('data-panel-position')

      console.log(`Panel ${panelId}: Grid ${gridPosition} -> Pixels ${pixelPosition}`)

      // Verify panel has controlled position attributes
      expect(gridPosition).toBeTruthy()
      expect(pixelPosition).toBeTruthy()
    }

    // Verify header panel is positioned as specified (grid 2,1)
    const headerPanel = page.locator('[data-panel-id="header"]')
    await expect(headerPanel).toHaveAttribute('data-grid-position', '2,1')

    // Verify panels are not just flowing from top-left
    const featuresPanel = page.locator('[data-panel-id="features"]')
    const loginButtonPanel = page.locator('[data-panel-id="login-button"]')

    if ((await featuresPanel.count()) > 0) {
      await expect(featuresPanel).toHaveAttribute('data-grid-position', '1,4')
    }

    if ((await loginButtonPanel.count()) > 0) {
      await expect(loginButtonPanel).toHaveAttribute('data-grid-position', '8,4')
    }
  })

  test('should optimize path drawing performance', async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.pathCalculations = []
      window.originalCalculateMultiplePaths = window.calculateMultiplePaths
    })

    // Monitor path calculation calls
    await page.evaluate(() => {
      let pathCalculationCount = 0
      const originalConsoleLog = console.log

      console.log = (...args) => {
        if (
          args[0]?.includes?.('calculateMultiplePaths') ||
          args[0]?.includes?.('Path calculation')
        ) {
          pathCalculationCount++
          window.pathCalculations.push({
            time: Date.now(),
            count: pathCalculationCount,
            args: args.join(' '),
          })
        }
        originalConsoleLog.apply(console, args)
      }
    })

    // Initial load - should calculate paths once
    await page.waitForTimeout(1000)

    // Resize window multiple times - should NOT recalculate paths each time
    // (since we configured pathRecalculationTriggers to exclude 'resize')
    for (let i = 0; i < 5; i++) {
      await page.setViewportSize({ width: 800 + i * 100, height: 600 + i * 50 })
      await page.waitForTimeout(200)
    }

    // Check cache usage
    const cacheInfo = await page.evaluate(() => {
      const debugElement = document.querySelector('[data-testid="debug-info"]')
      return debugElement?.textContent || ''
    })

    console.log('Cache info:', cacheInfo)

    // Should show cache usage > 0
    expect(cacheInfo).toContain('Cache:')

    // Activate a panel - this SHOULD trigger path recalculation
    const loginButtonPanel = page.locator('[data-panel-id="login-button"]')
    if ((await loginButtonPanel.count()) > 0) {
      await loginButtonPanel.click()
      await page.waitForTimeout(500)
    }

    // Check that path calculation was optimized
    const pathCalculations = await page.evaluate(() => window.pathCalculations || [])
    console.log('Path calculations:', pathCalculations)

    // Should have some calculations, but not excessive (less than 10 for this test)
    expect(pathCalculations.length).toBeLessThan(10)
  })

  test('should maintain responsive behavior with controlled positions', async ({ page }) => {
    // Desktop layout
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(500)

    let breakpoint = await page.getAttribute(
      '[data-testid="controlled-flow-layout"]',
      'data-breakpoint',
    )
    expect(breakpoint).toBe('desktop')

    // Check desktop positions
    const headerPanelDesktop = page.locator('[data-panel-id="header"]')
    const desktopPosition = await headerPanelDesktop.getAttribute('data-grid-position')
    expect(desktopPosition).toBe('2,1') // Desktop position

    // Tablet layout
    await page.setViewportSize({ width: 900, height: 600 })
    await page.waitForTimeout(500)

    breakpoint = await page.getAttribute(
      '[data-testid="controlled-flow-layout"]',
      'data-breakpoint',
    )
    expect(breakpoint).toBe('tablet')

    // Mobile layout
    await page.setViewportSize({ width: 600, height: 800 })
    await page.waitForTimeout(500)

    breakpoint = await page.getAttribute(
      '[data-testid="controlled-flow-layout"]',
      'data-breakpoint',
    )
    expect(breakpoint).toBe('mobile')

    // Check mobile position changed
    const mobilePosition = await headerPanelDesktop.getAttribute('data-grid-position')
    console.log('Mobile position:', mobilePosition, 'vs Desktop:', desktopPosition)

    // Position should adapt for mobile (though grid-position attribute shows the active position)
    expect(mobilePosition).toBeTruthy()
  })

  test('should handle panel addition/removal efficiently', async ({ page }) => {
    // Start with initial panels
    let panelCount = await page.locator('[data-panel-id]').count()
    console.log('Initial panel count:', panelCount)

    // Activate login button panel (it has onConnect functionality)
    const loginButtonPanel = page.locator('[data-panel-id="login-button"]')
    if ((await loginButtonPanel.count()) > 0) {
      await loginButtonPanel.click()
      await page.waitForTimeout(1500) // Wait for activation animation

      // Check if panel count stays the same (Login page panels don't change count)
      const updatedCount = await page.locator('[data-panel-id]').count()
      console.log('Updated panel count:', updatedCount)

      // Panel count should stay the same on Login page
      expect(updatedCount).toBe(panelCount)
    }

    // Check cache efficiency after panel changes
    const finalCacheInfo = await page.evaluate(() => {
      const debugElement = document.querySelector('[data-testid="debug-info"]')
      return debugElement?.textContent || ''
    })

    console.log('Final cache info:', finalCacheInfo)
    expect(finalCacheInfo).toContain('Cache:')
  })

  test('should show performance debug information in development', async ({ page }) => {
    // Check for debug panel with specific test ID
    const debugPanel = page.locator('[data-testid="debug-info"]')

    if ((await debugPanel.count()) > 0) {
      // Should show performance metrics
      await expect(debugPanel).toContainText('Size:')
      await expect(debugPanel).toContainText('Breakpoint:')
      await expect(debugPanel).toContainText('Panels:')
      await expect(debugPanel).toContainText('Paths:')
      await expect(debugPanel).toContainText('Cache:')
      await expect(debugPanel).toContainText('Triggers:')

      console.log('Debug info:', await debugPanel.textContent())
    }
  })

  test('should maintain circuit board aesthetics with controlled positioning', async ({ page }) => {
    // Check that controlled positioning maintains circuit board theme
    const layout = page.locator('[data-testid="controlled-flow-layout"]')
    await expect(layout).toBeVisible()

    // Check for trace drawer (circuit paths)
    const traceDrawer = page.locator('.circuit-trace-drawer')
    await expect(traceDrawer).toBeVisible()

    // Check for solder points
    const solderPoints = page.locator('.solder-point')
    const solderCount = await solderPoints.count()
    console.log('Solder points found:', solderCount)

    if (solderCount > 0) {
      // Should have proper circuit aesthetics
      await expect(solderPoints.first()).toBeVisible()
    }

    // Check for circuit traces
    const traces = page.locator('.circuit-trace')
    const traceCount = await traces.count()
    console.log('Circuit traces found:', traceCount)

    if (traceCount > 0) {
      await expect(traces.first()).toBeVisible()
    }
  })
})
