# Backend Dockerfile for SmartLens AI
FROM node:20-alpine

# Install required system dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    && update-ca-certificates

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Download tesseract training data
RUN curl -L https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata -o eng.traineddata

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Prefer IPv4 for DNS resolution
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Start the server
CMD ["node", "index.js"]
