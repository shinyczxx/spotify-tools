/**
 * @file WireframeInput.tsx
 * @description Styled input component with wireframe theme styling. Supports optional submit button for forms and filter controls in the terminal UI.
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-08
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation
 * - 2.0.0: Merged with WireframeInputWithSubmit for unified API
 */

import React from "react";
import "../styles/index.css";
import { WireframeButton, WireframeButtonProps } from "../WireframeButton";

export interface WireframeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string;
  inline?: boolean;
  lightBackground?: boolean;
  variant?: "default" | "panel" | "search";
  fullWidth?: boolean;
  // Submit button (merged)
  onSubmit?: (e: React.FormEvent) => void;
  buttonText?: string;
  buttonDisabled?: boolean;
  loading?: boolean;
  buttonProps?: Partial<WireframeButtonProps>;
  inputWidthRatio?: number; // 0.1 to 0.9, defaults to 0.7
  inputId?: string;
}

export function WireframeInput({
  className = "",
  label,
  inline = false,
  lightBackground = true,
  variant = "default",
  fullWidth = false,
  id,
  onSubmit,
  buttonText = "submit",
  buttonDisabled = false,
  loading = false,
  buttonProps = {},
  inputWidthRatio = 0.7,
  inputId,
  ...props
}: WireframeInputProps) {
  const variantClass =
    variant === "panel"
      ? "wireframe-panel-input"
      : variant === "search"
      ? "wireframe-search-input"
      : "wireframe-input";

  const backgroundClass = lightBackground
    ? "wireframe-input-light"
    : "wireframe-input-dark";
  const widthClass = fullWidth ? "wireframe-input-full-width" : "";

  // If onSubmit or buttonText is provided, render as input+button combo
  if (onSubmit || buttonText) {
    const buttonWidthRatio = 1 - inputWidthRatio;
    const inputWidth = `${inputWidthRatio * 100}%`;
    const buttonWidth = `${buttonWidthRatio * 100}%`;
    const inputElement = (
      <input
        className={`${variantClass} ${backgroundClass} ${widthClass} wireframe-input-submit-input ${className}`}
        id={
          inputId ||
          id ||
          (label
            ? `input-${label.toLowerCase().replace(/\s+/g, "-")}`
            : undefined)
        }
        disabled={loading}
        {...props}
      />
    );
    return (
      <div
        className={`wireframe-input-submit-container wireframe-input-submit ${className}`}
      >
        {label && (
          <label
            htmlFor={
              inputId ||
              id ||
              `input-${label.toLowerCase().replace(/\s+/g, "-")}`
            }
            className="wireframe-input-submit-label"
          >
            {label}
          </label>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }}
          className="wireframe-input-submit-form"
        >
          <div
            style={{ width: inputWidth, flex: `0 0 ${inputWidth}` }}
            className="wireframe-input-submit-input-wrapper"
          >
            {inputElement}
          </div>
          <WireframeButton
            {...buttonProps}
            type="submit"
            disabled={buttonDisabled || loading}
            className={`wireframe-input-submit-button ${
              buttonProps.className || ""
            }`}
            style={{
              width: buttonWidth,
              flex: `0 0 ${buttonWidth}`,
              ...buttonProps.style,
            }}
          >
            {loading ? "processing..." : buttonText}
          </WireframeButton>
        </form>
      </div>
    );
  }

  // Standard input (no submit button)
  const inputElement = (
    <input
      className={`${variantClass} ${backgroundClass} ${widthClass} ${className}`}
      id={
        id ||
        (label
          ? `input-${label.toLowerCase().replace(/\s+/g, "-")}`
          : undefined)
      }
      {...props}
    />
  );

  if (label) {
    return inline ? (
      <span className="wireframe-input-inline">
        <label
          htmlFor={id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="wireframe-input-label"
        >
          {label}
        </label>
        {inputElement}
      </span>
    ) : (
      <div className="wireframe-input-block">
        <label
          htmlFor={id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="wireframe-input-label"
        >
          {label}
        </label>
        {inputElement}
      </div>
    );
  }

  return inputElement;
}
