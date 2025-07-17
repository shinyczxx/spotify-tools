/**
 * @file checkbox-icons.tsx
 * @description SVG icons for the wireframe checkbox component
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-07
 */

import React from "react";

export const CheckboxIcon: React.FC<{
  checked: boolean;
  size?: number;
  className?: string;
}> = ({ checked, size = 16, className = "" }) => (
  <svg
    className={`wireframe-checkbox-icon ${className}`}
    viewBox="0 0 16 16"
    width={size}
    height={size}
    aria-hidden="true"
  >
    {/* Outer box */}
    <rect
      x="1"
      y="1"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="wireframe-checkbox-box"
    />

    {/* Inner fill when checked */}
    {checked && (
      <rect
        x="3"
        y="3"
        width="10"
        height="10"
        fill="currentColor"
        className="wireframe-checkbox-fill"
      />
    )}

    {/* Check mark */}
    {checked && (
      <path
        d="M5 8l2 2 4-4"
        fill="none"
        stroke="var(--terminal-bg)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="wireframe-checkbox-check"
      />
    )}
  </svg>
);

export default CheckboxIcon;
