# Contributing to spotify-api-lib

Thank you for your interest in contributing to spotify-api-lib! This document provides guidelines and information for contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spotify-api-lib.git
   cd spotify-api-lib
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Project Structure

```
src/
├── index.ts          # Main exports
├── main.ts           # SpotifyApi class
├── httpClient.ts     # HTTP client wrapper
├── types.ts          # TypeScript interfaces
├── baseEndpoint.ts   # Base endpoint class
└── endpoints/        # API endpoint implementations
    ├── albums.ts
    ├── artists.ts
    ├── player.ts
    ├── playlists.ts
    ├── search.ts
    ├── tracks.ts
    └── user.ts
```

## Code Style

- Use TypeScript for all code
- Follow existing code style and patterns
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions focused and small

## Adding New Endpoints

1. **Create endpoint file** in `src/endpoints/`
2. **Extend BaseEndpoint** class
3. **Add proper TypeScript types**
4. **Export from main files**
5. **Add to SpotifyApi class**
6. **Update documentation**

Example:
```typescript
// src/endpoints/example.ts
import { BaseEndpoint } from '../baseEndpoint';
import type { SpotifyExample } from '../types';

export class ExampleEndpoints extends BaseEndpoint {
  async getExample(id: string): Promise<SpotifyExample> {
    return this.get(`/example/${id}`);
  }
}
```

## Testing

- Write tests for new functionality
- Ensure existing tests pass
- Test both TypeScript compilation and runtime behavior

## Documentation

- Update README.md for new features
- Add JSDoc comments to public methods
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch from `main`
3. **Make** your changes with tests
4. **Ensure** all tests pass and code builds
5. **Update** documentation as needed
6. **Submit** a pull request

## Issues

When reporting issues:
- Use clear, descriptive titles
- Provide steps to reproduce
- Include relevant code examples
- Specify Node.js and library versions

## Code of Conduct

Please be respectful and constructive in all interactions. This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.