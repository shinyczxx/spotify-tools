# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-01-21

### Improved
- **Enhanced BaseEndpoint class** with convenience methods (`get`, `post`, `put`, `delete`)
- **Robust error handling** with standardized error objects and consistent error messages
- **Advanced retry logic** supporting exponential backoff and multiple retryable HTTP status codes
- **Constructor optimization** using hash table pattern for endpoint initialization
- **Input validation** for API parameters (limit, offset validation)
- **Memory management** with cleanup methods and resource management
- **TypeScript improvements** with better generic types and interfaces

### Added
- Parameter validation utilities
- SpotifyApiError interface for consistent error handling
- Cleanup and destroy methods for proper resource management
- Access token format validation
- Exponential backoff with jitter for rate limiting

### Technical Improvements
- Reduced code duplication in endpoint initialization
- Better separation of concerns in HTTP client
- Improved retry strategies beyond just 429 rate limiting
- More robust error messaging and debugging

## [1.0.0] - 2025-01-21

### Added
- Initial release of spotify-api-lib
- Complete TypeScript wrapper for Spotify Web API
- Organized endpoint categories:
  - Playlists
  - Albums  
  - Tracks
  - Artists
  - Search
  - Player
  - User
- Full type safety with TypeScript interfaces
- Support for both ESM and CommonJS
- Comprehensive documentation and examples
- Zero dependencies (axios as peer dependency)

### Features
- Modern ES6+ syntax
- Dual package support (ESM/CJS)
- Complete API coverage for major Spotify endpoints
- Organized class-based structure
- Full TypeScript support with detailed types