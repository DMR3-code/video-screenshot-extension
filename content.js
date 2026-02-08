class VideoScreenshotCapture {
  constructor() {
    this.videos = new Set();
    this.settings = { showIcons: true };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.createStyles();
    this.observeVideos();
    this.setupMessageListener();

    // Initial scan for videos
    this.scanForVideos();

    // Periodic scan for dynamically loaded videos
    setInterval(() => {
      this.scanForVideos();
    }, 5000);
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get({
      showIcons: true
    });
    this.settings = settings;
  }

  createStyles() {
    if (document.getElementById('video-screenshot-styles')) return;

    const style = document.createElement('style');
    style.id = 'video-screenshot-styles';
    style.textContent = `
      .video-screenshot-container {
        position: relative;
        display: inline-block;
      }
      
      .video-screenshot-button {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s ease;
        backdrop-filter: blur(4px);
      }
      
      .video-screenshot-button:hover {
        background: rgba(0, 0, 0, 0.9);
        transform: scale(1.05);
      }
      
      .video-screenshot-button:active {
        transform: scale(0.95);
      }
      
      .video-screenshot-hidden {
        display: none !important;
      }
      
      .video-screenshot-flash {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        opacity: 0;
        pointer-events: none;
        z-index: 10000;
        animation: screenshot-flash 0.3s ease-out;
      }
      
      @keyframes screenshot-flash {
        0% { opacity: 0; }
        50% { opacity: 0.8; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  scanForVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (!this.videos.has(video)) {
        this.addVideoControls(video);
        this.videos.add(video);
      }
    });
  }

  addVideoControls(video) {
    // Skip if video is too small or not visible
    if (video.videoWidth < 100 || video.videoHeight < 100) return;

    // Create container if it doesn't exist
    let container = video.parentElement;
    if (!container.classList.contains('video-screenshot-container')) {
      // Get video styles to replicate on wrapper
      const style = window.getComputedStyle(video);

      const wrapper = document.createElement('div');
      wrapper.className = 'video-screenshot-container';

      // Copy essential layout styles
      wrapper.style.display = style.display === 'inline' ? 'inline-block' : style.display;
      wrapper.style.marginTop = style.marginTop;
      wrapper.style.marginBottom = style.marginBottom;
      wrapper.style.marginLeft = style.marginLeft;
      wrapper.style.marginRight = style.marginRight;
      wrapper.style.float = style.float;
      wrapper.style.clear = style.clear;

      video.parentNode.insertBefore(wrapper, video);
      wrapper.appendChild(video);
      container = wrapper;
    }

    // Create capture button
    const button = document.createElement('button');
    button.className = 'video-screenshot-button';
    button.innerHTML = '📸 Capture';
    button.title = 'Capture video screenshot (Ctrl+Shift+V)';

    // Apply visibility setting
    if (!this.settings.showIcons) {
      button.classList.add('video-screenshot-hidden');
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.captureVideoScreenshot(video);
    });

    container.appendChild(button);
  }

  observeVideos() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'VIDEO') {
              setTimeout(() => this.scanForVideos(), 100);
            } else if (node.querySelectorAll) {
              const videos = node.querySelectorAll('video');
              if (videos.length > 0) {
                setTimeout(() => this.scanForVideos(), 100);
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'captureVideo') {
        const captured = this.captureAnyVideo();
        sendResponse({ success: captured });
      } else if (message.action === 'toggleIcons') {
        this.settings.showIcons = message.showIcons;
        this.updateIconVisibility();
      }
    });
  }

  updateIconVisibility() {
    const buttons = document.querySelectorAll('.video-screenshot-button');
    buttons.forEach(button => {
      if (this.settings.showIcons) {
        button.classList.remove('video-screenshot-hidden');
      } else {
        button.classList.add('video-screenshot-hidden');
      }
    });
  }

  captureAnyVideo() {
    const videos = Array.from(document.querySelectorAll('video'));

    // Find the largest playing video
    let targetVideo = null;
    let maxArea = 0;

    for (const video of videos) {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const area = video.videoWidth * video.videoHeight;
        if (area > maxArea) {
          maxArea = area;
          targetVideo = video;
        }
      }
    }

    if (targetVideo) {
      this.captureVideoScreenshot(targetVideo);
      return true;
    }

    return false;
  }

  captureVideoScreenshot(video) {
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Invalid video for screenshot');
      return;
    }

    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add flash effect
      this.showFlashEffect(video);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `video-screenshot-${timestamp}.png`;

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/png');

      console.log('Video screenshot captured');
    } catch (error) {
      if (error.name === 'SecurityError') {
        alert('Cannot capture screenshot: This video is protected by the website\'s security settings (CORS).');
      } else {
        console.error('Failed to capture video screenshot:', error);
      }
    }
  }

  showFlashEffect(video) {
    const flash = document.createElement('div');
    flash.className = 'video-screenshot-flash';

    const container = video.closest('.video-screenshot-container') || video.parentElement;
    container.style.position = 'relative';
    container.appendChild(flash);

    setTimeout(() => {
      if (flash.parentElement) {
        flash.parentElement.removeChild(flash);
      }
    }, 300);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VideoScreenshotCapture();
  });
} else {
  new VideoScreenshotCapture();
}