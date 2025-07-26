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
  variant?: "panel" | "header" | "error" | "data" | "warn";
  padding?: "small" | "medium" | "large";
  style?: React.CSSProperties;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function WireframePanel({
  title,
  className = "",
  children,
  variant = "panel",
  padding = "medium",
  style,
  isCollapsible = false,
  isExpanded = true,
  onToggle,
}: WireframePanelProps) {
  const getBoxType = () => {
    switch (variant) {
      case "header": return "header";
      case "error": return "error-panel";
      case "warn": return "warn-panel";
      case "data": return "data-panel";
      default: return "panel";
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case "header": return "wireframe-header";
      case "error": return "wireframe-error-panel";
      case "warn": return "wireframe-warn-panel";
      case "data": return "wireframe-data-panel";
      default: return "wireframe-panel";
    }
  };

  const getTitleClass = () => {
    switch (variant) {
      case "error": return "wireframe-error-panel-title";
      case "warn": return "wireframe-warn-panel-title";
      case "data": return "wireframe-data-panel-title";
      default: return "wireframe-panel-title";
    }
  };

  const getContentClass = () => {
    switch (variant) {
      case "error": return "wireframe-error-panel-content";
      case "warn": return "wireframe-warn-panel-content";
      case "data": return "wireframe-data-panel-content";
      default: return "wireframe-panel-content";
    }
  };

  return (
    <WireframeBox
      boxType={getBoxType()}
      className={`${getVariantClass()} ${className}`}
      style={style}
      padding={padding}
    >
      {title && (
        <h2 
          className={`${getTitleClass()} ${isCollapsible ? 'collapsible-title' : ''}`}
          onClick={isCollapsible ? onToggle : undefined}
          style={isCollapsible ? { cursor: 'pointer' } : undefined}
        >
          {title}
          {isCollapsible && (
            <span className="collapse-indicator">
              {isExpanded ? ' ▼' : ' ▶'}
            </span>
          )}
        </h2>
      )}
      {(!isCollapsible || isExpanded) && (
        <div className={getContentClass()}>
          {children}
        </div>
      )}
    </WireframeBox>
  );
}
