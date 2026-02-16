# Backend: Node + yt-dlp + FFmpeg (Alpine - lighter, sometimes avoids network issues)
FROM node:20-alpine

# Install FFmpeg and yt-dlp
RUN apk add --no-cache ffmpeg curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY server/package*.json ./
RUN npm install --omit=dev

COPY server/ ./
RUN mkdir -p downloads

ENV PORT=5001
EXPOSE 5001

CMD ["node", "index.js"]
