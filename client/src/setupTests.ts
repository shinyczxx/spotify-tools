/**
 * @file setupTests.ts
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 *
 * @description Jest test setup configuration for React Testing Library and global mocks
 */

import '@testing-library/jest-dom'

// Mock axios globally
jest.mock('axios')

// Add missing browser APIs for jsdom
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = jest.fn()

// Mock fetch
global.fetch = jest.fn()

// Mock environment variables by setting process.env for Node.js context
process.env.VITE_SPOTIFY_CLIENT_ID = 'test_client_id'
process.env.VITE_SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/callback'

// Mock window.localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock window.console to prevent excessive logging in tests
global.console = {
  ...console,
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock crypto for PKCE
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn(() => new Uint8Array(128)),
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    },
  },
})

// Mock fetch for Spotify API calls
global.fetch = jest.fn()

// Mock window.matchMedia for reduced motion detection
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id))

// Set up CSS variables for testing
beforeEach(() => {
  // Set CSS variables on document root for tests
  const style = document.createElement('style')
  style.textContent = `
    :root {
      --terminal-cyan: #00ffff;
      --terminal-cyan-dim: #00dddd;
      --terminal-cyan-bright: #66ffff;
      --terminal-cyan-dark: #004444;
      --terminal-bg: #000000;
      --terminal-dark: #0a0a0a;
      --terminal-font: 'Fixedsys', 'Courier New', monospace;
      --terminal-font-size: 14px;
      --terminal-error: #ff4444;
      --terminal-error-bg: #1a0606;
      --terminal-error-border: #cc3333;
      --glow-error: 0 0 10px #ff4444;
      --glow-cyan: 0 0 10px #00ffff;
      --terminal-medium: #333333;
    }
  `
  document.head.appendChild(style)
})
