/**
 * @file animations.ts
 * @description Animation manager for controlling performance and accessibility modes
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

export type PerformanceMode = 'full' | 'simple' | 'none'

export class AnimationManager {
  private static instance: AnimationManager
  private currentMode: PerformanceMode = 'full'

  private constructor() {
    // Initialize from localStorage if available
    try {
      const saved = localStorage.getItem('spotify-app-performance-mode')
      if (saved && ['full', 'simple', 'none'].includes(saved)) {
        this.currentMode = saved as PerformanceMode
      }
    } catch (error) {
      console.warn('Failed to load performance mode from localStorage:', error)
    }
  }

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager()
    }
    return AnimationManager.instance
  }

  getCurrentMode(): PerformanceMode {
    return this.currentMode
  }

  getPerformanceMode(): PerformanceMode {
    return this.currentMode
  }

  setPerformanceMode(mode: PerformanceMode): void {
    this.currentMode = mode
    
    // Apply CSS classes to body for mode-based styling
    document.body.classList.remove('perf-full', 'perf-simple', 'perf-none')
    document.body.classList.add(`perf-${mode}`)
    
    // Save to localStorage
    try {
      localStorage.setItem('spotify-app-performance-mode', mode)
    } catch (error) {
      console.warn('Failed to save performance mode to localStorage:', error)
    }

    // Dispatch event for components to react
    window.dispatchEvent(
      new CustomEvent('performance-mode-changed', {
        detail: { mode }
      })
    )
  }

  // Utility methods for checking current mode
  isFullMode(): boolean {
    return this.currentMode === 'full'
  }

  isSimpleMode(): boolean {
    return this.currentMode === 'simple'
  }

  isNoAnimationsMode(): boolean {
    return this.currentMode === 'none'
  }

  // Method to automatically adjust performance based on device capabilities
  autoAdjustPerformance(): void {
    // Basic performance detection
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     (performance as any).memory?.usedJSHeapSize > 50000000

    if (isLowEnd && this.currentMode === 'full') {
      console.log('Detected low-end device, switching to simple animations')
      this.setPerformanceMode('simple')
    }
  }
}

// Initialize the animation manager when the module loads
const animationManager = AnimationManager.getInstance()

// Auto-adjust on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    animationManager.autoAdjustPerformance()
  })
}

export default AnimationManager