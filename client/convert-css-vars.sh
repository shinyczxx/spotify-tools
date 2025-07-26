#!/bin/bash

# Script to convert terminal-specific CSS variables to generic theme variables

# Color mappings
declare -A color_mappings=(
    ["--terminal-cyan"]="--primary"
    ["--terminal-cyan-bright"]="--primary-bright"
    ["--terminal-cyan-dim"]="--primary-dim"
    ["--terminal-cyan-dark"]="--primary-dark"
    ["--terminal-bg"]="--background"
    ["--terminal-dark"]="--background-dark"
    ["--terminal-medium"]="--background-medium"
    ["--terminal-border"]="--border"
    ["--text-white"]="--text-primary"
    ["--text-dim"]="--text-secondary"
    ["--text-cyan"]="--text-accent"
    ["--terminal-error"]="--error"
    ["--terminal-error-border"]="--error-border"
    ["--terminal-error-bg"]="--error-background"
    ["--terminal-green"]="--success"
    ["--terminal-orange"]="--warning"
    ["--terminal-red"]="--danger"
    ["--terminal-red-bright"]="--danger-bright"
    ["--terminal-red-dim"]="--danger-dim"
    ["--terminal-gray-dim"]="--text-secondary"
    ["--grid-color"]="--grid"
    ["--grid-glitch-color"]="--grid-glitch"
)

# Effect mappings
declare -A effect_mappings=(
    ["--glow-cyan"]="--glow-primary"
    ["--glow-cyan-bright"]="--glow-primary-bright"
    ["--glow-error"]="--glow-error"
    ["--wireframe-box-shadow"]="--box-shadow"
    ["--wireframe-box-shadow-hover"]="--box-shadow-hover"
)

# Function to replace variables in a file
replace_in_file() {
    local file="$1"
    local backup_file="${file}.backup"
    
    # Create backup
    cp "$file" "$backup_file"
    
    # Replace color variables
    for old_var in "${!color_mappings[@]}"; do
        new_var="${color_mappings[$old_var]}"
        sed -i "s|${old_var}|${new_var}|g" "$file"
    done
    
    # Replace effect variables
    for old_var in "${!effect_mappings[@]}"; do
        new_var="${effect_mappings[$old_var]}"
        sed -i "s|${old_var}|${new_var}|g" "$file"
    done
    
    echo "Updated: $file"
}

# Find all CSS files and replace variables
echo "Converting CSS variables to generic theme variables..."

find ./src -name "*.css" -type f | while read -r file; do
    replace_in_file "$file"
done

echo "Conversion complete!"
echo "Backup files created with .backup extension"
echo "Run 'find ./src -name \"*.backup\" -delete' to remove backups"