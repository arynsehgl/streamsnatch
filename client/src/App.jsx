import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('mp4-1080')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const cancelTokenRef = useRef(null)

  // Clear success/error messages when URL or format changes
  useEffect(() => {
    if (url || format) {
      setSuccess(null)
      setError('')
    }
  }, [url, format])

  const validateUrl = (urlString) => {
    try {
      const urlObj = new URL(urlString)
      return urlObj.hostname.includes('youtube.com') || 
             urlObj.hostname.includes('youtu.be') ||
             urlObj.hostname.includes('m.youtube.com')
    } catch {
      return false
    }
  }

  const handleDownload = async () => {
    setError('')
    setSuccess(null)
    setProgress(0)

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid YouTube URL')
      return
    }

    setLoading(true)

    // Create cancel token for this request
    const CancelToken = axios.CancelToken
    cancelTokenRef.current = CancelToken.source()

    try {
      const response = await axios({
        method: 'POST',
        url: '/api/download',
        data: { url, format },
        responseType: 'blob',
        cancelToken: cancelTokenRef.current.token,
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setProgress(percentCompleted)
          }
        },
        timeout: 300000, // 5 minutes
      })

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition']
      let filename = 'download'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      } else {
        const ext = format.includes('mp3') ? 'mp3' : 'mp4'
        filename = `streamsnatch-${Date.now()}.${ext}`
      }

      // Get file size
      const fileSize = response.data.size
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

      // Create download link
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      setSuccess({ filename, fileSizeMB })
      // Don't clear URL automatically - let user decide
    } catch (err) {
      // Handle cancellation
      if (axios.isCancel(err)) {
        setError('Download cancelled')
        return
      }

      if (err.response?.data) {
        // Try to parse error message from blob
        const text = await err.response.data.text()
        try {
          const errorData = JSON.parse(text)
          setError(errorData.error || 'Download failed')
        } catch {
          setError(text || 'Download failed')
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The video might be too large or the server is busy.')
      } else {
        setError(err.message || 'Download failed. Please try again.')
      }
    } finally {
      setLoading(false)
      setProgress(0)
      cancelTokenRef.current = null
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-accent to-purple-accent flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">StreamSnatch</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="https://github.com/arynsehgl/streamsnatch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition flex items-center gap-2"
            >
              GitHub
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="glass-card rounded-2xl p-8 md:p-12 w-full max-w-2xl shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Download Media
            </h2>
            <p className="text-white/60 text-sm md:text-base">
              Paste any video URL to get started.
            </p>
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  // Clear messages when URL changes
                  if (success || error) {
                    setSuccess(null)
                    setError('')
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleDownload()}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-accent focus:ring-2 focus:ring-cyan-accent/20 transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-white/60 text-sm mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value)
                // Clear messages when format changes
                if (success || error) {
                  setSuccess(null)
                  setError('')
                }
              }}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-accent focus:ring-2 focus:ring-cyan-accent/20 transition appearance-none cursor-pointer"
              disabled={loading}
            >
              <option value="mp4-720">MP4 720p</option>
              <option value="mp4-1080">MP4 1080p</option>
              <option value="mp3">MP3 Audio</option>
            </select>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-accent to-purple-accent rounded-xl text-white font-semibold text-lg btn-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </button>

          {/* Progress Bar */}
          {loading && progress > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-accent to-purple-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm relative">
              <button
                onClick={() => setError('')}
                className="absolute top-2 right-2 text-red-400/60 hover:text-red-400 transition"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl relative">
              <button
                onClick={() => setSuccess(null)}
                className="absolute top-2 right-2 text-white/60 hover:text-white transition"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-green-400 font-semibold mb-1">✓ Download Complete!</div>
              <div className="text-white/80 text-sm">
                File: {success.filename}
              </div>
              <div className="text-white/60 text-xs mt-1">
                Size: {success.fileSizeMB} MB
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-accent"></div>
                Local processing
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                No ads
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Private
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <div>
            Built for developers • Open source • No tracking.
          </div>
          <div className="flex items-center gap-4">
            <button className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition">
              ?
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
