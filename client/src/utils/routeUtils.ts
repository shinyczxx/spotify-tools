/**
 * @file routeUtils.ts
 * @description Route mapping and navigation utilities
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

import { 
  ROUTE_TO_PAGE_MAP, 
  PAGE_TO_ROUTE_MAP, 
  ROUTE_TITLES,
  DEFAULT_PAGE_ID,
  DEFAULT_TITLE,
  PAGE_IDS,
  EXTERNAL_LINKS
} from '../constants/routes'

/**
 * Gets page ID from pathname
 */
export const getPageIdFromPath = (pathname: string): string => {
  const normalizedPath = pathname.toLowerCase()
  return ROUTE_TO_PAGE_MAP[normalizedPath] || DEFAULT_PAGE_ID
}

/**
 * Gets route from page ID
 */
export const getRouteFromPageId = (pageId: string): string => {
  return PAGE_TO_ROUTE_MAP[pageId] || '/'
}

/**
 * Gets title from pathname
 */
export const getTitleFromPath = (pathname: string): string => {
  const normalizedPath = pathname.toLowerCase()
  
  // Check exact matches first
  if (ROUTE_TITLES[normalizedPath]) {
    return ROUTE_TITLES[normalizedPath]
  }
  
  // Check path prefixes
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (normalizedPath.startsWith(route)) {
      return title
    }
  }
  
  return DEFAULT_TITLE
}

/**
 * Navigation handler for special cases
 */
export const handleSpecialNavigation = (pageId: string, navigate: (path: string) => void, onLogout: () => void): boolean => {
  switch (pageId) {
    case PAGE_IDS.LOGOUT:
      onLogout()
      return true
    case PAGE_IDS.GITHUB:
      window.open(EXTERNAL_LINKS.GITHUB_REPO, '_blank')
      return true
    default:
      return false
  }
}