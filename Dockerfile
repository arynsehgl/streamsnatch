# Backend for Railway: Node + yt-dlp + FFmpeg
FROM node:20-bookworm-slim

# Install FFmpeg and yt-dlp (standalone binary, no Python/pip needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install deps
COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ ./

RUN mkdir -p downloads

ENV PORT=5001
EXPOSE 5001

CMD ["node", "index.js"]
