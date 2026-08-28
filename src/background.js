/**
 * PromptGuard background service worker.
 * Minimal by design: just seeds default settings. All detection happens
 * locally in the content script — the background worker never sees prompt
 * text.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ enabled: true }, (data) => {
    chrome.storage.local.set({ enabled: data.enabled });
  });
});
