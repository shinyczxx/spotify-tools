/**
 * @file PlaylistModal.tsx
 * @description Reusable modal component for playlist creation with
 * flexible content slots. Supports custom forms and terminal-themed
 * UI for playlist management.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { ReactNode } from "react";
import { WireframePanel, WfPanelButton, WireframeInput } from "../wireframe";
import { Toggle } from "../Toggle";
import "./PlaylistModal.css";

export interface PlaylistModalFormData {
  name: string;
  isPublic: boolean;
  [key: string]: any; // Allow additional fields for specific implementations
}

export interface PlaylistModalProps {
  isOpen: boolean;
  isCreating: boolean;
  title?: string;

  // Form data
  initialData: PlaylistModalFormData;
  onFormChange: (data: PlaylistModalFormData) => void;

  // Content slots
  summaryContent?: ReactNode;
  customFields?: ReactNode;
  previewContent?: ReactNode;

  // Actions
  onConfirm: () => void;
  onCancel: () => void;

  // Validation
  isValid?: boolean;

  // Styling
  useWireframePanel?: boolean;
  maxWidth?: string;
  className?: string;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  isCreating,
  title = "Create Playlist",
  initialData,
  onFormChange,
  summaryContent,
  customFields,
  previewContent,
  onConfirm,
  onCancel,
  isValid = true,
  useWireframePanel = true,
  maxWidth = "600px",
  className = "",
}) => {
  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({ ...initialData, name: e.target.value });
  };

  const handlePrivacyChange = (selected: "left" | "right") => {
    onFormChange({ ...initialData, isPublic: selected === "right" });
  };

  const handleConfirm = () => {
    if (initialData.name.trim() && isValid && !isCreating) {
      onConfirm();
    }
  };

  const modalContent = (
    <div className="playlist-modal-content">
      {/* Summary section */}
      {summaryContent && (
        <div className="playlist-modal-summary">{summaryContent}</div>
      )}

      {/* Custom fields section */}
      {customFields && (
        <div className="playlist-modal-custom-fields">{customFields}</div>
      )}

      {/* Common form fields */}
      <div className="playlist-modal-form-fields">
        <div className="playlist-modal-field">
          <label htmlFor="playlist-name" className="playlist-modal-label">
            Playlist Name:
          </label>
          <WireframeInput
            id="playlist-name"
            value={initialData.name}
            onChange={handleNameChange}
            placeholder="Enter playlist name..."
            disabled={isCreating}
          />
        </div>

        <div className="playlist-modal-field">
          <label className="playlist-modal-label">Privacy:</label>
          <Toggle
            leftLabel="Private"
            rightLabel="Public"
            selected={initialData.isPublic ? "right" : "left"}
            onToggle={handlePrivacyChange}
            width="200px"
          />
        </div>
      </div>

      {/* Preview section */}
      {previewContent && (
        <div className="playlist-modal-preview">{previewContent}</div>
      )}

      {/* Action buttons */}
      <div className="playlist-modal-actions">
        <WfPanelButton
          onClick={onCancel}
          disabled={isCreating}
          style={{
            marginRight: "1em",
            minWidth: "120px",
          }}
        >
          Cancel
        </WfPanelButton>
        <WfPanelButton
          onClick={handleConfirm}
          disabled={!initialData.name.trim() || !isValid || isCreating}
          style={{
            backgroundColor: "var(--terminal-cyan)",
            color: "var(--terminal-bg)",
            minWidth: "180px",
          }}
        >
          {isCreating ? "Creating..." : "Create Playlist"}
        </WfPanelButton>
      </div>
    </div>
  );

  return (
    <div className="playlist-modal-overlay">
      <div className={`playlist-modal ${className}`} style={{ maxWidth }}>
        {useWireframePanel ? (
          <WireframePanel title={title}>{modalContent}</WireframePanel>
        ) : (
          <div className="playlist-modal-simple">
            <div className="playlist-modal-header">
              <h2>{title}</h2>
            </div>
            {modalContent}
          </div>
        )}
      </div>
    </div>
  );
};
