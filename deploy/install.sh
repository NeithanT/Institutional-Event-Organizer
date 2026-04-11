#!/usr/bin/env bash
set -euo pipefail

# Install script for Amazon Linux (EC2) to build frontend and start docker-compose stack
# Run from repository root: `sudo bash deploy/install.sh`

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

echo "==> Updating system and installing Docker..."
if command -v yum >/dev/null 2>&1; then
  sudo yum update -y
  sudo amazon-linux-extras enable docker || true
  sudo yum install -y docker || sudo yum install -y docker-engine
else
  echo "Unsupported package manager. Please install Docker manually." && exit 1
fi

echo "==> Starting Docker..."
sudo systemctl enable --now docker
sudo usermod -aG docker "$SUDO_USER" || true

echo "==> Installing docker-compose (standalone)..."
DOCKER_COMPOSE=/usr/local/bin/docker-compose
if [ ! -f "$DOCKER_COMPOSE" ]; then
  DC_VER=2.22.0
  sudo curl -L "https://github.com/docker/compose/releases/download/v${DC_VER}/docker-compose-linux-x86_64" -o "$DOCKER_COMPOSE"
  sudo chmod +x "$DOCKER_COMPOSE"
fi

echo "==> Building frontend inside a Node container..."
# use a node container to avoid installing node on host
sudo docker run --rm -u $(id -u):$(id -g) -v "$REPO_ROOT/frontend":/src -w /src node:18 bash -lc "npm ci && npm run build -- --configuration production"

echo "==> Preparing nginx static folder for container"
mkdir -p "$REPO_ROOT/deploy/nginx/html"
rm -rf "$REPO_ROOT/deploy/nginx/html"/* || true
cp -r "$REPO_ROOT/frontend/dist"/* "$REPO_ROOT/deploy/nginx/html/"

echo "==> Bringing up docker-compose stack"
cd "$REPO_ROOT/deploy"
if command -v docker-compose >/dev/null 2>&1; then
  sudo docker-compose up -d --build
else
  sudo docker compose up -d --build
fi

echo "==> Deployment complete."
echo "Point your domain to this server's IP and (optionally) run certbot on the host to obtain TLS certificates and mount them into the nginx container."
