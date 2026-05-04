# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PATH="/opt/venv/bin:$PATH"

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    # WeasyPrint dependencies
    python3-dev \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    zlib1g-dev \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libcairo2-dev \
    pkg-config \
    libharfbuzz0b \
    libgdk-pixbuf2.0-0 \
    shared-mime-info \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python -m venv /opt/venv

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt
RUN pip install gunicorn

# Copy project
COPY . /app/

# Create media and static directories
RUN mkdir -p /app/staticfiles /app/media

# Expose port
EXPOSE 8000

# Start Gunicorn with gthread optimization
CMD ["/opt/venv/bin/gunicorn", "core.wsgi:application", "--bind=0.0.0.0:8000", "--workers=1", "--threads=4", "--worker-class=gthread", "--timeout=120", "--max-requests=1000", "--max-requests-jitter=100"]
