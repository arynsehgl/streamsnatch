# Multi-stage build for VoidLoader

# Stage 1: Base image with system dependencies
FROM python:3.11-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --no-cache-dir yt-dlp

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Stage 2: Backend
FROM base as backend

WORKDIR /app/server

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend code
COPY server/ ./

# Create downloads directory
RUN mkdir -p downloads

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "index.js"]

# Stage 3: Frontend build
FROM base as frontend-build

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend code
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 4: Production with both frontend and backend
FROM base as production

WORKDIR /app

# Copy backend
COPY --from=backend /app/server ./server

# Copy frontend build
COPY --from=frontend-build /app/client/dist ./server/public

# Modify backend to serve static files
RUN echo 'import express from "express"; import path from "path"; import { fileURLToPath } from "url"; const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); const app = require("./server/index.js").default || require("./server/index.js"); app.use(express.static(path.join(__dirname, "public"))); app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });' > server/static.js || true

# Create downloads directory
RUN mkdir -p server/downloads

# Set working directory
WORKDIR /app/server

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "index.js"]
