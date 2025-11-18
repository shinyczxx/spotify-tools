/**
 * @file ErrorBoundary.tsx
 * @description Error boundary component to catch React errors
 * @author Code Review Implementation
 * @version 1.0.0
 * @date 2025-11-18
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'var(--terminal-bg, #000811)',
            color: 'var(--terminal-red, #ff0000)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              border: '2px solid var(--terminal-cyan, #00ffff)',
              backgroundColor: 'transparent',
              color: 'var(--terminal-cyan, #00ffff)',
              cursor: 'pointer',
              fontSize: '1em',
              fontFamily: 'inherit',
            }}
          >
            Refresh Page
          </button>
          {this.state.error && import.meta.env.DEV && (
            <details
              style={{
                marginTop: '40px',
                textAlign: 'left',
                maxWidth: '800px',
                width: '100%',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Error details (dev mode only)
              </summary>
              <pre
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '20px',
                  overflow: 'auto',
                  fontSize: '0.9em',
                  border: '1px solid var(--terminal-red, #ff0000)',
                }}
              >
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
