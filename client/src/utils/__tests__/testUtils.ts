/**
 * @file testUtils.ts
 * @description Utilities for testing including import.meta mocking
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-10
 */

// Mock import.meta for testing
export const mockImportMeta = {
  env: {
    VITE_SPOTIFY_CLIENT_ID: 'test_client_id',
    VITE_SPOTIFY_REDIRECT_URI: 'http://127.0.0.1:3000/callback',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
    BASE_URL: '/',
  },
}

// Test to ensure this module has at least one test
describe('Test Utils', () => {
  test('should export mockImportMeta', () => {
    expect(mockImportMeta).toBeDefined()
    expect(mockImportMeta.env.VITE_SPOTIFY_CLIENT_ID).toBe('test_client_id')
  })
})

// Function to mock modules that use import.meta
export function setupImportMetaMock() {
  // Create a temporary replacement for import.meta in module scope
  ;(global as any).importMeta = mockImportMeta

  // Replace import.meta usage in modules by mocking the module
  jest.doMock('../spotifyAuth', () => {
    const originalModule = jest.requireActual('../spotifyAuth')
    return {
      ...originalModule,
      // Override any functions that use import.meta.env
    }
  })
}
