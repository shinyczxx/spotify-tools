# Development Setup

## Prerequisites

- Node.js 20+
- npm

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `cd client && npm run dev`

## Private Dependencies

This project uses some private dependencies that are not publicly available:

### spotify-api-lib
- **Private repository** - Contains the Spotify API wrapper
- If you don't have access, the build will create fallback stubs
- For full functionality, you'll need to implement your own Spotify API calls

### lastfm-api-lib
- **Optional** - Contains Last.fm integration
- The app will work without this dependency

## Build Process

The GitHub Actions workflow automatically handles missing private dependencies by creating fallback packages. This ensures the project can build for any user, even without access to private repositories.

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=https://your-domain.com/callback
```

## Custom Domain Setup

For GitHub Pages with custom domains:
1. Update `VITE_SPOTIFY_REDIRECT_URI` to use your domain
2. Configure your domain in GitHub Pages settings
3. Update Spotify app settings to allow your callback URL