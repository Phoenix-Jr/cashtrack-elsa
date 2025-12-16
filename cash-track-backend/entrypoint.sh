#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
max_attempts=30
attempt=0

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "PostgreSQL connection failed after $max_attempts attempts"
    exit 1
  fi
  echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
  sleep 2
done

echo "PostgreSQL is up!"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput || echo "Migration failed, continuing..."

# Initialize default data (only if needed)
if [ ! -f /app/.data_initialized ]; then
  echo "Initializing default data..."
  python manage_data.py || echo "Data initialization failed, continuing..."
  touch /app/.data_initialized
fi

# Start server
echo "Starting Django server..."
exec "$@"

