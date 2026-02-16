import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { downloadVideo } from './services/downloadService.js';
import { validateUrl } from './utils/validation.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001; // Changed from 5000 to avoid macOS AirPlay conflict
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StreamSnatch API is running' });
});

// Download endpoint
app.post('/api/download', async (req, res) => {
  const { url, format } = req.body;

  // Validate input
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!validateUrl(url)) {
    return res
      .status(400)
      .json({ error: 'Unsupported URL. Use a link from YouTube, Instagram, TikTok, or another supported site.' });
  }

  const validFormats = ['mp4-720', 'mp4-1080', 'mp3', 'wav'];
  if (!format || !validFormats.includes(format)) {
    return res
      .status(400)
      .json({ error: 'Invalid format. Must be one of: mp4-720, mp4-1080, mp3, wav' });
  }

  let filePath = null;

  try {
    // Set timeout for the request (5 minutes)
    req.setTimeout(300000);

    // Download the video
    filePath = await downloadVideo(url, format);

    // Check file size
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      fs.unlinkSync(filePath);
      return res.status(413).json({ error: 'File size exceeds 2GB limit' });
    }

    // Generate filename
    const ext = format === 'mp3' ? 'mp3' : format === 'wav' ? 'wav' : 'mp4';
    const filename = `streamsnatch-${Date.now()}.${ext}`;

    // Set headers
    const contentType =
      format === 'mp3' ? 'audio/mpeg' : format === 'wav' ? 'audio/wav' : 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after streaming
    fileStream.on('end', () => {
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });

    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

  } catch (error) {
    console.error('Download error:', error);

    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    // Send error response
    if (!res.headersSent) {
      const statusCode = error.statusCode || 500;
      const errorMessage = error.message || 'Download failed';
      res.status(statusCode).json({ error: errorMessage });
    }
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 StreamSnatch server running on port ${PORT}`);
  console.log(`📁 Downloads directory: ${downloadsDir}`);
});
