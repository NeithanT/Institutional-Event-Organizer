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
# fallback to `npm install` when package-lock.json is missing
# use Node 22.12 to satisfy Angular CLI minimum requirement
sudo docker run --rm -u $(id -u):$(id -g) -v "$REPO_ROOT/frontend":/src -w /src node:22.12 bash -lc '
  if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
    npm ci
  else
    npm install
  fi
  npm run build -- --configuration production
'

echo "==> Preparing nginx static folder for container"
mkdir -p "$REPO_ROOT/deploy/nginx/html"
rm -rf "$REPO_ROOT/deploy/nginx/html"/* || true
# New Angular builds (Angular 17+) place browser output under dist/<project>/browser
# Prefer copying the `browser` folder contents directly so index.html lands at nginx root.
BROWSER_DIR=$(find "$REPO_ROOT/frontend/dist" -type d -name browser -print -quit || true)
if [ -n "$BROWSER_DIR" ]; then
  echo "Found browser build at: $BROWSER_DIR"
  cp -r "$BROWSER_DIR"/* "$REPO_ROOT/deploy/nginx/html/"
else
  echo "No browser folder found under frontend/dist, falling back to copying dist/*"
  cp -r "$REPO_ROOT/frontend/dist"/* "$REPO_ROOT/deploy/nginx/html/"
fi

echo "==> Bringing up docker-compose stack"
cd "$REPO_ROOT/deploy"

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(sudo docker-compose)
else
  COMPOSE_CMD=(sudo docker compose)
fi

"${COMPOSE_CMD[@]}" up -d --build

echo "==> Verifying database schema in running container"
DB_CONTAINER_ID=$("${COMPOSE_CMD[@]}" ps -q db)
if [ -z "$DB_CONTAINER_ID" ]; then
  echo "Could not find db container ID."
  exit 1
fi

USER_TABLE_EXISTS=$(sudo docker exec "$DB_CONTAINER_ID" psql -U postgres -d EventOrganizer -tAc "SELECT to_regclass('public.\"User\"') IS NOT NULL;")
if [ "$USER_TABLE_EXISTS" != "t" ]; then
  echo "User table not found. Applying DB initialization scripts..."

  for sql in \
    /docker-entrypoint-initdb.d/00_initdb.sql \
    /docker-entrypoint-initdb.d/01_create_users.sql \
    /docker-entrypoint-initdb.d/02_create_events.sql \
    /docker-entrypoint-initdb.d/03_migrate_user_columns.sql \
    /docker-entrypoint-initdb.d/04_migrate_event_images.sql \
    /docker-entrypoint-initdb.d/05_migrate_inscription_columns.sql \
    /docker-entrypoint-initdb.d/06_create_inscriptions.sql \
    /docker-entrypoint-initdb.d/07_create_attendance.sql \
    /docker-entrypoint-initdb.d/08_migrate_announcement_columns.sql \
    /docker-entrypoint-initdb.d/09_create_announcements.sql; do
    sudo docker exec "$DB_CONTAINER_ID" psql -U postgres -d EventOrganizer -v ON_ERROR_STOP=1 -f "$sql"
  done

  echo "Schema initialization completed. Restarting API..."
  "${COMPOSE_CMD[@]}" restart api
else
  echo "Database schema already present."
fi

echo "==> Deployment complete."
echo "Point your domain to this server's IP and (optionally) run certbot on the host to obtain TLS certificates and mount them into the nginx container."
