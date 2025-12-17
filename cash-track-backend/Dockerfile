FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc postgresql-client libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --root-user-action=ignore -r requirements.txt

# Copy application (excluding entrypoint.sh to handle it separately)
COPY . .

# Ensure entrypoint.sh exists and has correct permissions
RUN if [ ! -f /app/entrypoint.sh ]; then \
        echo "ERROR: entrypoint.sh not found after COPY" && \
        find /app -name "entrypoint.sh" && \
        exit 1; \
    fi && \
    chmod +x /app/entrypoint.sh && \
    sed -i 's/\r$//' /app/entrypoint.sh && \
    head -1 /app/entrypoint.sh | grep -q "^#!" || (echo "ERROR: Missing shebang in entrypoint.sh" && exit 1)

# Create directories
RUN mkdir -p /app/media /app/staticfiles

EXPOSE 8000

# Use entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
