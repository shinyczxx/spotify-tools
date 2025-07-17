/**
 * @file animations.ts
 * @description Global animation configuration for circuit board and UI animations.
 * Centralized control for timing, easing, and animation parameters.
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-09
 */

// Animation timing configurations
export const ANIMATION_CONFIG = {
  // Easing functions
  easing: {
    circuitPath: 'cubic-bezier(0.4, 0, 0.2, 1)',
    panelTransition: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    login: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    navbar: 'cubic-bezier(0.23, 1, 0.32, 1)',
    modal: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Duration in milliseconds
  duration: {
    circuitPath: 1200,
    panelSlide: 800,
    loginTransition: 2000,
    navbarSpawn: 600,
    navbarSlide: 1000,
    pageTransition: 400,
    modalOpen: 300,
    modalClose: 200,
    hover: 150,
    click: 100,
    glow: 300,
  },

  // Delay configurations
  delay: {
    loginToNavbar: 500,
    navbarToPanel: 300,
    staggered: 100,
    pathSegment: 200,
  },

  // Circuit path configurations
  circuitPath: {
    strokeWidth: 2,
    glowRadius: 8,
    animationSpeed: 2, // pixels per frame
    cornerRadius: 4,
    rightAngleChance: 0.3, // 30% chance for right angles
    pathComplexity: 'medium', // 'simple' | 'medium' | 'complex'
  },

  // Performance thresholds with new three-tier system
  performance: {
    maxFPS: 60,
    minFPS: 30,
    memoryThresholdMB: 512,
    cpuThreshold: 70,
    autoSimpleModeDelay: 5000, // 5 seconds of poor performance

    // Three-tier performance breakpoints
    thresholds: {
      full: { cpu: 50, memory: 256, fps: 45 },
      simple: { cpu: 70, memory: 512, fps: 30 },
      none: { cpu: 85, memory: 768, fps: 20 },
    },
  },

  // Boot sequence animations
  bootSequence: {
    totalDuration: 3000,
    gridRevealDuration: 1000,
    panelSpawnDelay: 500,
    panelSpawnStagger: 200,
    terminalTextSpeed: 50, // ms per character
    skipIfLoggedIn: false,
  },

  // Login sequence animations
  loginSequence: {
    circuitPathDuration: 2000,
    navbarSpawnDelay: 1500,
    navbarSlideToPosition: 1000,
    dashboardTransitionDelay: 500,
    rightAngleCount: 2,
    pathComplexity: 'medium',
  },

  // CRT effect settings
  crt: {
    scanlineOpacity: 0.1,
    scanlineSpeed: 2,
    glowIntensity: 0.8,
    flickerChance: 0.02,
    curvature: 0.02,
  },

  // Grid background settings
  grid: {
    size: 32, // pixels
    opacity: 0.15,
    glowRadius: 64,
    mouseInfluence: 0.7,
    fadeDistance: 150,
  },
}

// Performance monitoring class
export class PerformanceMonitor {
  private frameCount = 0
  private lastFrameTime = performance.now()
  private fps = 60
  private cpuUsage = 0
  private memoryUsage = 0
  private isRunning = false
  private checkInterval: number | null = null

  onPerformanceChange: ((mode: 'full' | 'simple' | 'none') => void) | null = null

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.measureFPS()

    // Check performance every 2 seconds
    this.checkInterval = window.setInterval(() => {
      this.checkPerformanceThresholds()
    }, 2000)
  }

  stop() {
    this.isRunning = false
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private measureFPS() {
    if (!this.isRunning) return

    const now = performance.now()
    const delta = now - this.lastFrameTime
    this.lastFrameTime = now

    this.frameCount++

    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1000 / delta)
    }

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.memoryUsage = memory.usedJSHeapSize / (1024 * 1024) // Convert to MB
    }

    requestAnimationFrame(() => this.measureFPS())
  }

  private checkPerformanceThresholds() {
    const thresholds = ANIMATION_CONFIG.performance.thresholds

    let recommendedMode: 'full' | 'simple' | 'none' = 'full'

    if (
      this.fps < thresholds.none.fps ||
      this.memoryUsage > thresholds.none.memory ||
      this.cpuUsage > thresholds.none.cpu
    ) {
      recommendedMode = 'none'
    } else if (
      this.fps < thresholds.simple.fps ||
      this.memoryUsage > thresholds.simple.memory ||
      this.cpuUsage > thresholds.simple.cpu
    ) {
      recommendedMode = 'simple'
    }

    if (this.onPerformanceChange) {
      this.onPerformanceChange(recommendedMode)
    }
  }

  getCurrentMetrics() {
    return {
      fps: this.fps,
      memory: this.memoryUsage,
      cpu: this.cpuUsage,
    }
  }
}

// Helper function to get animation styles based on current settings
export const getAnimationStyle = (
  property: string,
  duration: keyof typeof ANIMATION_CONFIG.duration,
  easing: keyof typeof ANIMATION_CONFIG.easing = 'smooth',
  delay = 0,
) => {
  const manager = AnimationManager.getInstance()

  if (!manager.getAnimationsEnabled()) {
    return {
      transition: 'none',
      animation: 'none',
    }
  }

  const performanceMode = manager.getPerformanceMode()
  const durationMs =
    performanceMode === 'simple'
      ? ANIMATION_CONFIG.duration[duration] * 0.5
      : ANIMATION_CONFIG.duration[duration]

  return {
    transition: `${property} ${durationMs}ms ${ANIMATION_CONFIG.easing[easing]} ${delay}ms`,
  }
}

export default ANIMATION_CONFIG

// Animation Manager for performance optimization and browser capability detection
export class AnimationManager {
  private static instance: AnimationManager
  private performanceTier: 'high' | 'medium' | 'low' = 'high'
  private animationsEnabled: boolean = true
  private browserCapabilities: Record<string, boolean> = {}
  private prefersReducedMotion: boolean = false

  private constructor() {}

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager()
    }
    return AnimationManager.instance
  }

  initialize(): void {
    this.detectBrowserCapabilities()
    this.detectPerformanceTier()
    this.checkReducedMotionPreference()
  }

  private detectBrowserCapabilities(): void {
    const testElement = document.createElement('div')

    this.browserCapabilities = {
      supportsTransforms: 'transform' in testElement.style,
      supportsFilters: 'filter' in testElement.style,
      supportsBackdropFilter:
        'backdropFilter' in testElement.style || 'webkitBackdropFilter' in testElement.style,
      supportsAnimations: 'animation' in testElement.style,
      supportsTransitions: 'transition' in testElement.style,
    }
  }

  private detectPerformanceTier(): void {
    // Simple performance detection based on navigator properties
    const connection = (navigator as any).connection
    const hardwareConcurrency = navigator.hardwareConcurrency || 4

    if (connection && connection.effectiveType) {
      if (connection.effectiveType === '4g' && hardwareConcurrency >= 4) {
        this.performanceTier = 'high'
      } else if (connection.effectiveType === '3g' || hardwareConcurrency >= 2) {
        this.performanceTier = 'medium'
      } else {
        this.performanceTier = 'low'
      }
    }

    if (this.prefersReducedMotion) {
      this.performanceTier = 'low'
    }
  }

  private checkReducedMotionPreference(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.prefersReducedMotion = mediaQuery.matches

      mediaQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches
        this.detectPerformanceTier()
      })
    }
  }

  getCurrentTier(): 'high' | 'medium' | 'low' {
    return this.performanceTier
  }

  getAnimationsEnabled(): boolean {
    return this.animationsEnabled && !this.prefersReducedMotion
  }

  getPerformanceMode(): 'complex' | 'simple' | 'minimal' {
    switch (this.performanceTier) {
      case 'high':
        return 'complex'
      case 'medium':
        return 'simple'
      case 'low':
        return 'minimal'
      default:
        return 'simple'
    }
  }

  getBrowserCapabilities(): Record<string, boolean> {
    return { ...this.browserCapabilities }
  }

  setAnimationsEnabled(enabled: boolean): void {
    this.animationsEnabled = enabled
  }

  destroy(): void {
    // Cleanup if needed
  }
}
