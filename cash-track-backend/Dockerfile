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

EXPOSE 8000

# Run migrations, initialize data, and start server
CMD sh -c "python manage.py migrate --noinput || echo 'Migration failed, continuing...' && ([ ! -f /app/.data_initialized ] && (python manage_data.py || echo 'Data initialization failed, continuing...') && touch /app/.data_initialized || true) && python manage.py runserver 0.0.0.0:8000"
