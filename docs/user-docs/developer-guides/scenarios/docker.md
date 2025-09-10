# Docker Deployment

Deploy your Aurelia 2 application using Docker with modern security practices and optimized builds.

## Prerequisites

- Docker installed
- Aurelia 2 application ready for deployment

## Dockerfile

Create a production-ready Dockerfile with security best practices:

```Dockerfile
# Build stage
FROM node:20-alpine AS builder

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S aurelia -u 1001

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY --chown=aurelia:nodejs package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev --silent && \
    npm cache clean --force

# Copy source code
COPY --chown=aurelia:nodejs . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create necessary directories and set permissions for nginx user
RUN mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user (nginx user already exists in nginx:alpine)
USER nginx

# Expose port
EXPOSE 8080

# Health check (using wget as curl is not available in Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration

Create `nginx.conf` for optimized SPA routing:

```nginx
# Update PID file location for non-root user
pid /var/run/nginx/nginx.pid;

server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## .dockerignore

Create `.dockerignore` to optimize build context:

```dockerignore
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.nyc_output
coverage
.coveralls.yml
.vscode
.idea
*.log
```

## Build and Run

```bash
# Build the image
docker build -t aurelia-app .

# Run the container
docker run -d -p 8080:8080 --name aurelia-container aurelia-app

# Check if it's running
curl http://localhost:8080/health
# or if curl is not available:
wget -qO- http://localhost:8080/health
```

## Production Optimizations

### Multi-Environment Support

Use build arguments for different environments:

```Dockerfile
# Add to build stage
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Build with environment
docker build --build-arg NODE_ENV=production -t aurelia-app .
```

### Resource Limits

Run with resource constraints:

```bash
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  -p 8080:8080 \
  aurelia-app
```

### Docker Compose

Create `docker-compose.yml` for easier management:

```yaml
version: '3.8'
services:
  aurelia-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

## Security Best Practices

- Uses non-root users in both build and production stages
- Implements security headers in nginx configuration
- Excludes sensitive files with .dockerignore
- Includes health checks for container monitoring
- Uses Alpine Linux base images for smaller attack surface
- Implements proper file permissions and ownership

This setup provides a production-ready, secure Docker deployment for your Aurelia 2 application.
