document.getElementById('saveProduct').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs.length === 0) return;

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ['content.js'],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error injecting content.js:',
            chrome.runtime.lastError
          );
          document.getElementById('status').innerText =
            '❌ Failed to inject script!';
          return;
        }

        // Now send message
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'getProduct' },
          response => {
            if (!response) {
              document.getElementById('status').innerText =
                '❌ No response from script!';
              return;
            }

            saveToLocalStorage(response);
          }
        );
      }
    );
  });
});

function saveToLocalStorage(product) {
  chrome.storage.local.get({ wishlist: [] }, data => {
    let wishlist = data.wishlist;
    wishlist.push(product);
    chrome.storage.local.set({ wishlist }, () => {
      document.getElementById('status').innerText = '✅ Product saved!';
      setTimeout(
        () => (document.getElementById('status').innerText = ''),
        2000
      );
    });
  });
}
