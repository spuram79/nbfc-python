# Underwriting Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY services/underwriting/src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY services/underwriting/src ./src

# Expose port
EXPOSE 3007

# Start the service
CMD ["python", "src/app.py"]