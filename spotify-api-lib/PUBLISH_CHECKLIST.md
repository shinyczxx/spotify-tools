# Pre-Publication Checklist

Complete this checklist before publishing to npm:

## ✅ Package Preparation (Done)
- [x] Comprehensive README.md with examples
- [x] MIT License file
- [x] Optimized package.json for npm
- [x] .npmignore to exclude unnecessary files
- [x] CHANGELOG.md for version tracking
- [x] CONTRIBUTING.md for contributors
- [x] Build process verified and working

## 🔧 Before Publishing

### 1. Update Package Details
- [ ] Update GitHub URLs in package.json (replace "yourusername")
- [ ] Verify author information is correct
- [ ] Check if "spotify-api-lib" name is available on npm
- [ ] Consider scoped package name like `@yourusername/spotify-api-lib`

### 2. Create GitHub Repository
- [ ] Create public GitHub repository
- [ ] Push code to GitHub
- [ ] Add repository description
- [ ] Add topics/tags for discoverability

### 3. Final Testing
- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` (if applicable)
- [ ] Test importing in a sample project
- [ ] Verify TypeScript types work correctly

### 4. Package Publication
- [ ] Login to npm: `npm login`
- [ ] Check package contents: `npm pack --dry-run`
- [ ] Publish: `npm publish` (or `npm publish --access=public` for scoped)
- [ ] Verify package on npmjs.com

### 5. Post-Publication
- [ ] Update album-shuffle project to use npm package
- [ ] Remove fallback build configuration
- [ ] Update documentation
- [ ] Create GitHub release/tag

## Quick Commands

```bash
# Check what will be published
npm pack --dry-run

# Login to npm
npm login

# Publish package
npm publish --access=public

# For scoped packages
npm publish --access=public
```

## Package Name Suggestions

If "spotify-api-lib" is taken, consider:
- `@yourusername/spotify-api-lib`
- `spotify-web-api-ts` 
- `modern-spotify-api`
- `spotify-api-wrapper`
- `ts-spotify-api`

## Next Steps for album-shuffle-beta

After publishing:
1. Update package.json to use published package
2. Remove file-based dependency
3. Clean up GitHub Actions build process
4. Update documentation