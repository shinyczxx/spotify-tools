/**
 * @file TerminalLoader.tsx
 * @description SVG-based 80s terminal style loading bar with animated
 * progress. Used for album processing and loading states in the
 * terminal UI.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { useEffect, useState } from "react";
import "./TerminalLoader.css";

export interface TerminalLoaderProps {
  progress?: number; // 0-100
  message?: string;
  showPercentage?: boolean;
  variant?: "bar" | "dots" | "blocks";
  size?: "small" | "medium" | "large";
  className?: string;
  animated?: boolean;
}

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  progress = 0,
  message = "processing...",
  showPercentage = true,
  variant = "bar",
  size = "medium",
  className = "",
  animated = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [dots, setDots] = useState("");

  // Animate progress changes
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  // Animate dots for loading message
  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev.length >= 3) return "";
          return prev + ".";
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const containerClasses = [
    "terminal-loader",
    `terminal-loader-${size}`,
    `terminal-loader-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderBarLoader = () => {
    const segments = 50;
    const filledSegments = Math.floor((animatedProgress / 100) * segments);

    return (
      <div className="terminal-loader-bar">
        <div className="terminal-loader-bar-container">
          <svg
            className="terminal-loader-bar-svg"
            viewBox={`0 0 ${segments * 2} 10`}
            width="100%"
            height="10"
          >
            {/* Background grid */}
            {Array.from({ length: segments }).map((_, i) => (
              <rect
                key={`bg-${i}`}
                x={i * 2}
                y={0}
                width={1.8}
                height={10}
                fill="none"
                stroke="var(--terminal-cyan-dim)"
                strokeWidth="0.1"
                opacity="0.3"
              />
            ))}

            {/* Progress bars */}
            {Array.from({ length: filledSegments }).map((_, i) => (
              <rect
                key={`fill-${i}`}
                x={i * 2}
                y={0}
                width={1.8}
                height={10}
                fill="var(--terminal-cyan)"
                className="terminal-loader-segment"
                style={{
                  animationDelay: animated ? `${i * 0.05}s` : "0s",
                }}
              />
            ))}

            {/* Animated cursor at progress position */}
            {animated && (
              <rect
                x={filledSegments * 2}
                y={0}
                width={1.8}
                height={10}
                fill="var(--terminal-cyan-bright)"
                className="terminal-loader-cursor"
              />
            )}
          </svg>
        </div>

        <div className="terminal-loader-info">
          <span className="terminal-loader-message">
            {message}
            {animated ? dots : ""}
          </span>
          {showPercentage && (
            <span className="terminal-loader-percentage">
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderDotsLoader = () => {
    const dotCount = 20;
    const activeDots = Math.floor((animatedProgress / 100) * dotCount);

    return (
      <div className="terminal-loader-dots">
        <div className="terminal-loader-dots-container">
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className={`terminal-loader-dot ${
                i < activeDots ? "active" : ""
              }`}
              style={{
                animationDelay: animated ? `${i * 0.1}s` : "0s",
              }}
            >
              ●
            </span>
          ))}
        </div>

        <div className="terminal-loader-info">
          <span className="terminal-loader-message">
            {message}
            {animated ? dots : ""}
          </span>
          {showPercentage && (
            <span className="terminal-loader-percentage">
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderBlocksLoader = () => {
    const blockCount = 25;
    const activeBlocks = Math.floor((animatedProgress / 100) * blockCount);

    return (
      <div className="terminal-loader-blocks">
        <div className="terminal-loader-blocks-container">
          {Array.from({ length: blockCount }).map((_, i) => (
            <div
              key={i}
              className={`terminal-loader-block ${
                i < activeBlocks ? "active" : ""
              }`}
              style={{
                animationDelay: animated ? `${i * 0.03}s` : "0s",
              }}
            >
              ■
            </div>
          ))}
        </div>

        <div className="terminal-loader-info">
          <span className="terminal-loader-message">
            {message}
            {animated ? dots : ""}
          </span>
          {showPercentage && (
            <span className="terminal-loader-percentage">
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      {variant === "bar" && renderBarLoader()}
      {variant === "dots" && renderDotsLoader()}
      {variant === "blocks" && renderBlocksLoader()}
    </div>
  );
};

export default TerminalLoader;
