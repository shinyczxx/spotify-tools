/**
 * @file fontSizeUtils.ts
 * @description Font size validation and management utilities
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

import { FONT_SIZE, STORAGE_KEYS } from '../../constants/app'

/**
 * Validates and constrains font size to allowed range
 */
export const validateFontSize = (size: number): number => {
  return size && size >= FONT_SIZE.MIN && size <= FONT_SIZE.MAX ? size : FONT_SIZE.DEFAULT
}

/**
 * Gets font size from localStorage with validation
 */
export const getFontSizeFromStorage = (): number => {
  const stored = Number(localStorage.getItem(STORAGE_KEYS.FONT_SIZE))
  return validateFontSize(stored)
}

/**
 * Sets font size in localStorage and CSS variable
 */
export const setFontSize = (size: number): number => {
  const validSize = validateFontSize(size)
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(validSize))
  document.documentElement.style.setProperty('--terminal-font-size', `${validSize}px`)
  return validSize
}