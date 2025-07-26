# Design Guidelines & Development Standards

This document provides comprehensive guidelines for development within the spotify-tools codebase. **All development must follow these standards consistently.**

## Core Development Principles

### Communication Standards
- **Do not respond with chat unless necessary, except for todo lists**
- **If asked for something 2 times with similar intent, think through the issue and really understand the prompt before changing**
- **Always ask for clarification if you do not 95% understand the request**
- Use concise, direct communication
- Focus on implementation over explanation

### Code Quality Standards
- **Ensure all code has comments to help users and AI navigate and understand**
- **Always examine how changes would affect any other file that uses or is used by the changed file**
- **Always check indices for needed updates after creating/removing/moving files and dirs**
- Follow existing code patterns and conventions
- Maintain consistent formatting and structure

## Styling & UI Guidelines

### CSS & Styling
- **Never use inline styles, always use CSS**
- **All colors must be global CSS variables compatible with the settings color selector**
- **Re-use existing CSS variables where logical**
- Use CSS modules or component-specific CSS files
- Follow the circuit board/terminal aesthetic
- Maintain responsive design principles

### Display Elements
- **Never add emojis to display elements**
- Maintain consistent visual hierarchy
- Follow wireframe component patterns

## Code Organization & Architecture

### Import Standards
- **Always use aliases for imports if not in the current directory**
- Use path aliases: `@components`, `@utils`, `@pages`, `@hooks`, `@types`, `@assets`, `@config`, `@styles`
- Use `types` alias for shared types directory
- Prefer absolute imports over relative for better maintainability

### File Structure & Reusability
- **Always use the global types dir for types**
- **Use src components, data, hooks, styles, and utils if the function/component would likely be reused elsewhere**
- Place component-specific files in component directories
- Use descriptive, consistent naming conventions
- Maintain clear separation of concerns

### Type Safety
- Use TypeScript interfaces and types consistently
- Define types in the global types directory for shared interfaces
- Maintain strict type checking standards
- Document complex type definitions

## Component Development

### Component Standards
- Use functional components with hooks
- Implement proper prop validation
- Follow consistent component structure:
  - Imports
  - Types/Interfaces
  - Component definition
  - Export
- Use React.FC for component typing

### State Management
- Use appropriate hooks for state management
- Implement proper cleanup in useEffect
- Handle loading and error states consistently
- Use context for global state when appropriate

## Testing & Quality Assurance

### Testing Requirements
- Always run lint and type-check commands before commits
- Test components for basic functionality
- Ensure responsive behavior across device sizes
- Validate accessibility requirements

### Error Handling
- Implement proper error boundaries
- Handle API failures gracefully
- Provide meaningful error messages
- Log errors appropriately for debugging

## API & Data Management

### API Integration
- Use the spotify-api-lib consistently
- Implement proper caching strategies
- Handle rate limiting and API errors
- Use TypeScript interfaces for API responses

### Spotify API Response Structures

**IMPORTANT**: Avoid unnecessary API calls by understanding what data is included in each response:

#### Album Object (GET /albums/{id})
- **Includes tracks by default** - No need for separate `/albums/{id}/tracks` call
- Structure: `album.tracks.items[]` contains:
  - `id`, `name`, `track_number`, `disc_number`
  - `duration_ms`, `explicit`, `preview_url`
  - `artists[]` (simplified), `available_markets[]`
  - `uri`, `is_local`

#### Track Object (GET /tracks/{id})
- **Includes full album object** - No need for separate `/albums/{id}` call
- Structure: `track.album` contains:
  - `album_type` ("album", "single", "compilation")
  - `total_tracks`, `release_date`, `images[]`
  - `id`, `name`, `uri`, `artists[]`

#### Artist Object (GET /artists/{id})
- **Does NOT include albums/tracks** - Separate calls needed:
  - `/artists/{id}/albums` for artist's albums
  - `/artists/{id}/top-tracks` for popular tracks
- Contains: `id`, `name`, `popularity`, `genres[]`, `images[]`, `followers`

#### Playlist Object (GET /playlists/{id})
- **Includes track items by default** - No need for separate `/playlists/{id}/tracks` call
- Structure: `playlist.tracks.items[]` contains:
  - `added_at`, `added_by`, `is_local`
  - `track` object (full track with album data)

### Data Flow
- Follow unidirectional data flow patterns
- Use proper prop drilling or context for data sharing
- Implement optimistic updates where appropriate
- Cache API responses to reduce unnecessary calls

## Performance Guidelines

### Optimization Standards
- Implement proper memoization (React.memo, useMemo, useCallback)
- Avoid unnecessary re-renders
- Use lazy loading for large components
- Optimize bundle size with proper imports

### Caching Strategy
- Cache API responses in localStorage when appropriate
- Implement cache invalidation strategies
- Use session storage for temporary data
- Consider memory usage in caching decisions

## Security & Best Practices

### Security Standards
- Never expose API keys or secrets in client code
- Implement proper input validation
- Use secure storage for sensitive data
- Follow OAuth best practices for Spotify integration

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation support
- Maintain sufficient color contrast

## Development Workflow

### Code Review Standards
- Review impact on dependent files
- Check for adherence to these guidelines
- Validate TypeScript compliance
- Test functionality across browsers

### Documentation Requirements
- Comment complex logic and algorithms
- Document component props and usage
- Maintain README files for major features
- Update this design doc when patterns change

## File Naming & Organization

### Naming Conventions
- Use PascalCase for React components
- Use camelCase for functions and variables
- Use kebab-case for CSS classes and files
- Use SCREAMING_SNAKE_CASE for constants

### Directory Structure
```
client/src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── utils/         # Business logic utilities
├── styles/        # Global and animation styles
├── types/         # TypeScript type definitions
├── data/          # Static data and configurations
└── assets/        # Images, icons, and media
```

## Circuit Board UI System

### Design Principles
- Maintain 12x8 responsive grid layout
- Use animated circuit traces between components
- Implement perpendicular connection routing (Manhattan-style paths)
- Include solder point indicators on panel edges
- Apply CRT overlay effects and terminal typography
- Use debug object at `window.__CIRCUIT_DEBUG__` for geometry validation

### Color System
Use existing CSS variables:
- `--terminal-cyan` - Primary accent color
- `--terminal-bg` - Background color
- `--terminal-medium` - Secondary elements
- `--terminal-cyan-bright` - Hover states
- `--glow-cyan` - Glow effects

## Git & Version Control

### Commit Standards
- Use conventional commit messages
- Reference issue numbers when applicable
- Include co-author attribution for AI assistance
- Keep commits focused and atomic

### Branch Management
- Use feature branches for new development
- Follow the established branching strategy
- Keep the main branch stable
- Use descriptive branch names

---

**This document is a living standard and should be updated as the codebase evolves. All developers must familiarize themselves with these guidelines and apply them consistently.**