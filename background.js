// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture-screenshot') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureVideo' });
      }
    });
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Video Screenshot Capture extension installed');
});
