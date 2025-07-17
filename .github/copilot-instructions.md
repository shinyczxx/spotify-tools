# Copilot Debugging Instructions: Circuit Board UI

## Overview

This project uses a global debug object to expose all panel and path data for the circuit board UI. This enables robust, pixel-perfect overlays, accurate path tracing, and easy debugging of all panel and connection geometry.

## Debug Object

- The debug object is available at `window.__CIRCUIT_DEBUG__` in the browser console (development mode).
- It is also logged via `console.debug('CIRCUIT DEBUG:', ...)` on every render of the circuit board.
- The object contains:
  - `panels`: All displayed panels, keyed by ID, with:
    - `real`: Real DOM corners (from `getBoundingClientRect`)
    - `displayed`: Displayed/layout corners (from layout engine)
  - `paths`: All displayed paths, with:
    - `pathData`: SVG path string
    - `start`/`end`: Connection points (parsed from pathData)
    - `length`: Path length
    - `hasCollision`: Collision flag
  - `timestamp`: ISO string for traceability

## How to Debug

1. Open the browser console.
2. Inspect `window.__CIRCUIT_DEBUG__` for live panel and path data.
3. Use this data to verify:
   - Panel corners match overlays and DOM positions
   - Path start/end points align with solder points and panel edges
   - All geometry is pixel-accurate and matches the design spec
4. For advanced debugging, add breakpoints or log statements in `TraceDrawer.tsx` or `PanelCornersContext.tsx`.

## Best Practices

- Always use the debug object for geometry validation—do not rely on scattered `console.debug` calls.
- If you add new overlays or path logic, update the debug object to include any new geometry or state.
- Keep the debug object structure consistent for easy inspection and future automation.

## References

- See `PanelCornersContext.tsx` for context logic
- See `CircuitBoardPanel.tsx` for panel reporting
- See `TraceDrawer.tsx` for debug object output
- See the design spec in `/designspec.md` for visual and technical requirements

# Circuit Board Animation System Design Specification

Color System: Single accent color (default: #00FFFF) stored in global variable for settings integration
Aesthetic: Clean circuit board/PCB styling with high-tech feel
Background: Dark theme (#001122 grid, #000811 page) with tech-inspired colors
Typography: 14px base font size, cyan accent headings

Grid Layout System

Grid: 12x8 responsive grid with 16px gap, 32px padding
Panels: Variable sizes spanning multiple grid cells
Responsive: Desktop grid layout, mobile stacks vertically with page transitions
Spacing: Maintain margins for "emergency" routing around panels

Connection Animation Rules
Solder Points (Connection Indicators)

Style: Outline circles only (stroke, no fill)
Position: Midpoint sits exactly ON the border edge of panels
Size: 6px radius, 2px stroke width
Color: Uses global circuit color variable

Path Routing Requirements

Perpendicular Approach: Connections MUST approach panel edges perpendicularly
Minimum Distance: 40px minimum straight-line approach to ensure clean entry/exit
Circuit Board Aesthetics: Only horizontal/vertical lines (Manhattan routing)
Right Angles: Clean corners, no diagonal connections
Collision Avoidance: Route around existing panels while maintaining aesthetics

Animation Behavior

Drawing Speed: Accelerate on straight lines, decelerate at corners/turns
Duration: 1500ms for complex paths with multiple waypoints
Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)
Trace Persistence: Circuit traces remain visible after animation completes
Sequential Loading: Multiple panels load sequentially, not simultaneously

Panel Connection States

Solder Point Appears: Outline circle on source panel edge
Path Animation: Trace draws with perpendicular approach waypoints
Destination Approach: Straight line entry into destination solder point
Connection Pulse: Brief pulse effect on successful connection
Panel Glow: Destination panel glows during border drawing
Border Animation: Panel borders draw outward as content appears
Glow Fade: Border glow fades when panel becomes inactive

User Interaction Patterns
Panel States

Clickable Panels: Hover effects (scale 1.02, subtle glow)
Visual Feedback: Clear cursor states, hover messages
Loading States: Scale-in animation with opacity transition
Active States: Maintained glow until deactivated

Animation Reversibility

Unload Animation: Reverse path drawing at faster speed
Dependency Management:

Option changes affecting 2+ panels → unload all dependents
Middle panel only → play "switch load" animation
Last panel only → unload and reload from middle panel

Technical Implementation Notes
Architecture

SVG Overlay: All circuit traces rendered in SVG layer above grid
Path Finding: Enhanced algorithm with perpendicular approach waypoints
State Management: Track active paths, dependencies, animation states
Performance: Hardware acceleration with transform3d, will-change properties

Responsive Design

Desktop: Full grid layout with circuit animations
Mobile: Vertical stack with page transition animations using same circuit aesthetic
Accessibility: Respect prefers-reduced-motion setting

Future Enhancements

Settings Integration: User-configurable circuit color
Advanced Pathfinding: A\* algorithm for complex layouts
Touch Interactions: Mobile-optimized touch targets
Performance: Virtualization for large panel sets

Key Design Principles

Perpendicular Connections: Never approach panels at angles
Visual Hierarchy: Clear distinction between active/inactive states
Circuit Authenticity: Maintain PCB-like routing aesthetics
Smooth Animations: Purposeful motion with proper easing
Responsive Adaptability: Maintain theme across all screen sizes
Performance Focus: Smooth 60fps animations with hardware acceleration

This specification ensures the circuit board theme maintains its technical precision and visual coherence across all implementations.
