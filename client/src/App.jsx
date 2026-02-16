import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

// Design ref: download options shown after Analyze (Available Downloads list)
const DOWNLOAD_OPTIONS = [
  { quality: '720p HD', format: 'MP4', size: '~varies', type: 'video', apiFormat: 'mp4-720' },
  { quality: '1080p Full HD', format: 'MP4', size: '~varies', type: 'video', apiFormat: 'mp4-1080' },
  { quality: 'High Quality', format: 'MP3', size: '~varies', type: 'audio', apiFormat: 'mp3' },
  { quality: 'WAV Audio', format: 'WAV', size: '~varies', type: 'audio', apiFormat: 'wav' },
]

// Design ref: feature cards when no options yet
const FEATURES = [
  { icon: '⚡', label: 'Lightning Fast' },
  { icon: '🎨', label: 'High Quality' },
  { icon: '🔒', label: 'Safe & Secure' },
]

function App() {
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadOptions, setDownloadOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const cancelTokenRef = useRef(null)

  useEffect(() => {
    if (url) {
      setError('')
      setDownloadComplete(false)
    }
  }, [url])

  const validateUrl = (urlString) => {
    try {
      const urlObj = new URL(urlString)
      const host = urlObj.hostname.toLowerCase()
      const supported = [
        'youtube.com', 'youtu.be', 'instagram.com',
        'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com',
        'twitter.com', 'x.com', 'facebook.com', 'fb.watch', 'fb.com',
        'vimeo.com', 'twitch.tv', 'reddit.com', 'v.redd.it',
        'tumblr.com', 'pinterest.com', 'pin.it', 'linkedin.com',
        'soundcloud.com', 'dailymotion.com', 'dai.ly', 'bilibili.com', 'b23.tv',
      ]
      return supported.some((d) => host === d || host.endsWith('.' + d))
    } catch {
      return false
    }
  }

  const handleAnalyze = () => {
    setError('')
    setDownloadComplete(false)
    setDownloadOptions([])
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }
    if (!validateUrl(url)) {
      setError('Unsupported URL. Use a link from YouTube, Instagram, TikTok, or another supported site.')
      return
    }
    setIsProcessing(true)
    // Simulate brief analysis then show options (design ref flow)
    setTimeout(() => {
      setDownloadOptions(DOWNLOAD_OPTIONS)
      setIsProcessing(false)
    }, 800)
  }

  const getTypeIcon = (type) => {
    if (type === 'video') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    )
  }

  const getTypeColor = (type) => {
    if (type === 'video') return 'from-purple-500 to-pink-500'
    return 'from-green-500 to-emerald-500'
  }

  const handleDownload = async (option) => {
    setError('')
    setDownloadComplete(false)
    setProgress(0)
    if (!url.trim() || !validateUrl(url)) {
      setError('Please enter a valid URL and analyze first.')
      return
    }

    setSelectedOption(option)
    setIsDownloading(true)
    cancelTokenRef.current = axios.CancelToken.source()

    try {
      const response = await axios({
        method: 'POST',
        url: '/api/download',
        data: { url, format: option.apiFormat },
        responseType: 'blob',
        cancelToken: cancelTokenRef.current.token,
        onDownloadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total))
        },
        timeout: 300000,
      })

      const contentDisposition = response.headers['content-disposition']
      let filename = 'download'
      if (contentDisposition) {
        const m = contentDisposition.match(/filename="?(.+)"?/i)
        if (m) filename = m[1]
      } else {
        const ext = option.apiFormat === 'mp3' || option.apiFormat === 'wav' ? option.apiFormat : 'mp4'
        filename = `streamsnatch-${Date.now()}.${ext}`
      }
      const blob = new Blob([response.data])
      const blobUrl = window.URL.createObjectURL(blob)
      const win = window.open('', '_blank')
      if (win) {
        const isAudio = option.type === 'audio'
        const mediaTag = isAudio
          ? `<audio controls autoplay style="width:100%; margin-top:16px;"><source src="${blobUrl}"></audio>`
          : `<video controls autoplay style="width:100%; max-height:70vh; margin-top:16px; background:#000;"><source src="${blobUrl}"></video>`
        win.document.write(`
<!doctype html><html><head><meta charset="utf-8"/><title>${filename}</title><meta name="viewport" content="width=device-width, initial-scale=1"/><style>body{margin:0;padding:24px;background:#1e1b4b;color:#f9fafb;font-family:system-ui;display:flex;flex-direction:column;align-items:center;gap:12px;}h1{font-size:1rem;margin:0;}a.button{margin-top:8px;padding:8px 14px;border-radius:999px;background:linear-gradient(135deg,#22d3ee,#a855f7);color:#0f172a;font-size:0.8rem;font-weight:600;text-decoration:none;}</style></head><body><h1>${filename}</h1><p>Use the player menu or right-click to download.</p>${mediaTag}<a class="button" href="${blobUrl}" download="${filename}">Download file</a></body></html>`)
        win.document.close()
      } else {
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      setIsDownloading(false)
      setDownloadComplete(true)
      setTimeout(() => {
        setDownloadComplete(false)
        setSelectedOption(null)
      }, 3000)
    } catch (err) {
      setIsDownloading(false)
      setSelectedOption(null)
      if (axios.isCancel(err)) {
        setError('Download cancelled')
        return
      }
      if (err.response?.data) {
        const text = await err.response.data.text()
        try {
          const data = JSON.parse(text)
          setError(data.error || 'Download failed')
        } catch {
          setError(text || 'Download failed')
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out.')
      } else {
        setError(err.message || 'Download failed.')
      }
    } finally {
      cancelTokenRef.current = null
      setProgress(0)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="w-full max-w-4xl relative z-10">
        {/* Header - design ref exact */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl blur-xl opacity-60" />
              <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <svg className="w-8 h-8 text-yellow-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            VidGrab
          </h1>
          <p className="text-xl text-purple-200">
            Download videos in stunning quality with style
          </p>
        </div>

        {/* Main Card - design ref exact */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
          <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
            <div className="p-8">
              {/* Input Section - design ref exact */}
              <div className="mb-8">
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Video URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        setDownloadOptions([])
                        setError('')
                      }}
                      placeholder="Paste your video URL here..."
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-purple-300/50 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300"
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      disabled={isProcessing}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isProcessing}
                    className="relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center gap-2">
                      {isProcessing ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Analyze
                        </>
                      )}
                    </span>
                  </button>
                </div>
                {error && (
                  <p className="mt-3 text-sm text-red-300">{error}</p>
                )}
              </div>

              {/* Available Downloads - design ref: list of options with Download button */}
              {downloadOptions.length > 0 && (
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Downloads
                  </h3>
                  <div className="grid gap-3">
                    {downloadOptions.map((option, index) => (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-lg transition-opacity duration-300 from-cyan-500/20 to-purple-500/20" />
                        <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(option.type)}`}>
                                {getTypeIcon(option.type)}
                              </div>
                              <div>
                                <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                                  {option.quality}
                                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-purple-200">
                                    {option.format}
                                  </span>
                                </div>
                                <div className="text-sm text-purple-300 mt-1">
                                  File size: {option.size}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownload(option)}
                              disabled={isDownloading}
                              className="relative px-6 py-3 rounded-xl font-medium text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                            >
                              <div className={`absolute inset-0 bg-gradient-to-r ${getTypeColor(option.type)} opacity-80 hover:opacity-100 transition-opacity`} />
                              <span className="relative z-10 flex items-center gap-2">
                                {selectedOption === option && isDownloading ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Downloading... {progress > 0 && `${progress}%`}
                                  </>
                                ) : selectedOption === option && downloadComplete ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Complete!
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                  </>
                                )}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features - design ref: three cards when no options yet */}
              {downloadOptions.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  {FEATURES.map((feature, index) => (
                    <div
                      key={index}
                      className="text-center p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10"
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <div className="text-sm text-purple-200">{feature.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating particles - design ref */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-20 float-particle"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* GitHub link - top right */}
      <a
        href="https://github.com/arynsehgl/streamsnatch"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 text-purple-200 hover:text-white transition flex items-center gap-2 text-sm z-20"
      >
        GitHub
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>
  )
}

export default App
