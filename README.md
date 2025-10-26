# Video Screenshot Capture Chrome Extension

A powerful Chrome extension that allows you to capture screenshots from any video playing in your browser.

## Features

- 📸 **One-Click Capture**: Easily capture screenshots from any HTML5 video
- ⌨️ **Keyboard Shortcut**: Default Ctrl+Shift+V (customizable in Chrome settings)
- 👁️ **Toggle Visibility**: Show/hide capture icons on videos
- 🎯 **Smart Detection**: Automatically finds and targets the largest playing video
- 💾 **Auto Download**: Screenshots are automatically saved to your Downloads folder
- 🎨 **Modern UI**: Clean, intuitive interface with visual feedback

## Installation

1. Save all the files in a folder named `video-screenshot-extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select your extension folder
5. The extension icon will appear in your toolbar

## Usage

### Method 1: Keyboard Shortcut
- Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) while on any page with a video
- The largest video on the page will be captured automatically

### Method 2: Overlay Button
- Hover over any video to see the capture button (if enabled)
- Click the "📸 Capture" button

### Method 3: Extension Popup
- Click the extension icon in the toolbar
- Click "📸 Capture Current Video" button

## Settings

### Toggle Capture Icons
- Open the extension popup
- Use the toggle switch to show/hide overlay icons on videos

### Customize Keyboard Shortcut
1. Open the extension popup
2. Click "Customize in Chrome Settings"
3. Or go directly to `chrome://extensions/shortcuts`
4. Set your preferred key combination

## File Structure

```
video-screenshot-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── content.js            # Main capture functionality
├── content.css           # Styling (minimal, most styles are injected)
├── icons/                # Extension icons (16x16, 48x48, 128x128)
└── README.md            # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: activeTab, storage, downloads
- **Screenshot Format**: PNG (high quality)
- **Compatibility**: Works with all HTML5 video elements
- **Storage**: Uses Chrome sync storage for settings

## Supported Video Sources

- YouTube
- Vimeo  
- Netflix
- Amazon Prime Video
- HTML5 video elements
- Most embedded video players

## Notes

- Screenshots capture the exact current frame of the video
- The extension automatically detects and targets the largest video on the page when using keyboard shortcuts
- Files are saved with timestamps to prevent naming conflicts
- The flash effect provides visual feedback when a screenshot is taken

## Troubleshooting

- **No video found**: Make sure the video is loaded and playing
- **Shortcut not working**: Check Chrome extension shortcuts in `chrome://extensions/shortcuts`
- **Icons not showing**: Check the toggle setting in the extension popup
- **Download issues**: Ensure Chrome has permission to download files

Enjoy capturing your favorite video moments! 📸# video-screenshot-extension
# video-screenshot-extension
