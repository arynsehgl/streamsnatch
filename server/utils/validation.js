/**
 * Validates if a URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export function validateUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check if it's a YouTube domain
    const youtubeDomains = [
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtu.be',
      'www.youtu.be',
    ];

    const isValidDomain = youtubeDomains.some((domain) => hostname.includes(domain));

    if (!isValidDomain) {
      return false;
    }

    // For youtu.be, check if there's a video ID
    if (hostname.includes('youtu.be')) {
      const pathname = urlObj.pathname;
      return pathname.length > 1; // Has video ID after /
    }

    // For youtube.com, check for v parameter or /watch path
    if (hostname.includes('youtube.com')) {
      return urlObj.searchParams.has('v') || urlObj.pathname.includes('/watch');
    }

    return true;
  } catch {
    return false;
  }
}
