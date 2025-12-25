#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Restarting services with rebuild (minimal downtime)..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found. Please run setup.sh first."
  echo "Usage: ./setup.sh <domain_name>"
  exit 1
fi

# Load environment variables
source .env

# Build images first (while services are still running)
echo "Building images..."
docker compose build

# Stop and restart with new images
echo "Restarting with new images..."
if [ "$USE_WEBSERVER" = "false" ]; then
  docker compose up -d --force-recreate
else
  docker compose --profile with-webserver up -d --force-recreate
fi

echo "Services restarted with rebuilt images. You can monitor logs with: docker compose logs -f"
