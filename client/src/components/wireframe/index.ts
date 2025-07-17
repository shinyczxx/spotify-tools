/**
 * @file index.ts
 * @description Main wireframe components export file (optimized, no backward compatibility)
 * @author GitHub Copilot
 * @version 2.0.0
 * @date 2025-07-08
 */

// Import styles
import './styles/index.css'

// Core components
export * from './WireframeBox'
export * from './WireframePanel'
export * from './WireframeButton'
export * from './WireframeInput'
export * from './WireframeDropdown'

// Specialized components
export * from './WireframeInfoPanel'
export * from './WireframeCheckbox'
export * from './WireframeSelect'
export { default as WireframeToggle } from './WireframeToggle/WireframeToggle'
export * from './WireframeSlider'
export * from './WireframeCheckboxInput'

// External wireframe components (from other directories)
export * from '../TerminalLoader'
