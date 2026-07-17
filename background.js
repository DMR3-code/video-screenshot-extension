// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture-screenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureVideo' }).catch(() => {
          // Content script may not be injected on this page (e.g., chrome:// URLs)
        });
      }
    });
  }
});

// Log installation event
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.info('Video Screenshot Capture: Extension installed successfully.');
  }
});
