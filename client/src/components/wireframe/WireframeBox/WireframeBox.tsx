/**
 * @file WireframeBox.tsx
 * @description Basic wireframe-styled container component with
 * configurable box types and padding options. Used for layout and
 * visual grouping in the terminal UI.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { ReactNode } from "react";
import "../styles/index.css";

export interface WireframeBoxProps {
  children: ReactNode;
  boxType?: string;
  className?: string;
  padding?: "small" | "medium" | "large";
  style?: React.CSSProperties;
}

export function WireframeBox({
  children,
  boxType = "default",
  className = "",
  padding = "medium",
  style,
}: WireframeBoxProps) {
  const paddingClass =
    {
      small: "wireframe-padding-small",
      medium: "wireframe-padding-medium",
      large: "wireframe-padding-large",
    }[padding] || "wireframe-padding-medium";

  return (
    <div
      className={`wireframe-box wireframe-${boxType} ${paddingClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
