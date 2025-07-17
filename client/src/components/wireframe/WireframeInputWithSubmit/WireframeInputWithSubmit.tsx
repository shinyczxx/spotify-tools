/**
 * @file WireframeInputWithSubmit.tsx
 * @description Combined text input and submit button for wireframe UI, with flexible width ratio and consistent height. Used for forms where input and button should align and fill the parent width.
 * @author GitHub Copilot
 * @version 2.0.0
 * @date 2025-07-07
 *
 * @UsedBy
 * - GetTrackInfo.tsx
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation for wireframe panel input+button combo
 * - 2.0.0: Moved to new wireframe structure, enhanced with variants
 */
import React from "react";
import "../styles/index.css";
import { WireframeInput, WireframeInputProps } from "../WireframeInput";
import { WireframeButton, WireframeButtonProps } from "../WireframeButton";

export interface WireframeInputWithSubmitProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  buttonText?: string;
  buttonDisabled?: boolean;
  loading?: boolean;
  inputId?: string;
  inputProps?: Partial<WireframeInputProps>;
  buttonProps?: Partial<WireframeButtonProps>;
  inputWidthRatio?: number; // 0.1 to 0.9, defaults to 0.7
  variant?: "default" | "panel" | "compact";
  className?: string;
}

export function WireframeInputWithSubmit({
  label,
  value,
  onChange,
  onSubmit,
  placeholder = "enter text...",
  buttonText = "submit",
  buttonDisabled = false,
  loading = false,
  inputId,
  inputProps = {},
  buttonProps = {},
  inputWidthRatio = 0.7,
  variant = "default",
  className = "",
}: WireframeInputWithSubmitProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const variantClass =
    variant === "panel"
      ? "wireframe-input-submit-panel"
      : variant === "compact"
      ? "wireframe-input-submit-compact"
      : "wireframe-input-submit";

  const buttonWidthRatio = 1 - inputWidthRatio;
  const inputWidth = `${inputWidthRatio * 100}%`;
  const buttonWidth = `${buttonWidthRatio * 100}%`;

  return (
    <div
      className={`wireframe-input-submit-container ${variantClass} ${className}`}
    >
      {label && (
        <label
          htmlFor={
            inputId || `input-${label.toLowerCase().replace(/\s+/g, "-")}`
          }
          className="wireframe-input-submit-label"
        >
          {label}
        </label>
      )}
      <form onSubmit={handleSubmit} className="wireframe-input-submit-form">
        <WireframeInput
          {...inputProps}
          id={
            inputId ||
            (label
              ? `input-${label.toLowerCase().replace(/\s+/g, "-")}`
              : undefined)
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={loading}
          variant={variant === "panel" ? "panel" : "default"}
          className={`wireframe-input-submit-input ${
            inputProps.className || ""
          }`}
          style={{
            width: inputWidth,
            flex: `0 0 ${inputWidth}`,
            ...inputProps.style,
          }}
        />
        <WireframeButton
          {...buttonProps}
          type="submit"
          disabled={buttonDisabled || loading}
          variant={variant === "panel" ? "panel" : "default"}
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
