/**
 * @file LoadingSpinner.tsx
 * @description Global loading component with terminal-style
 * aesthetics. Displays animated spinner and optional message for
 * loading states across the app.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  /** Loading message to display */
  message?: string;
  /** Size of the spinner - small, medium, or large */
  size?: "small" | "medium" | "large";
  /** Whether to show as an overlay */
  overlay?: boolean;
  /** Custom className for additional styling */
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "medium",
  overlay = false,
  className = "",
}) => {
  const spinnerClasses = [
    "loading-spinner",
    `loading-spinner--${size}`,
    overlay ? "loading-spinner--overlay" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={spinnerClasses}>
      <div className="loading-spinner__content">
        <div className="loading-spinner__dots">
          <span className="loading-spinner__dot"></span>
          <span className="loading-spinner__dot"></span>
          <span className="loading-spinner__dot"></span>
        </div>
        {message && <p className="loading-spinner__message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
