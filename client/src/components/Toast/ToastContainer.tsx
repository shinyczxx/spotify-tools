/**
 * @file ToastContainer.tsx
 * @description Container component for displaying toasts
 * @author Code Review Implementation
 * @version 1.0.0
 * @date 2025-11-18
 */

import React from 'react'
import { useToast, Toast, ToastType } from './ToastContext'
import './Toast.css'

const getToastColor = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return 'var(--terminal-green)'
    case 'error':
      return 'var(--terminal-red)'
    case 'warning':
      return 'var(--warning)'
    case 'info':
    default:
      return 'var(--terminal-cyan)'
  }
}

const getToastIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
    default:
      return 'ℹ'
  }
}

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast"
          style={{
            borderColor: getToastColor(toast.type),
            backgroundColor: 'var(--terminal-bg)',
          }}
        >
          <span
            className="toast-icon"
            style={{ color: getToastColor(toast.type) }}
          >
            {getToastIcon(toast.type)}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
