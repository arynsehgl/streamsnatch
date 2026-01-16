# VoidLoader

**Private. Fast. No Ads.**

A minimalist YouTube video downloader web application built for personal and educational use. Features local processing only, no tracking, no ads, and no analytics.

## Features

- 🎥 Download YouTube videos in MP4 (720p, 1080p) or MP3 format
- 🔒 Local processing - all downloads happen on your machine
- 🚫 No ads, no tracking, no analytics
- 💻 Clean, minimalistic dark UI with glassmorphism design
- 📱 Fully responsive - works on desktop and mobile
- ⚡ Fast and lightweight

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS (dark mode)
- Axios for API calls

### Backend
- Node.js + Express
- yt-dlp for video extraction
- FFmpeg for audio/video merging
- Express rate limiting

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (for yt-dlp)
- **yt-dlp** - YouTube downloader
- **FFmpeg** - Audio/video processing

### Installing Prerequisites

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Python
brew install python

# Install yt-dlp
pip3 install yt-dlp
# or
brew install yt-dlp

# Install FFmpeg
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt-get install python3 python3-pip

# Install yt-dlp
pip3 install yt-dlp
# or
sudo apt-get install yt-dlp

# Install FFmpeg
sudo apt-get install ffmpeg
```

#### Windows
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install Python from [python.org](https://www.python.org/)
3. Install yt-dlp:
   ```cmd
   pip install yt-dlp
   ```
4. Install FFmpeg:
   - Download from [ffmpeg.org](https://ffmpeg.org/download.html)
   - Add to PATH

#### Verify Installations
```bash
node --version    # Should show v18+
python --version  # Should show Python 3.x
yt-dlp --version  # Should show yt-dlp version
ffmpeg -version   # Should show FFmpeg version
```

## Installation

1. **Clone or download this repository**

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../server
   npm install
   ```

## Configuration

Create a `.env` file in the `server` directory (optional):

```env
PORT=5000
```

If not specified, the server will default to port 5000.

## Running the Application

### Development Mode

**Terminal 1 - Start the backend:**
```bash
cd server
npm start
# or for auto-reload
npm run dev
```

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000`
The backend API will be available at `http://localhost:5000`

### Production Mode

**Build the frontend:**
```bash
cd client
npm run build
```

**Start the backend (production):**
```bash
cd server
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Paste a YouTube URL into the input field
3. Select your desired format:
   - **MP4 720p** - Video at 720p resolution
   - **MP4 1080p** - Video at 1080p resolution
   - **MP3 Audio** - Audio-only extraction
4. Click the **Download** button
5. Wait for the download to complete
6. Your file will automatically download to your default download folder

## API Endpoints

### POST `/api/download`
Download a YouTube video.

**Request Body:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "format": "mp4-720" | "mp4-1080" | "mp3"
}
```

**Response:**
- Success: Video/audio file stream
- Error: JSON error message

### GET `/api/health`
Health check endpoint.

## Security Features

- **Rate Limiting**: 10 requests per 15 minutes per IP
- **File Size Limit**: 2GB maximum per file
- **Request Timeout**: 5 minutes maximum per request
- **Input Validation**: URL and format validation

## Project Structure

```
Youtube Downloader/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Component styles
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Backend Express application
│   ├── services/
│   │   └── downloadService.js  # yt-dlp and FFmpeg integration
│   ├── utils/
│   │   └── validation.js       # URL validation
│   ├── downloads/         # Temporary download storage (auto-created)
│   ├── index.js           # Express server entry point
│   └── package.json
├── .gitignore
└── README.md
```

## Troubleshooting

### "yt-dlp: command not found"
- Ensure yt-dlp is installed and in your PATH
- Try reinstalling: `pip3 install --upgrade yt-dlp`

### "FFmpeg: command not found"
- Ensure FFmpeg is installed and in your PATH
- Verify installation: `ffmpeg -version`

### Download fails with "Video unavailable"
- Video might be private, age-restricted, or geo-blocked
- Try a different video URL

### Large files timeout
- The server has a 5-minute timeout
- Very large videos might exceed this limit
- Consider downloading shorter videos or increasing timeout in `server/index.js`

### Port already in use
- Change the PORT in `.env` or modify `vite.config.js` and `server/index.js`
- Kill the process using the port:
  ```bash
  # macOS/Linux
  lsof -ti:5000 | xargs kill
  lsof -ti:3000 | xargs kill
  ```

## Limitations

- Maximum file size: 2GB
- Rate limit: 10 requests per 15 minutes
- Request timeout: 5 minutes
- YouTube URLs only
- Downloads are stored temporarily and auto-deleted after streaming

## Legal Notice

This software is for **personal and educational use only**. Downloading copyrighted content may violate YouTube's Terms of Service and local copyright laws. Use responsibly and respect content creators' rights.

## License

This project is provided as-is for personal and educational purposes.

## Contributing

This is a personal-use project. Feel free to fork and modify for your own needs.

## Support

For issues related to:
- **yt-dlp**: Check [yt-dlp documentation](https://github.com/yt-dlp/yt-dlp)
- **FFmpeg**: Check [FFmpeg documentation](https://ffmpeg.org/documentation.html)
- **This project**: Check the troubleshooting section above

---

**Built with ❤️ for developers who value privacy and simplicity.**
