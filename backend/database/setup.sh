#!/usr/bin/env bash
set -euo pipefail

# Helper script to apply schema and seed scripts to a running PostgreSQL instance.
PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-postgres123}"
PGDATABASE="${PGDATABASE:-EventOrganizer}"

export PGPASSWORD

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/initdb.sql"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/seed_events.sql"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/seed_users_inscriptions_attendance.sql"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/seed_massive_participation.sql"

echo "PostgreSQL schema and seed scripts applied successfully."