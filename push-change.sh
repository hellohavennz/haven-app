#!/bin/bash
# Quick push helper for Haven project

MSG=${1:-"chore: quick update"}

echo "📦 Adding all changes..."
git add .

echo "📝 Commit message: $MSG"
git commit -m "$MSG"

echo "🚀 Pushing to main..."
git push origin main

echo "✅ Done!"
