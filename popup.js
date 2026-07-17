document.addEventListener('DOMContentLoaded', async () => {
  const iconToggle     = document.getElementById('iconToggle');
  const captureButton  = document.getElementById('captureButton');
  const clipboardButton = document.getElementById('clipboardButton');
  const status         = document.getElementById('status');
  const shortcutDisplay = document.getElementById('shortcutDisplay');
  const formatPng      = document.getElementById('formatPng');
  const formatJpeg     = document.getElementById('formatJpeg');
  const qualityRow     = document.getElementById('qualityRow');
  const qualitySlider  = document.getElementById('qualitySlider');
  const qualityValue   = document.getElementById('qualityValue');

  // ── Load stored settings ──────────────────────────────────────────────────
  const settings = await chrome.storage.sync.get({
    showIcons:     true,
    imageFormat:   'png',
    jpegQuality:   92,
  });

  // Apply icon toggle state
  setToggleState(iconToggle, settings.showIcons);

  // Apply format setting
  if (settings.imageFormat === 'jpeg') {
    formatJpeg.checked = true;
    qualityRow.classList.add('visible');
  } else {
    formatPng.checked = true;
  }

  // Apply quality value
  qualitySlider.value = settings.jpegQuality;
  qualityValue.textContent = settings.jpegQuality;

  // ── Shortcut display ──────────────────────────────────────────────────────
  const commands = await chrome.commands.getAll();
  const captureCommand = commands.find(cmd => cmd.name === 'capture-screenshot');
  if (captureCommand && captureCommand.shortcut) {
    shortcutDisplay.textContent = captureCommand.shortcut;
  }

  // ── Toggle icons ──────────────────────────────────────────────────────────
  iconToggle.addEventListener('click', () => handleToggle());
  iconToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  });

  async function handleToggle() {
    const newShowIcons = iconToggle.getAttribute('aria-checked') !== 'true';
    setToggleState(iconToggle, newShowIcons);
    await chrome.storage.sync.set({ showIcons: newShowIcons });

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleIcons',
        showIcons: newShowIcons,
      }).catch(() => {});
    }
  }

  // ── Format selector ───────────────────────────────────────────────────────
  formatPng.addEventListener('change', async () => {
    qualityRow.classList.remove('visible');
    await chrome.storage.sync.set({ imageFormat: 'png' });
  });

  formatJpeg.addEventListener('change', async () => {
    qualityRow.classList.add('visible');
    await chrome.storage.sync.set({ imageFormat: 'jpeg' });
  });

  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
  });

  qualitySlider.addEventListener('change', async () => {
    await chrome.storage.sync.set({ jpegQuality: Number(qualitySlider.value) });
  });

  // ── Download button ───────────────────────────────────────────────────────
  captureButton.addEventListener('click', async () => {
    await sendCapture('captureVideo', 'Screenshot downloaded!');
  });

  // ── Copy to Clipboard button ──────────────────────────────────────────────
  clipboardButton.addEventListener('click', async () => {
    await sendCapture('copyToClipboard', 'Copied to clipboard!');
  });

  // ── Shared capture helper ─────────────────────────────────────────────────
  async function sendCapture(action, successMsg) {
    setStatus('', 'Capturing…');
    captureButton.disabled = true;
    clipboardButton.disabled = true;

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) throw new Error('No active tab');

      const response = await chrome.tabs.sendMessage(tabs[0].id, { action });

      if (response && response.success) {
        setStatus('success', successMsg);
      } else {
        setStatus('error', response?.error || 'No video found on page');
      }
    } catch {
      setStatus('error', 'Error: Refresh page and try again');
    } finally {
      captureButton.disabled = false;
      clipboardButton.disabled = false;
    }

    setTimeout(() => setStatus('', 'Ready to capture'), 3000);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setToggleState(el, active) {
    el.setAttribute('aria-checked', String(active));
    el.classList.toggle('active', active);
  }

  function setStatus(cls, text) {
    status.className = 'status' + (cls ? ` ${cls}` : '');
    status.textContent = text;
  }
});