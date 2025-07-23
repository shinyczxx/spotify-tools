/**
 * @file env.ts
 * @description Environment variable utilities
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

/**
 * Get environment variable with optional default value
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (value !== undefined) {
    return value
  }
  
  if (defaultValue !== undefined) {
    return defaultValue
  }
  
  throw new Error(`Environment variable ${key} is required but not set`)
}