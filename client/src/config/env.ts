/**
 * @file config.ts
 * @description Environment configuration that works in both runtime and test environments
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-10
 */

// Check if we're in a test environment
const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'

// Helper function to get environment variables that works in both runtime and test
export function getEnvVar(key: string, defaultValue?: string): string {
  // In test or Node environment, use process.env
  if (isTestEnv || (typeof process !== 'undefined' && process.env && process.env[key])) {
    return process.env[key] || defaultValue || ''
  }

  // In browser (Vite) environment, use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    // @ts-ignore
    return import.meta.env[key] || defaultValue || ''
  }

  // Fallback to default value
  if (defaultValue !== undefined) {
    return defaultValue
  }

  return '' // Return empty string instead of throwing in test environment
}

// Environment configuration
export const ENV = {
  SPOTIFY_CLIENT_ID: getEnvVar('VITE_SPOTIFY_CLIENT_ID'),
  SPOTIFY_REDIRECT_URI: getEnvVar('VITE_SPOTIFY_REDIRECT_URI', 
    getEnvVar('PROD', 'false') === 'true' 
      ? 'https://shinyczxx.github.io/spotify-tools/callback'
      : 'http://127.0.0.1:5175/callback'
  ),
  MODE: getEnvVar('MODE', 'development'),
  DEV: getEnvVar('DEV', 'false') === 'true',
  PROD: getEnvVar('PROD', 'false') === 'true',
}
