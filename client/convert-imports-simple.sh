#!/bin/bash

# Simple version to convert imports to use index files
set -e

echo "🔄 Converting imports to use index files..."

# Process App.tsx first as the main example
echo "Processing App.tsx..."

# Update App.tsx to use index imports
if [ -f "src/App.tsx" ]; then
    echo "  Updating App.tsx imports..."
    
    # Create backup
    cp src/App.tsx src/App.tsx.backup
    
    # Replace the page imports with a single import from pages
    sed -i '/^import Dashboard from/d' src/App.tsx
    sed -i '/^import GetTrackInfo from/d' src/App.tsx  
    sed -i '/^import Login from/d' src/App.tsx
    sed -i '/^import PlaylistTools from/d' src/App.tsx
    sed -i '/^import LastFmTools from/d' src/App.tsx
    sed -i '/^import Settings from/d' src/App.tsx
    sed -i '/^import CallbackPage from/d' src/App.tsx
    
    # Add the new import after the other imports
    sed -i '/^import { ROUTES } from/a import { Dashboard, GetTrackInfo, Login, PlaylistTools, LastFmTools, Settings, CallbackPage } from '\''./pages'\''' src/App.tsx
    
    # Replace PageLayout import
    sed -i 's|import PageLayout from '\''./components/PageLayout/PageLayout'\''|import { PageLayout } from '\''./components'\''|g' src/App.tsx
    
    echo "  ✅ Updated App.tsx"
else
    echo "  ⚠️ App.tsx not found"
fi

# Check if changes look good
if [ -f "src/App.tsx" ]; then
    echo ""
    echo "🔍 Preview of updated imports in App.tsx:"
    grep -n "^import.*from.*pages\|^import.*PageLayout" src/App.tsx || echo "  (no matching imports found)"
fi

echo ""
echo "✅ Basic conversion completed!"
echo ""
echo "🔧 To apply this to more files, you can:"
echo "1. Check App.tsx to verify the changes look correct"
echo "2. Run 'npm run type-check' to see if there are any issues"
echo "3. Manually apply similar patterns to other files"