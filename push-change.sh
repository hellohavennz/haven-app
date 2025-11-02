#!/bin/bash
# Quick push helper for Haven project

BRANCH=${1:-"auto-update"}
MSG=${2:-"chore: quick update from ChatGPT"}

echo "🔄 Checking current branch..."
git checkout -B "$BRANCH"

echo "📦 Adding all changes..."
git add .

echo "📝 Commit message: $MSG"
git commit -m "$MSG"

echo "🚀 Pushing to remote branch '$BRANCH'..."
git push -u origin "$BRANCH"

echo "✅ Done. Open this URL to create a pull request:"
echo "   https://github.com/hellohavennz/haven-app/pull/new/$BRANCH"
