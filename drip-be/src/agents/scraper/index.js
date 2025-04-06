const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const config = require('../../config');
const axios = require('axios');

/**
 * Agent B: Product Scraper
 * Scrapes product listings from fashion brand websites or fetches from Shopify API
 */
class ScraperAgent {
  constructor() {
    this.productCategories = ['jeans', 'shirts', 'kurtas', 'co-ords', 'dresses'];
    this.outputDir = path.join(__dirname, '../../../data/products');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Minimum description word count for filtering
    this.minDescriptionWordCount = 10;
  }

  /**
   * Start the scraping process for all brands
   * @param {Array} brands - List of discovered brands from Agent A
   * @param {number} maxProductsPerBrand - Maximum number of products to scrape per brand
   * @returns {Promise<Array>} Scraped products
   */
  async scrapeProducts(brands, maxProductsPerBrand = config.scraping.maxProductsPerBrand) {
    console.log('Starting product scraping process...');
    
    const allProducts = [];
    
    for (const brand of brands) {
      // Handle both formats of brand objects (from seed brands and discovered brands)
      const brandName = brand.brand_name || brand.name;
      const brandUrl = brand.brand_url || brand.url;
      
      console.log(`Processing products from ${brandName} (${brandUrl})...`);
      
      try {
        let products = [];
        
        // Check if this is a Shopify API endpoint
        if (brandUrl && brandUrl.includes('/products.json')) {
          console.log(`Using Shopify API for ${brandName}`);
          products = await this.fetchProductsFromShopifyAPI(brand, maxProductsPerBrand);
        } else {
          console.log(`Web scraping for ${brandName}`);
          products = await this.scrapeProductsFromBrand(brand, maxProductsPerBrand);
        }
        
        // Filter products with insufficient descriptions
        const filteredProducts = this.filterProducts(products);
        console.log(`Filtered out ${products.length - filteredProducts.length} products with insufficient descriptions`);
        
        allProducts.push(...filteredProducts);
        
        // Save products to a JSON file per brand
        const brandSlug = this.slugify(brandName);
        const outputPath = path.join(this.outputDir, `${brandSlug}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(filteredProducts, null, 2));
        
        console.log(`Processed ${filteredProducts.length} products from ${brandName}`);
      } catch (error) {
        console.error(`Error processing products from ${brandName}:`, error);
      }
    }
    
    console.log(`Processing complete. Found ${allProducts.length} products.`);
    return allProducts;
  }
  
  /**
   * Filter products based on criteria (description length, images, etc.)
   * @param {Array} products - List of products to filter
   * @returns {Array} Filtered products
   */
  filterProducts(products) {
    return products.filter(product => {
      // Filter out products without images
      if (!product.image_urls || product.image_urls.length === 0) {
        return false;
      }
      
      // Filter out products with insufficient descriptions
      if (product.description) {
        const wordCount = product.description.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < this.minDescriptionWordCount) {
          return false;
        }
      } else {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Fetch products from Shopify API
   * @param {Object} brand - Brand information
   * @param {number} maxProducts - Maximum number of products to fetch
   * @returns {Promise<Array>} Fetched products
   */
  async fetchProductsFromShopifyAPI(brand, maxProducts) {
    try {
      // Handle both formats of brand objects
      const brandName = brand.brand_name || brand.name;
      const brandUrl = brand.brand_url || brand.url;
      
      console.log(`Fetching products from Shopify API: ${brandUrl}`);
      
      const response = await axios.get(brandUrl);
      const shopifyData = response.data;
      
      if (!shopifyData.products || !Array.isArray(shopifyData.products)) {
        console.error(`Invalid Shopify API response from ${brandUrl}`);
        return [];
      }
      
      // Limit the number of products
      const limitedProducts = shopifyData.products.slice(0, maxProducts);
      
      // Transform Shopify products to our format
      const products = [];
      
      for (const shopifyProduct of limitedProducts) {
        // Create a dummy description by combining product_type, tags, and handle
        let description = shopifyProduct.product_type || '';
        
        if (shopifyProduct.tags && Array.isArray(shopifyProduct.tags)) {
          description += ' ' + shopifyProduct.tags.join(' ');
        }
        
        if (shopifyProduct.handle) {
          description += ' ' + shopifyProduct.handle.replace(/-/g, ' ');
        }
        
        // Use the first variant for price and other details
        const firstVariant = shopifyProduct.variants && shopifyProduct.variants.length > 0 
          ? shopifyProduct.variants[0] 
          : {};
        
        // Extract all image URLs
        const imageUrls = shopifyProduct.images && Array.isArray(shopifyProduct.images)
          ? shopifyProduct.images.map(img => img.src).filter(src => src)
          : [];
        
        // Skip products without images
        if (imageUrls.length === 0) {
          console.log(`Skipping product ${shopifyProduct.title || 'Untitled'}: No images found`);
          continue;
        }
        
        // Check if description is long enough
        const wordCount = description.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount < this.minDescriptionWordCount) {
          console.log(`Skipping product ${shopifyProduct.title || 'Untitled'}: Description too short (${wordCount} words)`);
          continue;
        }
        
        const product = {
          product_id: `shopify-${shopifyProduct.id}`,
          title: shopifyProduct.title,
          description: description,
          brand: brandName,
          brand_url: brandUrl.split('/products.json')[0], // Remove the /products.json part
          price: parseFloat(firstVariant.price || 0),
          currency: firstVariant.currency || 'USD', // Default currency
          image_urls: imageUrls,
          tags: shopifyProduct.tags || [],
          available_sizes: [], // Don't populate as per requirements
          scraped_at: new Date().toISOString(),
          source: 'shopify_api'
        };
        
        products.push(product);
      }
      
      return products;
    } catch (error) {
      console.error(`Error fetching products from Shopify API ${brand.brand_url || brand.url}:`, error);
      return [];
    }
  }

  /**
   * Scrape products from a single brand
   * @param {Object} brand - Brand information
   * @param {number} maxProducts - Maximum number of products to scrape
   * @returns {Promise<Array>} Scraped products
   */
  async scrapeProductsFromBrand(brand, maxProducts) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const products = [];
    
    try {
      // Handle both formats of brand objects
      const brandUrl = brand.brand_url || brand.url;
      
      // Navigate to the brand's website
      await page.goto(brandUrl, { timeout: 60000 });
      
      // Try to find product links on the homepage
      let productLinks = await this.findProductLinks(page);
      
      // If no product links found on homepage, try to navigate to product categories
      if (productLinks.length === 0) {
        productLinks = await this.navigateToProductCategories(page, brand);
      }
      
      // Limit the number of products to scrape
      productLinks = productLinks.slice(0, maxProducts);
      
      // Scrape each product
      for (const productLink of productLinks) {
        try {
          const product = await this.scrapeProduct(context, productLink, brand);
          if (product) {
            products.push(product);
          }
        } catch (error) {
          console.error(`Error scraping product ${productLink}:`, error);
        }
      }
    } catch (error) {
      // Handle both formats of brand objects
      const brandName = brand.brand_name || brand.name;
      console.error(`Error scraping brand ${brandName}:`, error);
    } finally {
      await browser.close();
    }
    
    return products;
  }

  /**
   * Find product links on the current page
   * @param {Page} page - Playwright page
   * @returns {Promise<Array<string>>} Product links
   */
  async findProductLinks(page) {
    // Common selectors for product links
    const productLinkSelectors = [
      'a[href*="product"]',
      'a[href*="products"]',
      'a.product-item',
      'a.product-link',
      'a.product-card',
      'a.product-tile',
      'a[href*="item"]',
      'a[href*="detail"]',
      '.product a',
      '.product-grid a',
      '.products-grid a'
    ];
    
    // Try each selector and collect unique links
    const productLinks = new Set();
    
    for (const selector of productLinkSelectors) {
      try {
        const links = await page.$$eval(selector, elements => 
          elements.map(el => el.href).filter(href => href && href.length > 0)
        );
        
        links.forEach(link => productLinks.add(link));
      } catch (error) {
        // Ignore errors for selectors that don't match
      }
    }
    
    return Array.from(productLinks);
  }

  /**
   * Navigate to product categories and find product links
   * @param {Page} page - Playwright page
   * @param {Object} brand - Brand information
   * @returns {Promise<Array<string>>} Product links
   */
  async navigateToProductCategories(page, brand) {
    const allProductLinks = new Set();
    
    // Common selectors for category navigation
    const categoryLinkSelectors = [
      'a[href*="category"]',
      'a[href*="collection"]',
      'a[href*="shop"]',
      'nav a',
      '.menu a',
      '.navigation a',
      'header a'
    ];
    
    // Try to find category links
    const categoryLinks = new Set();
    
    for (const selector of categoryLinkSelectors) {
      try {
        const links = await page.$$eval(selector, elements => 
          elements.map(el => ({
            href: el.href,
            text: el.textContent.toLowerCase().trim()
          })).filter(link => link.href && link.href.length > 0)
        );
        
        // Filter links that might be product categories
        for (const link of links) {
          for (const category of this.productCategories) {
            if (link.text.includes(category) || link.href.includes(category)) {
              categoryLinks.add(link.href);
              break;
            }
          }
        }
      } catch (error) {
        // Ignore errors for selectors that don't match
      }
    }
    
    // Visit each category page and collect product links
    for (const categoryLink of categoryLinks) {
      try {
        await page.goto(categoryLink, { timeout: 30000 });
        const productLinks = await this.findProductLinks(page);
        productLinks.forEach(link => allProductLinks.add(link));
      } catch (error) {
        console.error(`Error navigating to category ${categoryLink}:`, error);
      }
    }
    
    return Array.from(allProductLinks);
  }

  /**
   * Scrape a single product
   * @param {BrowserContext} context - Playwright browser context
   * @param {string} productUrl - Product URL
   * @param {Object} brand - Brand information
   * @returns {Promise<Object|null>} Product information
   */
  async scrapeProduct(context, productUrl, brand) {
    const page = await context.newPage();
    
    try {
      await page.goto(productUrl, { timeout: 30000 });
      
      // Wait for the page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Handle both formats of brand objects
      const brandName = brand.brand_name || brand.name;
      const brandUrl = brand.brand_url || brand.url;
      
      // Extract product information using various selectors
      const product = {
        product_url: productUrl,
        brand: brandName,
        brand_url: brandUrl,
        raw_html: await page.content(),
        scraped_at: new Date().toISOString(),
        source: 'web_scraping'
      };
      
      // Extract title
      product.title = await this.extractText(page, [
        'h1',
        '.product-title',
        '.product-name',
        '.product-info h1',
        '[data-testid="product-title"]',
        '[class*="product-title"]',
        '[class*="productTitle"]'
      ]);
      
      // Extract description
      product.description = await this.extractText(page, [
        '.product-description',
        '.description',
        '[data-testid="product-description"]',
        '[class*="description"]',
        'p.details',
        '.product-details',
        '.product-info p'
      ]);
      
      // Extract price
      const priceText = await this.extractText(page, [
        '.price',
        '[data-testid="product-price"]',
        '[class*="price"]',
        '.product-price',
        '.amount',
        '[class*="amount"]'
      ]);
      
      if (priceText) {
        // Extract numbers from price text
        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
          product.price = parseFloat(priceMatch[0].replace(/,/g, ''));
          
          // Try to determine currency
          if (priceText.includes('₹') || priceText.includes('INR')) {
            product.currency = 'INR';
          } else if (priceText.includes('$')) {
            product.currency = 'USD';
          } else if (priceText.includes('€')) {
            product.currency = 'EUR';
          } else if (priceText.includes('£')) {
            product.currency = 'GBP';
          } else {
            product.currency = 'INR'; // Default to INR for Indian brands
          }
        }
      }
      
      // Extract image URLs
      product.image_urls = await this.extractImageUrls(page, [
        '.product-image img',
        '.product-gallery img',
        '[data-testid="product-image"] img',
        '[class*="product-image"] img',
        '[class*="productImage"] img',
        '.gallery img',
        '.carousel img',
        'img[src*="product"]'
      ]);
      
      // We're not populating available_sizes as per requirements
      product.available_sizes = [];
      
      // Extract tags/categories
      product.tags = await this.extractTags(page);
      
      // Generate a unique product ID
      product.product_id = this.generateProductId(product);
      
      return product;
    } catch (error) {
      console.error(`Error scraping product ${productUrl}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Extract text from the page using multiple selectors
   * @param {Page} page - Playwright page
   * @param {Array<string>} selectors - CSS selectors to try
   * @returns {Promise<string|null>} Extracted text
   */
  async extractText(page, selectors) {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        }
      } catch (error) {
        // Ignore errors for selectors that don't match
      }
    }
    
    return null;
  }

  /**
   * Extract image URLs from the page
   * @param {Page} page - Playwright page
   * @param {Array<string>} selectors - CSS selectors to try
   * @returns {Promise<Array<string>>} Image URLs
   */
  async extractImageUrls(page, selectors) {
    const imageUrls = new Set();
    
    // Additional selectors for product image galleries
    const gallerySelectors = [
      '.product-gallery img',
      '.product-images img',
      '.product-thumbnails img',
      '.product-carousel img',
      '.product-slider img',
      '.thumbnail-images img',
      '.alternate-images img',
      '.additional-images img',
      '.image-gallery img',
      '[data-gallery-role="gallery"] img',
      '[data-gallery-role="gallery-placeholder"] img',
      '[data-gallery-role="gallery-navigation"] img',
      '[data-gallery-role="gallery-thumbnails"] img',
      '[data-gallery-role="gallery-zoom"] img',
      '[data-gallery-role="gallery-fullscreen"] img',
      '[data-gallery-role="gallery-preview"] img',
      '[data-gallery-role="gallery-main"] img'
    ];
    
    // Combine the provided selectors with gallery selectors
    const allSelectors = [...selectors, ...gallerySelectors];
    
    for (const selector of allSelectors) {
      try {
        const urls = await page.$$eval(selector, elements => 
          elements.map(el => el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src'))
            .filter(src => src && src.length > 0)
        );
        
        urls.forEach(url => imageUrls.add(url));
      } catch (error) {
        // Ignore errors for selectors that don't match
      }
    }
    
    return Array.from(imageUrls);
  }

  /**
   * Extract tags/categories from the page
   * @param {Page} page - Playwright page
   * @returns {Promise<Array<string>>} Tags/categories
   */
  async extractTags(page) {
    const tagSelectors = [
      '.breadcrumb li',
      '.breadcrumbs li',
      '.product-categories a',
      '.categories a',
      '[data-testid="product-category"]',
      '[class*="category"] a',
      '[class*="tag"] a',
      '.tags a'
    ];
    
    for (const selector of tagSelectors) {
      try {
        const tags = await page.$$eval(selector, elements => 
          elements.map(el => el.textContent.trim())
            .filter(tag => tag && tag.length > 0 && tag !== 'Home' && !tag.includes('»'))
        );
        
        if (tags.length > 0) {
          return tags;
        }
      } catch (error) {
        // Ignore errors for selectors that don't match
      }
    }
    
    return [];
  }

  /**
   * Generate a unique product ID
   * @param {Object} product - Product information
   * @returns {string} Product ID
   */
  generateProductId(product) {
    const brandSlug = this.slugify(product.brand);
    let productName = product.title || '';
    productName = this.slugify(productName);
    
    // Use SKU if available, otherwise use a hash of the URL
    const identifier = product.sku || this.hashString(product.product_url);
    
    return `${brandSlug}-${productName}-${identifier}`.substring(0, 50);
  }

  /**
   * Convert a string to a slug
   * @param {string} text - Text to convert
   * @returns {string} Slug
   */
  slugify(text) {
    if (!text) return '';
    
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Generate a simple hash of a string
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  hashString(str) {
    let hash = 0;
    if (!str) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16).substring(0, 8);
  }
}

module.exports = ScraperAgent;
