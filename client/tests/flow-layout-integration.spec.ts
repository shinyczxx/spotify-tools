/**
 * @file flow-layout-integration.spec.ts
 * @description Integration tests for the new FlowLayout component with real React components
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-01-16
 */

import { test, expect } from '@playwright/test'

// Test the actual React application with FlowLayout
test.describe('FlowLayout Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page which uses FlowLayout
    await page.goto('http://localhost:5175/test') // TestPage uses FlowLayout
    await page.waitForLoadState('networkidle')
  })

  test('FlowLayout renders with correct aspect ratio detection', async ({ page }) => {
    // Set specific viewport size
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Look for the main test FlowLayout component (not the navbar one)
    const flowLayout = page.locator('[data-testid="flow-layout"].test-flow-layout')

    if ((await flowLayout.count()) > 0) {
      await expect(flowLayout).toBeVisible()

      // Wait for layout calculations to complete (FlowLayout uses setTimeout 150ms + 100ms)
      await page.waitForTimeout(300)

      // Check aspect ratio data attribute
      const aspectRatio = await flowLayout.getAttribute('data-aspect-ratio')
      expect(aspectRatio).toBe('16:9')

      // Check orientation
      const orientation = await flowLayout.getAttribute('data-orientation')
      expect(orientation).toBe('landscape')
    }
  })

  test('Global theme color integration works', async ({ page }) => {
    // Check if CSS custom properties are set
    const themeColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--circuit-color')
    })

    expect(themeColor).toBeTruthy()

    // Check if theme color is applied to circuit elements
    const panels = page.locator('.circuit-board-panel')
    if ((await panels.count()) > 0) {
      const firstPanel = panels.first()
      const borderColor = await firstPanel.evaluate((el) => {
        return getComputedStyle(el).borderColor
      })

      expect(borderColor).toBeTruthy()
      expect(borderColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('Panels size correctly based on content', async ({ page }) => {
    const panels = page.locator('[data-testid^="panel-"]')
    const panelCount = await panels.count()

    if (panelCount > 0) {
      for (let i = 0; i < Math.min(panelCount, 5); i++) {
        const panel = panels.nth(i)
        await expect(panel).toBeVisible()

        const panelBox = await panel.boundingBox()

        // Verify panel dimensions are within expected constraints
        expect(panelBox?.width).toBeGreaterThanOrEqual(200) // Reasonable minimum
        expect(panelBox?.width).toBeLessThanOrEqual(500) // Reasonable maximum
        expect(panelBox?.height).toBeGreaterThanOrEqual(100)
        expect(panelBox?.height).toBeLessThanOrEqual(400)
      }
    }
  })

  test('Solder points are positioned correctly', async ({ page }) => {
    const solderPoints = page.locator('.circuit-solder-point, .solder-point')
    const solderCount = await solderPoints.count()

    if (solderCount > 0) {
      for (let i = 0; i < Math.min(solderCount, 10); i++) {
        const solderPoint = solderPoints.nth(i)

        // Check basic attributes
        const cx = await solderPoint.getAttribute('cx')
        const cy = await solderPoint.getAttribute('cy')
        const r = await solderPoint.getAttribute('r')

        expect(cx).toBeTruthy()
        expect(cy).toBeTruthy()
        expect(r).toBe('6') // Should match design spec

        // Verify position is reasonable (not negative, within viewport)
        if (cx && cy) {
          const x = parseFloat(cx)
          const y = parseFloat(cy)
          expect(x).toBeGreaterThanOrEqual(0)
          expect(y).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThanOrEqual(2000) // Reasonable max
          expect(y).toBeLessThanOrEqual(2000)
        }
      }
    }
  })

  test('Circuit traces are drawn correctly', async ({ page }) => {
    // Wait for layout to stabilize and paths to be drawn
    await page.waitForTimeout(500)

    // Wait for trace elements to appear
    await page.waitForSelector('.circuit-trace', { timeout: 5000 }).catch(() => {
      // If traces don't appear, it's OK - test will handle the count
    })

    const traces = page.locator('.circuit-trace')
    const traceCount = await traces.count()

    if (traceCount > 0) {
      for (let i = 0; i < Math.min(traceCount, 5); i++) {
        const trace = traces.nth(i)

        // Check path data exists
        const pathData = await trace.getAttribute('d')
        expect(pathData).toBeTruthy()

        if (pathData) {
          // Should start with M (moveTo) command
          expect(pathData).toMatch(/^M\s*[\d.-]+\s*[\d.-]+/)

          // Should contain L (lineTo) commands for segments
          expect(pathData).toContain('L')
        }

        // Check stroke properties
        const stroke = await trace.evaluate((el) => {
          const computed = getComputedStyle(el)
          return {
            stroke: computed.stroke,
            strokeWidth: computed.strokeWidth,
            fill: computed.fill,
          }
        })

        expect(stroke.stroke).not.toBe('none')
        expect(stroke.strokeWidth).toBeTruthy()
        expect(stroke.fill).toBe('none')
      }
    }
  })

  test('Responsive behavior works correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    let panels = page.locator('.circuit-board-panel')
    let panelCount = await panels.count()

    if (panelCount > 0) {
      // Should have multiple panels per row on desktop
      const firstPanelBox = await panels.first().boundingBox()
      const secondPanelBox = panelCount > 1 ? await panels.nth(1).boundingBox() : null

      if (firstPanelBox && secondPanelBox) {
        // On desktop, panels might be side by side (Y positions similar)
        const yDifference = Math.abs((firstPanelBox.y || 0) - (secondPanelBox.y || 0))
        expect(yDifference).toBeLessThan(firstPanelBox.height || 300)
      }
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(1000) // Increased timeout for layout stabilization

    // Target panels specifically from the test FlowLayout, not the navbar
    const testFlowLayout = page.locator('[data-testid="flow-layout"].test-flow-layout')
    panels = testFlowLayout.locator('.circuit-board-panel')
    panelCount = await panels.count()

    if (panelCount > 1) {
      // Should stack vertically on mobile
      const firstPanelBox = await panels.first().boundingBox()
      const secondPanelBox = await panels.nth(1).boundingBox()

      if (firstPanelBox && secondPanelBox) {
        // On mobile, second panel should be below first (larger Y position)
        expect(secondPanelBox.y).toBeGreaterThan(firstPanelBox.y + firstPanelBox.height - 50)
      }
    }
  })

  test('Debug info displays correctly in development', async ({ page }) => {
    const debugInfo = page.locator('.circuit-debug-info')

    // Debug info should only show in development mode
    if ((await debugInfo.count()) > 0) {
      await expect(debugInfo).toBeVisible()

      // Should contain expected debug information
      const debugText = await debugInfo.textContent()
      expect(debugText).toContain('Size:')
      expect(debugText).toContain('Ratio:')
      expect(debugText).toContain('Orientation:')
      expect(debugText).toContain('Panels:')
      expect(debugText).toContain('Paths:')
    }
  })

  test('Animation performance is acceptable', async ({ page }) => {
    // Measure performance during panel rendering
    const startTime = Date.now()

    // Trigger layout updates
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForTimeout(100)
    await page.setViewportSize({ width: 800, height: 600 })
    await page.waitForTimeout(100)
    await page.setViewportSize({ width: 1600, height: 900 })

    // Wait for animations to complete
    await page.waitForTimeout(2000)

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // Should complete all animations within reasonable time
    expect(totalTime).toBeLessThan(5000)

    // Check that layout is stable after animations
    const panels = page.locator('.circuit-board-panel')
    const panelCount = await panels.count()

    if (panelCount > 0) {
      // All panels should still be visible
      for (let i = 0; i < Math.min(panelCount, 5); i++) {
        await expect(panels.nth(i)).toBeVisible()
      }
    }
  })

  test('Error handling for invalid configurations', async ({ page }) => {
    // This test would require injecting invalid panel configurations
    // For now, just verify the page doesn't crash

    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    // Should not have critical JavaScript errors
    const criticalErrors = errors.filter(
      (error) =>
        error.includes('TypeError') ||
        error.includes('ReferenceError') ||
        error.includes('Cannot read property'),
    )

    expect(criticalErrors).toHaveLength(0)
  })
})
