const siteConfigs = {
  'flipkart.com': {
    imageSelector: '._53J4C-.utBuJY',
    titleSelector: '.VU-ZEz',
    priceSelector: '.Nx9bqj.CxhGGd',
    originalPriceSelector: '.yRaY8j',
    currency: 'INR',
    site: 'Flipkart',
  },
  'myntra.com': {
    imageSelector: '.image-grid-image',
    titleSelector: '.pdp-name',
    priceSelector: '.pdp-price strong',
    originalPriceSelector: '.pdp-mrp s', // Strikethrough price
    currency: 'INR',
    site: 'Myntra',
  },
  'amazon.': {
    // Matches any Amazon domain (.in, .com, etc.)
    imageSelector: '.a-dynamic-image',
    titleSelector: '#productTitle',
    priceSelector: '.a-price-whole',
    originalPriceSelector: '.a-text-price.a-offscreen',
    currency: 'INR',
    site: 'Amazon',
  },
  'bewakoof.com': {
    imageSelector: '.sc-1nbuep6-2',
    titleSelector: 'h1',
    priceSelector: '.price',
    originalPriceSelector: '.mr-2.line-through', // Strikethrough price
    currency: 'INR',
    site: 'Bewakoof',
  },
};

// Function to extract product details
function getProductData() {
  let site = Object.keys(siteConfigs).find(key =>
    window.location.href.includes(key)
  );
  if (!site) return null; // If site is not listed, return null

  let config = siteConfigs[site];

  // Extract Image
  let imageElement = document.querySelector(config.imageSelector);
  let imageUrl = imageElement
    ? imageElement.tagName === 'META'
      ? imageElement.content
      : imageElement.src
    : 'Image Not Found';

  // Extract Title
  let titleElement = document.querySelector(config.titleSelector);
  let title = titleElement
    ? titleElement.textContent.trim()
    : 'Unknown Product';

  // Extract Price
  let priceElement = document.querySelector(config.priceSelector);
  let price = priceElement
    ? parseInt(priceElement.textContent.replace(/[^\d]/g, ''))
    : null;

  // Extract Original Price
  let originalPriceElement = document.querySelector(
    config.originalPriceSelector
  );
  let originalPrice = originalPriceElement
    ? parseInt(originalPriceElement.textContent.replace(/[^\d]/g, ''))
    : null;
  console.log(originalPriceElement, 'dsf');
  if (!originalPrice) {
    let priceText =
      originalPriceElement.innerText || originalPriceElement.textContent;
    let priceMatch = priceText.match(/\d+/g); // Extract all numeric values

    if (priceMatch && priceMatch.length > 0) {
      originalPrice = parseInt(priceMatch.join('')); // Join and convert to integer
    }
  }

  // Calculate Discount Percentage
  let discountPercentage =
    originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return {
    image: imageUrl,
    title: title,
    price: price,
    currency: config.currency,
    original_price: originalPrice,
    discount_percentage: discountPercentage,
    url: window.location.href,
    site: config.site,
  };
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getProduct') {
    sendResponse(getProductData());
  }
});
