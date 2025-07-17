/**
 * @file stringUtils.ts
 * @description Utility functions for string manipulation and cleaning
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted from PlaylistSelector component utils
 */

/**
 * Decodes HTML entities in a string using a temporary textarea element.
 * @param text - The string to decode
 * @returns The decoded string
 */
export const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

/**
 * Strips HTML tags from a string using a temporary div element.
 * @param text - The string to clean
 * @returns The string with HTML tags removed
 */
export const stripHtmlTags = (text: string): string => {
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || div.innerText || ''
}

/**
 * Cleans and truncates a description string: decodes HTML entities, strips tags, normalizes whitespace, and truncates.
 * @param description - The description string (may be undefined)
 * @param maxLength - Maximum length for truncation (default 100)
 * @returns The cleaned and truncated string
 */
export const cleanDescription = (
  description: string | undefined,
  maxLength: number = 100,
): string => {
  if (!description || description.trim() === '') {
    return ''
  }

  // First decode HTML entities, then strip tags
  let cleaned = decodeHtmlEntities(description)
  cleaned = stripHtmlTags(cleaned)

  // Remove extra whitespace and normalize
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Truncate if needed
  if (cleaned.length > maxLength) {
    // Try to break at a word boundary near the limit
    const truncated = cleaned.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...'
    }
    return truncated + '...'
  }

  return cleaned
}