# Auth Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/auth/package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY services/auth/src ./src

# Expose port
EXPOSE 3001

# Start the service
CMD ["node", "src/index.js"]