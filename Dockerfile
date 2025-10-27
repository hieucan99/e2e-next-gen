# Use official Node.js LTS image
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Set environment variables (can be overridden at runtime)
ENV BASE_URL=https://www.nike.com/vn
ENV HEADLESS=true
ENV TIMEOUT=30000
ENV CI=true

# Create directories for test results and reports
RUN mkdir -p test-results reports

# Run tests by default
CMD ["npm", "test"]
