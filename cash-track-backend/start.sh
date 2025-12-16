#!/bin/bash
set -e

# Run migrations (la base est déjà attendue via le healthcheck Docker)
python manage.py migrate

# Initialize default data (users and categories)
echo ""
echo "=========================================="
echo "Initializing default data..."
echo "=========================================="
python manage_data.py
echo ""

# Start server
exec python manage.py runserver 0.0.0.0:8000

