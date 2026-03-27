#!/bin/bash

APP_DIR="/opt/ui"
echo "$APP_DIR init..."

echo "Installing pnpm globally..."
npm install -g pnpm

if [ ! -d "$APP_DIR" ]; then
    echo "Creating ui folder $APP_DIR ..."
    mkdir -p $APP_DIR

    echo "Creating ui app"
    npx sv create ui --template minimal --types ts --no-add-ons
fi

cd ui

echo "Installing dependencies with pnpm"
pnpm install

echo "Running dev server with pnpm"
pnpm run dev
