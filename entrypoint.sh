#!/bin/sh
set -e

PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "Starting ExcaliWeb with PUID=$PUID PGID=$PGID"

# Create group with specified GID
addgroup -g "$PGID" appgroup 2>/dev/null || true

# Create user with specified UID
adduser -D -u "$PUID" -G appgroup -h /app appuser 2>/dev/null || true

# Ensure data directory exists and has correct ownership
mkdir -p /app/data
chown -R appuser:appgroup /app/data

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisord.conf
