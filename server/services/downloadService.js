import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Downloads a video using yt-dlp and optionally merges with FFmpeg
 * @param {string} url - YouTube URL
 * @param {string} format - Format: 'mp4-720', 'mp4-1080', 'mp3', or 'wav'
 * @returns {Promise<string>} - Path to downloaded file
 */
export async function downloadVideo(url, format) {
  const downloadsDir = path.join(__dirname, '../downloads');
  const outputTemplate = path.join(downloadsDir, `%(title)s.%(ext)s`);
  
  // Sanitize filename by replacing special characters
  const safeOutputTemplate = outputTemplate.replace(/[<>:"|?*]/g, '_');

  let ytDlpCommand;
  let tempVideoPath = null;
  let tempAudioPath = null;
  let finalPath = null;

  try {
    // Use Node.js as JS runtime for YouTube extraction
    // YouTube now requires JS runtime for proper extraction
    // Find node path dynamically
    let nodePath = '/opt/homebrew/bin/node'; // Default Homebrew path on macOS
    try {
      const { stdout } = await execAsync('which node', { timeout: 5000 });
      if (stdout && stdout.trim()) {
        nodePath = stdout.trim();
      }
    } catch (err) {
      console.warn('Could not find node path, using default:', nodePath);
    }
    const jsRuntimeFlag = `--js-runtimes node:${nodePath}`;
    
    if (format === 'mp3') {
      // MP3 download - extract audio only
      ytDlpCommand = `yt-dlp -x --audio-format mp3 --audio-quality 0 ${jsRuntimeFlag} -o "${safeOutputTemplate}" "${url}"`;
    } else if (format === 'wav') {
      // WAV download - extract audio as uncompressed WAV
      ytDlpCommand = `yt-dlp -x --audio-format wav --audio-quality 0 ${jsRuntimeFlag} -o "${safeOutputTemplate}" "${url}"`;
    } else if (format === 'mp4-720') {
      // MP4 720p - use format with fallback: best single file first, then combined streams
      // This handles SABR streaming better
      ytDlpCommand = `yt-dlp -f "best[height<=720]/bestvideo[height<=720]+bestaudio[height<=720]/best" --merge-output-format mp4 ${jsRuntimeFlag} -o "${safeOutputTemplate}" "${url}"`;
    } else if (format === 'mp4-1080') {
      // MP4 1080p - use format with fallback: best single file first, then combined streams
      // This handles SABR streaming better
      ytDlpCommand = `yt-dlp -f "best[height<=1080]/bestvideo[height<=1080]+bestaudio[height<=1080]/best" --merge-output-format mp4 ${jsRuntimeFlag} -o "${safeOutputTemplate}" "${url}"`;
    }

    // Note: yt-dlp with --merge-output-format should handle merging automatically
    // We only use FFmpeg as a fallback if separate files are still created

    console.log(`Executing: ${ytDlpCommand}`);

    // Execute yt-dlp
    const { stdout, stderr } = await execAsync(ytDlpCommand, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 300000, // 5 minutes timeout
    });

    if (stderr && !stderr.includes('WARNING')) {
      console.warn('yt-dlp stderr:', stderr);
    }

    // Find the downloaded file
    const files = fs.readdirSync(downloadsDir);
    
    if (format === 'mp3' || format === 'wav') {
      // Look for audio file with the expected extension
      const audioExt = format === 'mp3' ? '.mp3' : '.wav';
      const audioFile = files.find((f) => f.endsWith(audioExt));
      if (!audioFile) {
        throw new Error(
          `${format.toUpperCase()} file not found after download. Try a different format.`
        );
      }
      finalPath = path.join(downloadsDir, audioFile);
    } else {
      // Look for merged MP4 file (yt-dlp should have merged it automatically)
      const mp4File = files.find((f) => f.endsWith('.mp4') && !f.includes('.temp') && !f.includes('.f') && !f.includes('.webm'));
      
      if (mp4File) {
        // Found merged file
        finalPath = path.join(downloadsDir, mp4File);
      } else {
        // Fallback: Check if we have separate video and audio files that need merging
        const videoFile = files.find((f) => 
          (f.endsWith('.webm') || f.endsWith('.mp4')) && 
          !f.includes('audio') && 
          !f.includes('.temp')
        );
        const audioFile = files.find((f) => 
          (f.endsWith('.webm') || f.endsWith('.m4a') || f.endsWith('.opus')) && 
          (f.includes('audio') || f.endsWith('.m4a') || f.endsWith('.opus'))
        );

        if (videoFile && audioFile) {
          // Need to merge with FFmpeg (fallback case)
          tempVideoPath = path.join(downloadsDir, videoFile);
          tempAudioPath = path.join(downloadsDir, audioFile);
          
          const finalFilename = `streamsnatch-${Date.now()}.mp4`;
          finalPath = path.join(downloadsDir, finalFilename);
          
          const ffmpegCommand = `ffmpeg -i "${tempVideoPath}" -i "${tempAudioPath}" -c:v copy -c:a aac -strict experimental -y "${finalPath}"`;
          
          console.log(`Merging with FFmpeg (fallback): ${ffmpegCommand}`);
          
          await execAsync(ffmpegCommand, {
            maxBuffer: 10 * 1024 * 1024,
            timeout: 120000, // 2 minutes for merging
          });

          // Clean up temp files
          try {
            if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
            if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
          } catch (cleanupError) {
            console.warn('Failed to cleanup temp files:', cleanupError);
          }
        } else {
          // Try to find any MP4 file as last resort
          const anyMp4File = files.find((f) => f.endsWith('.mp4'));
          if (anyMp4File) {
            finalPath = path.join(downloadsDir, anyMp4File);
          } else {
            throw new Error('Downloaded file not found');
          }
        }
      }
    }

    if (!finalPath || !fs.existsSync(finalPath)) {
      throw new Error('Final output file not found');
    }

    // Check if file is empty
    const stats = fs.statSync(finalPath);
    if (stats.size === 0) {
      // Clean up empty file
      fs.unlinkSync(finalPath);
      throw new Error('Downloaded file is empty. The video might be unavailable or the format not supported. Try a different format.');
    }

    return finalPath;
  } catch (error) {
    // Cleanup on error
    if (tempVideoPath && fs.existsSync(tempVideoPath)) {
      try {
        fs.unlinkSync(tempVideoPath);
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      try {
        fs.unlinkSync(tempAudioPath);
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
    }

    // Parse error message - map technical errors to user-friendly messages
    let raw = (error.message || error.stderr || '').toLowerCase();

    if (raw.includes('private') || raw.includes('private video') || raw.includes('sign in') || raw.includes('age-restricted')) {
      throw new Error('Video not available or restricted');
    }
    if (raw.includes('video unavailable') || raw.includes('unavailable') || raw.includes('deleted') || raw.includes('removed')) {
      throw new Error('Video not available');
    }
    if (raw.includes('timeout') || raw.includes('timed out')) {
      throw new Error('Request timed out. Try a shorter video or different format');
    }
    if (raw.includes('empty') || raw.includes('no such file') || raw.includes('file not found')) {
      throw new Error('Could not get this video. Try a different format');
    }

    // All other errors (python3, yt-dlp, ffmpeg, env, etc.) -> generic message
    throw new Error('Download failed. Please try again');
  }
}
