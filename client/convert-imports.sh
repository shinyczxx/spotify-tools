#!/bin/bash

# Convert all imports to use index files (barrel exports)
# This script updates imports throughout the codebase to use cleaner barrel export patterns

set -e

echo "🔄 Converting imports to use index files..."

# Define the source directory
SRC_DIR="./src"

# Find all TypeScript and JavaScript files
find_source_files() {
    find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -name "*.test.*" ! -name "*.spec.*"
}

# Function to update imports in a file
update_file_imports() {
    local file="$1"
    local temp_file="$file.tmp"
    
    # Create a backup
    cp "$file" "$temp_file"
    
    # Convert page imports
    sed -i "s|import Dashboard from './pages/Dashboard'|import { Dashboard } from './pages'|g" "$file"
    sed -i "s|import PlaylistTools from './pages/PlaylistTools'|import { PlaylistTools } from './pages'|g" "$file"
    sed -i "s|import LastFmTools from './pages/LastFmTools'|import { LastFmTools } from './pages'|g" "$file"
    sed -i "s|import Settings from './pages/Settings'|import { Settings } from './pages'|g" "$file"
    sed -i "s|import Login from './pages/Login'|import { Login } from './pages'|g" "$file"
    sed -i "s|import GetTrackInfo from './pages/GetTrackInfo'|import { GetTrackInfo } from './pages'|g" "$file"
    sed -i "s|import CallbackPage from './pages/CallbackPage'|import { CallbackPage } from './pages'|g" "$file"
    
    # Convert component imports - using @ aliases
    sed -i "s|import { \([^}]*\) } from '@components/\([^']*\)/\([^']*\)'|import { \1 } from '@components'|g" "$file"
    sed -i "s|import \([A-Za-z][A-Za-z0-9]*\) from '@components/\([^']*\)/\([^']*\)'|import { \1 } from '@components'|g" "$file"
    
    # Convert relative component imports
    sed -i "s|import { \([^}]*\) } from '\.\./components/\([^']*\)/\([^']*\)'|import { \1 } from '@components'|g" "$file"
    sed -i "s|import \([A-Za-z][A-Za-z0-9]*\) from '\.\./components/\([^']*\)/\([^']*\)'|import { \1 } from '@components'|g" "$file"
    sed -i "s|import { \([^}]*\) } from '\./components/\([^']*\)/\([^']*\)'|import { \1 } from '@components'|g" "$file"
    sed -i "s|import \([A-Za-z][A-Za-z0-9]*\) from '\./components/\([^']*\)/\([^']*\)'|import { \1 } from '@components'|g" "$file"
    
    # Convert PageLayout specific imports
    sed -i "s|import PageLayout from './components/PageLayout/PageLayout'|import { PageLayout } from '@components'|g" "$file"
    
    # Convert wireframe imports to use the main wireframe export
    sed -i "s|import { \([^}]*\) } from '@components/wireframe/\([^']*\)'|import { \1 } from '@components/wireframe'|g" "$file"
    sed -i "s|import { \([^}]*\) } from '\.\./wireframe/\([^']*\)'|import { \1 } from '@components/wireframe'|g" "$file"
    sed -i "s|import { \([^}]*\) } from '\./wireframe/\([^']*\)'|import { \1 } from '@components/wireframe'|g" "$file"
    
    # Check if file was actually changed
    if ! diff -q "$file" "$temp_file" > /dev/null 2>&1; then
        echo "  ✅ Updated: $file"
    fi
    
    # Remove temp file
    rm "$temp_file"
}

# Function to merge multiple component imports from the same module
merge_component_imports() {
    local file="$1"
    local temp_file="$file.tmp"
    
    # Use Python to merge imports properly
    python3 -c "
import re
import sys

# Read the file
with open('$file', 'r') as f:
    content = f.read()

# Find all @components imports
component_imports = re.findall(r'import\s+{([^}]+)}\s+from\s+['\''\"]\@components['\''\"]\s*;?', content)
wireframe_imports = re.findall(r'import\s+{([^}]+)}\s+from\s+['\''\"]\@components/wireframe['\''\"]\s*;?', content)

if len(component_imports) > 1:
    # Merge all component imports
    all_imports = []
    for imp in component_imports:
        all_imports.extend([item.strip() for item in imp.split(',')])
    
    # Remove duplicates while preserving order
    seen = set()
    unique_imports = []
    for item in all_imports:
        if item not in seen:
            seen.add(item)
            unique_imports.append(item)
    
    # Remove all existing @components imports
    content = re.sub(r'import\s+{[^}]+}\s+from\s+['\''\"]\@components['\''\"]\s*;?\n?', '', content)
    
    # Add the merged import at the top after other imports
    merged_import = 'import { ' + ', '.join(unique_imports) + ' } from \\'@components\\'\n'
    
    # Find a good place to insert (after existing imports)
    import_match = re.search(r'(import.*from.*['\''\"]\n)+', content)
    if import_match:
        insert_pos = import_match.end()
        content = content[:insert_pos] + merged_import + content[insert_pos:]
    else:
        content = merged_import + content

if len(wireframe_imports) > 1:
    # Merge all wireframe imports
    all_wireframe = []
    for imp in wireframe_imports:
        all_wireframe.extend([item.strip() for item in imp.split(',')])
    
    # Remove duplicates
    seen = set()
    unique_wireframe = []
    for item in all_wireframe:
        if item not in seen:
            seen.add(item)
            unique_wireframe.append(item)
    
    # Remove all existing wireframe imports
    content = re.sub(r'import\s+{[^}]+}\s+from\s+['\''\"]\@components/wireframe['\''\"]\s*;?\n?', '', content)
    
    # Add the merged wireframe import
    merged_wireframe = 'import { ' + ', '.join(unique_wireframe) + ' } from \\'@components/wireframe\\'\n'
    
    # Find a good place to insert
    import_match = re.search(r'(import.*from.*['\''\"]\n)+', content)
    if import_match:
        insert_pos = import_match.end()
        content = content[:insert_pos] + merged_wireframe + content[insert_pos:]
    else:
        content = merged_wireframe + content

# Write back to file
with open('$file', 'w') as f:
    f.write(content)
"
}

# Main conversion process
main() {
    local file_count=0
    local updated_count=0
    
    echo "📁 Scanning for TypeScript/JavaScript files..."
    
    # Process each file using a different approach
    while IFS= read -r file; do
        ((file_count++))
        
        # Skip if file doesn't exist (race condition protection)
        [[ -f "$file" ]] || continue
        
        # Skip index files themselves
        if [[ "$file" == *"/index.ts" ]] || [[ "$file" == *"/index.tsx" ]]; then
            continue
        fi
        
        echo "  Processing: $file"
        
        # Update imports
        local before_size=$(wc -c < "$file")
        update_file_imports "$file"
        merge_component_imports "$file"
        local after_size=$(wc -c < "$file")
        
        # Check if file was modified
        if [[ "$before_size" != "$after_size" ]]; then
            ((updated_count++))
        fi
        
    done < <(find_source_files)
    
    # Summary
    echo ""
    echo "📊 Conversion Summary:"
    echo "  Files processed: $file_count"
    echo "  Files updated: $updated_count"
    echo ""
    
    if [[ $updated_count -gt 0 ]]; then
        echo "✅ Import conversion completed successfully!"
        echo ""
        echo "🔍 Next steps:"
        echo "  1. Run 'npm run type-check' to verify TypeScript compilation"
        echo "  2. Run 'npm run lint' to check for any linting issues"
        echo "  3. Run 'npm run dev' to test the application"
    else
        echo "ℹ️  No files needed updating - imports may already be optimized"
    fi
}

# Check if we're in the right directory
if [[ ! -d "$SRC_DIR" ]]; then
    echo "❌ Error: src directory not found. Please run this script from the client directory."
    exit 1
fi

# Check for required tools
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is required for import merging"
    exit 1
fi

# Run the main function
main