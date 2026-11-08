# Stage 1: Build React application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./

# Install dependencies
RUN npm install --no-audit --no-fund

# Copy frontend source
COPY . .

# Configure backend URL at build time
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production application
RUN npm run build

# Stage 2: Serve application using Nginx
FROM nginx:alpine

# Copy production build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
