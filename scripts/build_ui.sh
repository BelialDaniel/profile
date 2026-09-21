#!/bin/bash

APP_DIR="/opt/ui"
echo "$APP_DIR init..."

echo "Installing pnpm globally..."
npm install -g pnpm

mkdir -p "$APP_DIR"

if [ ! -f "$APP_DIR/package.json" ]; then
    echo "Creating React Router app"
    npx --yes create-react-router@latest "$APP_DIR" \
        --yes \
        --template remix-run/react-router-templates/default \
        --no-git-init \
        --no-install \
        --no-agent-skills \
        --package-manager pnpm
fi

cd "$APP_DIR"

echo "Installing dependencies with pnpm"
pnpm install

echo "Running dev server with pnpm"
pnpm dev --host 0.0.0.0
