/**
 * @file WireframeInfoPanel.tsx
 * @description Panel info component with click-to-copy functionality and visual feedback using terminal styling. Supports custom copy value for clipboard.
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-07
 *
 * @UsedBy
 * - Dashboard.tsx
 * - GetTrackInfo.tsx
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with click-to-copy and flash feedback
 * - 1.1.0: Updated documentation to reflect actual usage
 * - 1.2.0: Add copyValue prop for custom clipboard value
 * - 2.0.0: Moved to new wireframe structure, enhanced with variants
 */
import React, { useState } from "react";
import "../styles/index.css";
import { WireframePanel } from "../WireframePanel";

interface WireframeInfoPanelProps {
  header: string;
  info: string;
  copyValue?: string;
  className?: string;
  variant?: "default" | "compact" | "highlighted";
}

export function WireframeInfoPanel({
  header,
  info,
  copyValue,
  className = "",
  variant = "default",
}: WireframeInfoPanelProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async () => {
    const valueToCopy = copyValue ?? info;

    try {
      await navigator.clipboard.writeText(valueToCopy);
      setIsFlashing(true);
      setShowCopied(true);

      setTimeout(() => {
        setIsFlashing(false);
      }, 150);

      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const variantClass =
    variant === "compact"
      ? "wireframe-info-panel-compact"
      : variant === "highlighted"
      ? "wireframe-info-panel-highlighted"
      : "wireframe-info-panel";

  return (
    <WireframePanel
      className={`${variantClass} ${className}`}
      padding={variant === "compact" ? "small" : "medium"}
    >
      <div className="wireframe-info-header">{header}</div>
      <div
        className={`wireframe-info-content ${
          isFlashing ? "wireframe-info-flash" : ""
        }`}
        onClick={handleCopy}
        title="Click to copy"
      >
        {info}
      </div>
      {showCopied && <div className="wireframe-info-copied">copied!</div>}
    </WireframePanel>
  );
}
