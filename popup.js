document.getElementById('open-cabinet-btn').addEventListener('click', () => {
  // Opens the game dashboard in a beautiful full-screen browser tab safely
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});
