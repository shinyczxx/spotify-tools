/**
 * @file test-config.ts
 * @description Shared test configuration and utilities
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-10
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'

// Global test setup
beforeAll(() => {
  // Setup global mocks
  global.matchMedia =
    global.matchMedia ||
    function (query) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {},
      }
    }

  // Mock requestAnimationFrame
  global.requestAnimationFrame =
    global.requestAnimationFrame ||
    function (cb) {
      return setTimeout(cb, 16)
    }

  global.cancelAnimationFrame =
    global.cancelAnimationFrame ||
    function (id) {
      clearTimeout(id)
    }

  // Mock ResizeObserver
  global.ResizeObserver =
    global.ResizeObserver ||
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

  // Mock IntersectionObserver
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    }
})

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()

  // Reset console mocks
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterEach(() => {
  // Cleanup after each test
  jest.clearAllTimers()
  jest.useRealTimers()
})

afterAll(() => {
  // Global cleanup
  jest.restoreAllMocks()
})

// Simple test to ensure this file is valid
describe('Test Configuration', () => {
  it('should setup global test environment', () => {
    expect(global.matchMedia).toBeDefined()
    expect(global.requestAnimationFrame).toBeDefined()
    expect(global.ResizeObserver).toBeDefined()
    expect(global.IntersectionObserver).toBeDefined()
  })
})
