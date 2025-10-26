document.addEventListener('DOMContentLoaded', async () => {
  const iconToggle = document.getElementById('iconToggle');
  const captureButton = document.getElementById('captureButton');
  const status = document.getElementById('status');
  const shortcutDisplay = document.getElementById('shortcutDisplay');

  // Load settings
  const settings = await chrome.storage.sync.get({
    showIcons: true
  });

  // Update UI based on settings
  if (settings.showIcons) {
    iconToggle.classList.add('active');
  }

  // Update shortcut display
  const commands = await chrome.commands.getAll();
  const captureCommand = commands.find(cmd => cmd.name === 'capture-screenshot');
  if (captureCommand && captureCommand.shortcut) {
    shortcutDisplay.textContent = captureCommand.shortcut;
  }

  // Toggle icons setting
  iconToggle.addEventListener('click', async () => {
    const newShowIcons = !iconToggle.classList.contains('active');

    if (newShowIcons) {
      iconToggle.classList.add('active');
    } else {
      iconToggle.classList.remove('active');
    }

    await chrome.storage.sync.set({ showIcons: newShowIcons });

    // Notify content scripts to update icon visibility
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleIcons',
        showIcons: newShowIcons
      });
    }
  });

  // Capture button
  captureButton.addEventListener('click', async () => {
    status.textContent = 'Capturing...';
    captureButton.disabled = true;

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'captureVideo'
        });

        if (response && response.success) {
          status.textContent = 'Screenshot saved!';
          setTimeout(() => {
            status.textContent = 'Ready to capture';
          }, 2000);
        } else {
          status.textContent = 'No video found on page';
          setTimeout(() => {
            status.textContent = 'Ready to capture';
          }, 2000);
        }
      }
    } catch (error) {
      status.textContent = 'Error capturing screenshot';
      setTimeout(() => {
        status.textContent = 'Ready to capture';
      }, 2000);
    }

    captureButton.disabled = false;
  });
});