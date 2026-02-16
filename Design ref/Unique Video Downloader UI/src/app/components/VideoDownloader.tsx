import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, Video, CheckCircle, FileVideo, Image as ImageIcon, Music } from 'lucide-react';

interface DownloadOption {
  quality: string;
  format: string;
  size: string;
  type: 'video' | 'audio' | 'image';
}

export function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadOptions, setDownloadOptions] = useState<DownloadOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DownloadOption | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setDownloadComplete(false);
    
    // Simulate API call
    setTimeout(() => {
      const mockOptions: DownloadOption[] = [
        { quality: '4K Ultra HD', format: 'MP4', size: '850 MB', type: 'video' },
        { quality: '1080p Full HD', format: 'MP4', size: '320 MB', type: 'video' },
        { quality: '720p HD', format: 'MP4', size: '150 MB', type: 'video' },
        { quality: '480p', format: 'MP4', size: '80 MB', type: 'video' },
        { quality: 'High Quality', format: 'MP3', size: '12 MB', type: 'audio' },
        { quality: 'Thumbnail', format: 'JPG', size: '2 MB', type: 'image' },
      ];
      setDownloadOptions(mockOptions);
      setIsProcessing(false);
    }, 2000);
  };

  const handleDownload = (option: DownloadOption) => {
    setSelectedOption(option);
    setIsDownloading(true);
    
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadComplete(true);
      setTimeout(() => {
        setDownloadComplete(false);
        setSelectedOption(null);
      }, 3000);
    }, 2500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      default:
        return <FileVideo className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-purple-500 to-pink-500';
      case 'audio':
        return 'from-green-500 to-emerald-500';
      case 'image':
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl blur-xl opacity-60"></div>
              <Video className="w-12 h-12 text-white relative z-10" />
            </motion.div>
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity
              }}
            >
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </motion.div>
          </div>
          
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              VidGrab
            </span>
          </h1>
          <p className="text-xl text-purple-200">
            Download videos in stunning quality with style
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          {/* Animated background blur */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
          
          {/* Glass card */}
          <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"></div>
            
            <div className="p-8">
              {/* Input Section */}
              <div className="mb-8">
                <label className="block text-purple-100 text-sm font-medium mb-3">
                  Video URL
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste your video URL here..."
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-purple-300/50 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnalyze();
                      }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    disabled={isProcessing}
                    className="relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Download Options */}
              <AnimatePresence>
                {downloadOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Available Downloads
                      </h3>
                      
                      <div className="grid gap-3">
                        {downloadOptions.map((option, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-lg transition-opacity duration-300 from-cyan-500/20 to-purple-500/20"></div>
                            
                            <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(option.type)}`}>
                                    {getTypeIcon(option.type)}
                                  </div>
                                  
                                  <div>
                                    <div className="font-semibold text-white flex items-center gap-2">
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
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDownload(option)}
                                  disabled={isDownloading}
                                  className="relative px-6 py-3 rounded-xl font-medium text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <div className={`absolute inset-0 bg-gradient-to-r ${getTypeColor(option.type)} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                  <span className="relative z-10 flex items-center gap-2">
                                    {selectedOption === option && isDownloading ? (
                                      <>
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                          <Download className="w-4 h-4" />
                                        </motion.div>
                                        Downloading...
                                      </>
                                    ) : selectedOption === option && downloadComplete ? (
                                      <>
                                        <CheckCircle className="w-4 h-4" />
                                        Complete!
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-4 h-4" />
                                        Download
                                      </>
                                    )}
                                  </span>
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Features */}
              {downloadOptions.length === 0 && (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  {[
                    { icon: '⚡', label: 'Lightning Fast' },
                    { icon: '🎨', label: 'High Quality' },
                    { icon: '🔒', label: 'Safe & Secure' },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10"
                    >
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <div className="text-sm text-purple-200">{feature.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Floating particles effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
