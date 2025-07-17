/**
 * @file WireframeButton.tsx
 * @description Panel button component for wireframe UI with optional
 * left or right toggle arrow for dropdowns. Adapts to container width
 * and content, supporting multiple variants for terminal-themed
 * layouts.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { ReactNode, ButtonHTMLAttributes } from "react";
import "../styles/index.css";

export interface WireframeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  leftArrow?: boolean;
  rightArrow?: boolean;
  arrowState?: "open" | "closed";
  variant?: "default" | "panel" | "dropdown";
  fullWidth?: boolean;
}

export function WireframeButton({
  children,
  onClick,
  className = "",
  style,
  leftArrow,
  rightArrow,
  arrowState,
  variant = "default",
  fullWidth = false,
  ...props
}: WireframeButtonProps) {
  const variantClass =
    variant === "panel"
      ? "wireframe-panel-button"
      : variant === "dropdown"
      ? "wireframe-dropdown-button"
      : "wireframe-button";

  const widthClass = fullWidth ? "wireframe-button-full-width" : "";

  return (
    <button
      className={`${variantClass} ${widthClass} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {leftArrow && (
        <span className="wireframe-button-arrow wireframe-button-arrow-left">
          {arrowState === "open" ? "v" : ">"}
        </span>
      )}
      {children}
      {rightArrow && (
        <span className="wireframe-button-arrow wireframe-button-arrow-right">
          {arrowState === "open" ? "^" : "v"}
        </span>
      )}
    </button>
  );
}

// Backward compatibility export
export const WfPanelButton = WireframeButton;
export type WfPanelButtonProps = WireframeButtonProps;
