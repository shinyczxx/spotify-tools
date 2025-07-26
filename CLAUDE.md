# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design Guidelines
- see DESIGN_GUIDELINES.md

## Development Commands

**Root Level Commands:**
- `npm run dev` - Start development server (runs client dev server)
- `npm run build` - Build for production 
- `npm run install-all` - Install all dependencies across monorepo
- `npm run prepare-deploy` - Full install and build for deployment

**Client Commands (cd client):**
- `npm run dev` - Vite dev server on http://127.0.0.1:5175
- `npm run build` - Production build with Vite
- `npm run lint` - ESLint validation
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Jest in watch mode
- `npm run test:coverage` - Jest with coverage report
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - Playwright end-to-end tests
- `npm run test:e2e:ui` - Playwright with UI mode

**Library Commands:**
- spotify-api-lib: `npm run build`, `npm run test`, `npm run lint`
- lastfm-api-lib: `npm run build`,

## Architecture Overview

This is a React-based Spotify Web API client with a monorepo structure containing:

**Main Application (`client/`):**
- React 19 + TypeScript + Vite frontend
- Spotify OAuth integration for playlist management and album shuffling
- Last.fm integration for enhanced metadata

**Libraries:**
- `spotify-api-lib/` - Custom Spotify Web API wrapper with TypeScript
- `lastfm-api-lib/` - Last.fm API integration library  

**Key Directories:**
- `client/src/components/` - React components including wireframe UI system
- `client/src/hooks/` - Custom React hooks for auth, data, and UI
- `client/src/utils/` - Business logic utilities for album operations, API calls
- `client/src/pages/` - Route components (Dashboard, Login, Settings, etc.)
- `client/src/types/` - TypeScript type definitions
- `types/` - Shared types across the monorepo

## Key Technical Details

**Build System:**
- Vite for frontend with React plugin
- tsup for library builds (ESM/CJS dual output)
- GitHub Pages deployment with custom domain support

**Testing:**
- Jest for unit/integration tests with jsdom environment
**Environment:**
- `VITE_SPOTIFY_CLIENT_ID` - Spotify app client ID (required)
- `VITE_SPOTIFY_REDIRECT_URI` - OAuth redirect URI
- `VITE_LASTFM_API_KEY`
- `VITE_LASTFM_API_SECRET`

**Path Aliases (client):**
- `@components`, `@utils`, `@pages`, `@hooks`, `@types`, `@assets`, `@config`, `@styles`
- `types` - Points to shared types directory

## Development Workflow

1. Use `npm run install-all` for initial setup
2. Start development with `npm run dev` from root
3. Always run `npm run lint` and `npm run type-check` before commits
4. Test with appropriate test commands based on changes
5. Build libraries before client if modifying shared code

## API Considerations

- Spotify Audio_Features and Audio_Analysis endpoints no longer exist, never use them 