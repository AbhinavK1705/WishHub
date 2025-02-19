(() => {
  function getProductImage() {
    // Try selecting the main product image using common selectors
    let imgElement = document.querySelector(
      "img[src*='product'], img[src*='image'], img[src*='media'], img[src*='pdp'], img[src*='flipkart'], img[src*='myntra'], img[src*='amazon']"
    );

    // Fallback: If no image is found, select the first large image that is not a logo
    if (!imgElement) {
      let images = document.querySelectorAll('img');
      images.forEach(img => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Ignore small images (like logos)
        if (width > 100 && height > 100) {
          imgElement = img;
        }
      });
    }

    return imgElement ? imgElement.src : 'No image found';
  }

  console.log(getProductImage());

  function getProductDetails() {
    let title =
      document.querySelector('h1, .product-title, .product-name')?.innerText ||
      'Unknown Product';
    let url = window.location.href;
    let image = getProductImage();

    // Extract price from Myntra, Flipkart, and Amazon
    let price =
      document.querySelector('.pdp-price strong')?.innerText || // Myntra
      document.querySelector('.Nx9bqj.CxhGGd')?.innerText || // Flipkart
      document.querySelector('._30jeq3')?.innerText || // Another Flipkart price class
      document.querySelector('.a-price-whole')?.innerText || //Amazon
      document.querySelector('.prod-sp')?.innerText || //Ajio
      document.querySelector('.mr-1')?.innerText || //Bewakoof
      document.querySelector('.price, .product-price')?.innerText || // Generic price selectors
      'Price Not Found';

    console.log('Extracted Product Details:', { title, price, image, url }); // Debugging

    if (!title || !price) {
      // Try extracting from an iframe
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          let doc = iframe.contentDocument || iframe.contentWindow.document;
          title =
            doc.querySelector('#productTitle')?.innerText?.trim() || title;
          price =
            doc.querySelector('.a-price-whole')?.innerText?.trim() || price;
        } catch (e) {
          console.warn('Blocked from accessing iframe:', e);
        }
      });
    }

    return { title, price, image, url };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getProduct') {
      sendResponse(getProductDetails());
    }
  });
})();
