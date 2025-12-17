FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc postgresql-client libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p /app/media /app/staticfiles

# Create startup script
COPY <<'EOF' /app/start.sh
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
EOF

RUN chmod +x /app/start.sh

EXPOSE 8000

# Use the startup script
ENTRYPOINT ["/app/start.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
