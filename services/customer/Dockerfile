# Customer Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/customer/package.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY services/customer/src ./src

# Expose port
EXPOSE 3003

# Start the service
CMD ["node", "src/index.js"]