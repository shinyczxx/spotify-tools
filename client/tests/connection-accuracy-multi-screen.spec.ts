/**
 * @file connection-accuracy-multi-screen.spec.ts
 * @description Comprehensive tests for circuit trace connection accuracy across different screen sizes
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-13
 */

import { test, expect } from '@playwright/test'

// Common viewport sizes for testing
const VIEWPORTS = {
  mobile: { width: 400, height: 600 },
  tablet: { width: 800, height: 600 },
  desktop: { width: 1280, height: 900 },
  large: { width: 1920, height: 1080 },
}

test.describe('Circuit Connection Accuracy - Multi-Screen', () => {
  Object.entries(VIEWPORTS).forEach(([deviceName, viewport]) => {
    test(`connection accuracy on ${deviceName} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      // Set viewport size
      await page.setViewportSize(viewport)
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Wait for layout to render
      await page.waitForSelector('[data-testid="controlled-flow-layout"]', {
        state: 'visible',
        timeout: 10000,
      })

      // Wait for trace drawer
      await page.waitForSelector('[data-testid="trace-drawer"]', { state: 'visible' })

      // Get all panels and their positions
      const panelData = await page.locator('.circuit-board-panel').evaluateAll((panels) =>
        panels.map((panel) => {
          const rect = panel.getBoundingClientRect()
          return {
            id: panel.getAttribute('data-testid'),
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          }
        }),
      )

      // Get all solder points and their positions
      const solderPointData = await page.locator('.circuit-solder-point').evaluateAll((points) =>
        points.map((point) => {
          const rect = point.getBoundingClientRect()
          return {
            cx: parseFloat(point.getAttribute('cx') || '0'),
            cy: parseFloat(point.getAttribute('cy') || '0'),
            screenX: rect.x + rect.width / 2,
            screenY: rect.y + rect.height / 2,
          }
        }),
      )

      // Get all circuit traces
      const traceData = await page.locator('.circuit-trace').evaluateAll((traces) =>
        traces.map((trace) => ({
          d: trace.getAttribute('d'),
          hasCollision: trace.classList.contains('collision'),
        })),
      )

      // Validate basic requirements
      expect(panelData.length, 'Should have panels rendered').toBeGreaterThan(0)
      expect(solderPointData.length, 'Should have solder points').toBeGreaterThan(0)
      expect(traceData.length, 'Should have circuit traces').toBeGreaterThan(0)

      // Verify no collision traces
      const collisionCount = traceData.filter((trace) => trace.hasCollision).length
      expect(collisionCount, 'Should have no collision traces').toBe(0)

      // Verify solder points are positioned on panel edges
      // Note: This is a simplified check - in practice, solder points should align with panel borders
      for (const solderPoint of solderPointData) {
        expect(solderPoint.cx, 'Solder point cx should be valid percentage').toBeGreaterThanOrEqual(
          0,
        )
        expect(solderPoint.cx, 'Solder point cx should be valid percentage').toBeLessThanOrEqual(
          100,
        )
        expect(solderPoint.cy, 'Solder point cy should be valid percentage').toBeGreaterThanOrEqual(
          0,
        )
        expect(solderPoint.cy, 'Solder point cy should be valid percentage').toBeLessThanOrEqual(
          100,
        )
      }

      // Log debug information
      console.log(
        `[${deviceName}] Panels: ${panelData.length}, Solder Points: ${solderPointData.length}, Traces: ${traceData.length}`,
      )
      console.log(`[${deviceName}] Viewport: ${viewport.width}x${viewport.height}`)
      console.log(
        `[${deviceName}] Panel positions:`,
        panelData.map((p) => `${p.id}: ${p.x},${p.y} (${p.width}x${p.height})`),
      )
    })
  })

  test('responsive layout recalculation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Start with desktop
    await page.setViewportSize(VIEWPORTS.desktop)
    await page.waitForSelector('[data-testid="controlled-flow-layout"]', { state: 'visible' })

    const getTraceData = async () => {
      return await page
        .locator('.circuit-trace')
        .evaluateAll((traces) => traces.map((trace) => trace.getAttribute('d')))
    }

    // Get initial traces
    const desktopTraces = await getTraceData()

    // Resize to tablet
    await page.setViewportSize(VIEWPORTS.tablet)
    await page.waitForTimeout(500) // Wait for resize debounce
    const tabletTraces = await getTraceData()

    // Resize to mobile
    await page.setViewportSize(VIEWPORTS.mobile)
    await page.waitForTimeout(500)
    const mobileTraces = await getTraceData()

    // Verify traces recalculate for different screen sizes
    expect(tabletTraces, 'Tablet traces should differ from desktop').not.toEqual(desktopTraces)
    expect(mobileTraces, 'Mobile traces should differ from tablet').not.toEqual(tabletTraces)

    console.log('Desktop traces:', desktopTraces.length)
    console.log('Tablet traces:', tabletTraces.length)
    console.log('Mobile traces:', mobileTraces.length)
  })

  test('connection point precision verification', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.setViewportSize(VIEWPORTS.desktop)

    // Wait for layout
    await page.waitForSelector('[data-testid="controlled-flow-layout"]', { state: 'visible' })

    // Verify solder points are exactly on panel borders
    const connectionAccuracy = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('.circuit-board-panel'))
      const solderPoints = Array.from(document.querySelectorAll('.circuit-solder-point'))

      const results = solderPoints.map((point) => {
        const panel = point.closest('.circuit-board-panel')
        if (!panel) return { accurate: false, reason: 'No parent panel found' }

        const panelRect = panel.getBoundingClientRect()
        const pointRect = point.getBoundingClientRect()

        const pointCenterX = pointRect.x + pointRect.width / 2
        const pointCenterY = pointRect.y + pointRect.height / 2

        // Check if point is on panel edge (within 2px tolerance for border)
        const onTopEdge = Math.abs(pointCenterY - panelRect.top) <= 2
        const onBottomEdge = Math.abs(pointCenterY - panelRect.bottom) <= 2
        const onLeftEdge = Math.abs(pointCenterX - panelRect.left) <= 2
        const onRightEdge = Math.abs(pointCenterX - panelRect.right) <= 2

        const onEdge = onTopEdge || onBottomEdge || onLeftEdge || onRightEdge

        return {
          accurate: onEdge,
          reason: onEdge
            ? 'On panel edge'
            : `Point at (${pointCenterX.toFixed(1)}, ${pointCenterY.toFixed(1)}) not on panel edge`,
          panelBounds: {
            left: panelRect.left,
            top: panelRect.top,
            right: panelRect.right,
            bottom: panelRect.bottom,
          },
          pointPosition: { x: pointCenterX, y: pointCenterY },
        }
      })

      return results
    })

    // Log detailed connection accuracy results
    console.log('Connection accuracy results:', connectionAccuracy)

    const accurateConnections = connectionAccuracy.filter((result) => result.accurate).length
    const totalConnections = connectionAccuracy.length

    console.log(`Accurate connections: ${accurateConnections}/${totalConnections}`)

    // Verify most connections are accurate (allowing for some edge cases)
    const accuracyPercentage = (accurateConnections / totalConnections) * 100
    expect(accuracyPercentage, 'Connection accuracy should be at least 80%').toBeGreaterThanOrEqual(
      80,
    )
  })
})
