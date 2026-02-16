/**
 * Supported video platforms (yt-dlp compatible).
 * See: https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md
 */
const SUPPORTED_DOMAINS = [
  // YouTube
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
  // Instagram
  'instagram.com',
  'www.instagram.com',
  // TikTok
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  // Twitter / X
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  // Facebook
  'facebook.com',
  'www.facebook.com',
  'fb.watch',
  'fb.com',
  'www.fb.com',
  'm.facebook.com',
  // Vimeo
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
  // Twitch
  'twitch.tv',
  'www.twitch.tv',
  'clips.twitch.tv',
  // Reddit
  'reddit.com',
  'www.reddit.com',
  'old.reddit.com',
  'v.redd.it',
  // Tumblr
  'tumblr.com',
  'www.tumblr.com',
  // Pinterest
  'pinterest.com',
  'www.pinterest.com',
  'pin.it',
  // LinkedIn
  'linkedin.com',
  'www.linkedin.com',
  // SoundCloud
  'soundcloud.com',
  'www.soundcloud.com',
  // Dailymotion
  'dailymotion.com',
  'www.dailymotion.com',
  'dai.ly',
  // Bilibili
  'bilibili.com',
  'www.bilibili.com',
  'b23.tv',
];

/**
 * Validates if a URL is from a supported video/audio platform.
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if from a supported platform
 */
export function validateUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');

    const isSupported = SUPPORTED_DOMAINS.some((domain) => {
      const normalizedDomain = domain.replace(/^www\./, '');
      return hostname === normalizedDomain || hostname.endsWith('.' + normalizedDomain);
    });

    if (!isSupported) {
      return false;
    }

    // Basic sanity: must have path or query (not just domain)
    const hasPath = urlObj.pathname.length > 1 || urlObj.search.length > 0;
    return hasPath;
  } catch {
    return false;
  }
}
