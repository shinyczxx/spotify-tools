/**
 * @file WireframeDropdown.tsx
 * @description Panel dropdown button component for wireframe UI with right-aligned arrow indicator and smooth dropdown transition. Dropdown content is always rendered as a separate element below the button, with built-in open/close animation and delayed unmounting for smooth transitions.
 * @author GitHub Copilot
 * @version 2.0.0
 * @date 2025-07-07
 *
 * @UsedBy
 * - Login.tsx
 * - Dashboard.tsx
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation for dropdown button with right-aligned arrow
 * - 1.1.0: Add smooth transition for dropdown content
 * - 1.2.0: Always render dropdownContent as a separate element below the button, with open/close animation and delayed unmounting
 * - 2.0.0: Renamed to WireframeDropdown, moved to new structure
 */
import React, { ReactNode, useEffect, useState } from "react";
import { WireframeButton, WireframeButtonProps } from "../WireframeButton";
import "../styles/index.css";

export interface WireframeDropdownProps
  extends Omit<
    WireframeButtonProps,
    "leftArrow" | "rightArrow" | "arrowState" | "variant"
  > {
  open: boolean;
  children: ReactNode;
  dropdownContent?: ReactNode;
  dropdownMaxHeight?: number;
  variant?: "default" | "panel" | "compact";
  fullWidth?: boolean;
}

const DROPDOWN_ANIMATION_DURATION = 350; // ms, must match CSS

export function WireframeDropdown({
  open,
  children,
  style,
  dropdownContent,
  dropdownMaxHeight = 200,
  variant = "default",
  fullWidth = false,
  className = "",
  ...props
}: WireframeDropdownProps) {
  const [contentVisible, setContentVisible] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setContentVisible(true);
      setIsClosing(false);
    } else if (contentVisible) {
      setIsClosing(true);
      // Delay unmounting for closing animation
      const timeout = setTimeout(() => {
        setContentVisible(false);
        setIsClosing(false);
      }, DROPDOWN_ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [open, contentVisible]);

  const variantClass =
    variant === "panel"
      ? "wireframe-dropdown-panel"
      : variant === "compact"
      ? "wireframe-dropdown-compact"
      : "wireframe-dropdown";

  return (
    <div
      className={`wireframe-dropdown-container ${variantClass} ${className}`}
    >
      <WireframeButton
        {...props}
        variant="dropdown"
        rightArrow={true}
        arrowState={open ? "open" : "closed"}
        fullWidth={fullWidth}
        className="wireframe-dropdown-button"
      >
        {children}
      </WireframeButton>

      {contentVisible && (
        <div
          className={`wireframe-dropdown-content ${
            open ? "wireframe-dropdown-open" : ""
          } ${isClosing ? "wireframe-dropdown-closing" : ""}`}
          style={{
            maxHeight: dropdownMaxHeight,
            ...style,
          }}
        >
          {dropdownContent}
        </div>
      )}
    </div>
  );
}

// Backward compatibility export
export const WfPanelDropdown = WireframeDropdown;
export type WfPanelDropdownProps = WireframeDropdownProps;
