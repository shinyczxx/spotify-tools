# 🎵 Spotify Tools

A React-based web application for discovering and shuffling Spotify albums with advanced filtering and Last.fm integration.

[![Deploy to GitHub Pages](https://github.com/yourusername/spotify-tools/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/yourusername/spotify-tools/actions)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://yourusername.github.io/spotify-tools/)

## ✨ Features

- 🎲 **Smart Album Shuffling** - Discover new albums from your Spotify library
- 🔍 **Advanced Filtering** - Filter by genre, year, popularity, and more
- 📊 **Last.fm Integration** - Enhanced metadata and recommendations
- 🎨 **Terminal Aesthetic** - Retro CRT-style interface with animations
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **GitHub Pages Ready** - Static deployment with no server required

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Spotify Developer Account
- Last.fm API Key (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spotify-tools.git
   cd spotify-tools
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cd client
   cp .env.production .env.local
   # Edit .env.local with your Spotify Client ID
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open** http://127.0.0.1:5175

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://127.0.0.1:5175/callback` (for local development)
4. Copy your Client ID to the environment variables

## 🏗️ Project Structure

```
spotify-tools/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── pages/           # Route components
│   │   └── types/           # TypeScript definitions
│   ├── dist/               # Build output (for deployment)
│   └── package.json
├── spotify-api-lib/          # Spotify API wrapper library
├── lastfm-api-lib/          # Last.fm API wrapper library  
├── pcb-design-lib/          # PCB design component library
├── .github/workflows/       # GitHub Actions deployment
└── package.json
```

## 🎨 Architecture

### Frontend Stack
- **React 19** - Modern UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing

### API Libraries
- **spotify-api-lib** - Custom Spotify Web API wrapper
- **lastfm-api-lib** - Last.fm integration for metadata
- **pcb-design-lib** - Component library for the terminal aesthetic

### Deployment
- **GitHub Pages** - Static hosting
- **GitHub Actions** - Automated build and deployment
- **Vite Build** - Optimized production bundles

## 🛠️ Development Scripts

```bash
# Root level commands
npm run dev              # Start development server
npm run build           # Build for production
npm run install-all     # Install all dependencies
npm run deploy          # Build and prepare for deployment

# Client specific commands
cd client
npm run dev             # Vite dev server
npm run build          # Production build
npm run preview        # Preview production build
npm run test           # Run tests
npm run lint           # ESLint
npm run type-check     # TypeScript checking
```

## 🚀 Deployment

### Automatic Deployment (GitHub Pages)

1. **Fork/Clone this repository**

2. **Set up GitHub Secrets**
   - Go to Settings → Secrets and variables → Actions
   - Add: `VITE_SPOTIFY_CLIENT_ID`
   - Add: `VITE_SPOTIFY_REDIRECT_URI`

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: "GitHub Actions"

4. **Update Spotify App Settings**
   - Add redirect URI: `https://yourusername.github.io/spotify-tools/callback`

5. **Push to main branch** - Automatic deployment!

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the client/dist folder to your hosting provider
```

## 🎯 Key Components

### Album Shuffle Modal
Advanced shuffling interface with customizable filters:
- Track count limits
- Release date ranges  
- Popularity filters
- Genre exclusions

### Playlist Selector
Universal component for browsing Spotify content:
- Thumbnail previews
- Sortable columns
- Pagination
- Search functionality

### Terminal Aesthetic
Retro CRT-style interface elements:
- Wireframe components
- CRT overlay effects
- Terminal-inspired typography
- Animated loading states

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SPOTIFY_CLIENT_ID` | Spotify app client ID | Required |
| `VITE_SPOTIFY_REDIRECT_URI` | OAuth redirect URI | `http://127.0.0.1:5175/callback` |

### Vite Configuration

The app is configured for GitHub Pages deployment with:
- Base path: `/album-shuffle/`
- Asset optimization
- Code splitting
- TypeScript path aliases

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
npm run test:e2e           # End-to-end tests

# Coverage report
npm run test:coverage
```

## 📚 Documentation

- [Deployment Guide](./deploy.md) - Detailed deployment instructions
- [API Documentation](./aiDocs/) - Technical documentation
- [Component Library](./client/src/components/) - React component reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spotify Web API for music data
- Last.fm for enhanced metadata
- React and Vite teams for excellent developer tools
- GitHub Pages for free static hosting

---

**Live Demo:** https://yourusername.github.io/spotify-tools/

**Issues:** https://github.com/yourusername/spotify-tools/issues

**Discussions:** https://github.com/yourusername/spotify-tools/discussions