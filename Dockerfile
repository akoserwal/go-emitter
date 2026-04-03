FROM node:18-alpine

# Install Go for testing generated code
RUN apk add --no-cache go

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY . .
RUN npm run build

# Create user for security
RUN addgroup -g 1001 -S typespec && \
    adduser -S typespec -u 1001

# Set ownership and switch to user
RUN chown -R typespec:typespec /app
USER typespec

# Create working directory for user files
WORKDIR /workspace

# Entry point
ENTRYPOINT ["node", "/app/dist/cli.js"]

# Example usage:
# docker run -v $(pwd):/workspace typespec/go-emitter api.tsp client.go