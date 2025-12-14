FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create media directory
RUN mkdir -p /app/media /app/staticfiles

# Expose port
EXPOSE 8000

# Run migrations and start server
# The database will be available via the mounted volume
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000

