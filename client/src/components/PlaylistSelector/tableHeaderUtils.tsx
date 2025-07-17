/**
 * @file tableHeaderUtils.tsx
 * @description Utilities and dynamic table header component for rendering configurable table headers with proportional widths, tooltips, and sort support in the terminal theme.
 * @author Caleb Price
 * @version 1.0.1
 * @date 2025-07-08
 *
 * @UsedBy
 * - PlaylistSelector
 *
 * @ChangeLog
 * - 1.0.1: Allow label to be React.ReactNode for icon/tooltips
 * - 1.0.0: Initial implementation
 */

import React from 'react'
import { TooltipIcon } from '../wireframe/TooltipIcon'
import { WireframeCheckbox } from '../wireframe/WireframeCheckbox'

/**
 * TableHeaderConfig defines the structure for each table header column.
 */
export interface TableHeaderConfig {
  /**
   * Display name for the column (lowercase enforced by theme). Can be string or ReactNode.
   */
  label: React.ReactNode
  /**
   * Unique key for the column, used for sorting and row mapping.
   */
  key: string
  /**
   * Proportional width weight (relative, not percent). Will be normalized.
   */
  widthWeight: number
  /**
   * Optional tooltip content (ReactNode for rich tooltips).
   */
  tooltip?: React.ReactNode
  /**
   * Whether the column is sortable.
   */
  sortable?: boolean
  /**
   * Optional custom className for the header cell.
   */
  className?: string
  /**
   * Optional ARIA label for accessibility.
   */
  ariaLabel?: string
  /**
   * Optional minimum width for column in pixels.
   */
  minWidth?: number
  /**
   * Shared class for both header and row for alignment.
   */
  colClass?: string
}

/**
 * Normalizes an array of width weights so their sum is 100.
 * If total <= 100, returns the original weights as percentages.
 * If total > 100, scales all weights proportionally.
 */
export function getProportionalWidths(weights: number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total === 0) return weights.map(() => 0)
  if (total <= 100) {
    return weights.map((w) => (w / total) * 100)
  }
  // Scale down to 100
  return weights.map((w) => (w / total) * 100)
}

/**
 * Props for DynamicTableHeader
 */
export interface DynamicTableHeaderProps {
  headerConfigs: TableHeaderConfig[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort?: (key: string) => void
  getSortIndicator?: (key: string) => React.ReactNode
  className?: string
  // New for select/deselect all
  isAllSelected?: boolean
  isPartiallySelected?: boolean
  onSelectAll?: () => void
}

/**
 * Renders a dynamic table header row based on headerConfigs, with proportional widths, tooltips, and sort support.
 */
export const DynamicTableHeader: React.FC<DynamicTableHeaderProps> = React.memo(
  ({
    headerConfigs,
    sortBy,
    sortOrder,
    onSort,
    getSortIndicator,
    className = '',
    isAllSelected = false,
    isPartiallySelected = false,
    onSelectAll,
  }) => {
    const weights = headerConfigs.map((h) => h.widthWeight)
    const widths = getProportionalWidths(weights)

    return (
      <div className={`table-header ${className}`.trim()} role="row">
        {headerConfigs.map((header, idx) => {
          const isSortable = !!header.sortable && !!onSort
          const sortActive = isSortable && sortBy === header.key
          const ariaSort =
            isSortable && sortActive
              ? sortOrder === 'asc'
                ? 'ascending'
                : 'descending'
              : undefined
          // Render select/deselect all checkbox in the first column if key is 'checkbox'
          if (header.key === 'checkbox' && typeof onSelectAll === 'function') {
            return (
              <div
                key={header.key}
                className={[
                  'table-header-cell',
                  'header-checkbox',
                  header.className,
                  header.colClass,
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="columnheader"
                style={{ userSelect: 'none', justifyContent: 'center' }}
              >
                <WireframeCheckbox
                  checked={isAllSelected}
                  indeterminate={isPartiallySelected && !isAllSelected}
                  onChange={onSelectAll}
                  aria-label="select/deselect all on page"
                />
              </div>
            )
          }
          return (
            <div
              key={header.key}
              className={[
                'table-header-cell',
                header.className,
                header.colClass,
                isSortable ? 'sort-header' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                userSelect: 'none',
                cursor: isSortable ? 'pointer' : undefined,
              }}
              onClick={isSortable ? () => onSort!(header.key) : undefined}
              aria-label={
                typeof header.ariaLabel === 'string'
                  ? header.ariaLabel
                  : typeof header.label === 'string'
                  ? header.label
                  : undefined
              }
              aria-sort={ariaSort}
              role="columnheader"
              tabIndex={isSortable ? 0 : -1}
              onKeyDown={
                isSortable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSort!(header.key)
                      }
                    }
                  : undefined
              }
            >
              <span className="header-label">
                {header.label}
                {header.tooltip && (
                  <TooltipIcon
                    contents={header.tooltip}
                    size={16}
                    tailLength={0}
                    direction="bottom"
                    ariaLabel={typeof header.tooltip === 'string' ? header.tooltip : undefined}
                  />
                )}
                {isSortable && getSortIndicator && getSortIndicator(header.key)}
              </span>
            </div>
          )
        })}
      </div>
    )
  },
)

export default DynamicTableHeader
