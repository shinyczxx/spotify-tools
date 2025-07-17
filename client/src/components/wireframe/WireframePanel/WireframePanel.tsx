/**
 * @file WireframePanel.tsx
 * @description Panel component for wireframe UI with optional title
 * header and variant support. Used for grouping content in a
 * terminal-themed layout, supporting error and header variants.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { ReactNode } from "react";
import "../styles/index.css";
import { WireframeBox } from "../WireframeBox";

export interface WireframePanelProps {
  title?: string;
  className?: string;
  children: ReactNode;
  variant?: "panel" | "header" | "error";
  padding?: "small" | "medium" | "large";
  style?: React.CSSProperties;
}

export function WireframePanel({
  title,
  className = "",
  children,
  variant = "panel",
  padding = "medium",
  style,
}: WireframePanelProps) {
  const boxType =
    variant === "header"
      ? "header"
      : variant === "error"
      ? "error-panel"
      : "panel";
  const variantClass =
    variant === "header"
      ? "wireframe-header"
      : variant === "error"
      ? "wireframe-error-panel"
      : "wireframe-panel";
  const titleClass =
    variant === "error"
      ? "wireframe-error-panel-title"
      : "wireframe-panel-title";

  return (
    <WireframeBox
      boxType={boxType}
      className={`${variantClass} ${className}`}
      style={style}
      padding={padding}
    >
      {title && <h2 className={titleClass}>{title}</h2>}
      <div
        className={
          variant === "error"
            ? "wireframe-error-panel-content"
            : "wireframe-panel-content"
        }
      >
        {children}
      </div>
    </WireframeBox>
  );
}
