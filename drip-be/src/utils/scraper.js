const { chromium } = require('playwright');

/**
 * Initialize a Playwright browser instance
 * @returns {Promise<Browser>} Playwright browser instance
 */
async function initBrowser() {
  return await chromium.launch({
    headless: true, // Run in headless mode
  });
}

/**
 * Scrape search results from a search engine
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array<{title: string, url: string, description: string}>>} Search results
 */
async function scrapeSearchResults(query, maxResults = 10) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    // Use Google search
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    
    // Wait for search results to load
    await page.waitForSelector('div#search');
    
    // Extract search results
    const results = await page.evaluate((max) => {
      const searchResults = [];
      const resultElements = document.querySelectorAll('div.g');
      
      for (let i = 0; i < Math.min(resultElements.length, max); i++) {
        const element = resultElements[i];
        const titleElement = element.querySelector('h3');
        const linkElement = element.querySelector('a');
        const descriptionElement = element.querySelector('div.VwiC3b');
        
        if (titleElement && linkElement && descriptionElement) {
          searchResults.push({
            title: titleElement.innerText,
            url: linkElement.href,
            description: descriptionElement.innerText,
          });
        }
      }
      
      return searchResults;
    }, maxResults);
    
    return results;
  } catch (error) {
    console.error('Error scraping search results:', error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Check if a website has HTTPS
 * @param {string} url - Website URL
 * @returns {Promise<boolean>} True if website has HTTPS
 */
async function checkHttps(url) {
  return url.startsWith('https://');
}

/**
 * Check if a website has clean UI (basic heuristic)
 * @param {string} url - Website URL
 * @returns {Promise<boolean>} True if website has clean UI
 */
async function checkCleanUI(url) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { timeout: 30000 });
    
    // Basic heuristics for clean UI
    const result = await page.evaluate(() => {
      // Check if there are too many popups
      const popups = document.querySelectorAll('.popup, .modal, [class*="popup"], [class*="modal"]');
      const tooManyPopups = popups.length > 2;
      
      // Check if there are too many ads
      const ads = document.querySelectorAll('[id*="ad"], [class*="ad-"], [class*="ad_"], iframe[src*="ad"]');
      const tooManyAds = ads.length > 5;
      
      // Check if there's a product catalog
      const hasProductCatalog = document.querySelectorAll('.product, .products, [class*="product"], [class*="catalog"]').length > 0;
      
      return {
        isClean: !tooManyPopups && !tooManyAds,
        hasProductCatalog,
      };
    });
    
    return result.isClean && result.hasProductCatalog;
  } catch (error) {
    console.error(`Error checking UI for ${url}:`, error);
    return false;
  } finally {
    await browser.close();
  }
}

/**
 * Check if a website has dropshipping signs
 * @param {string} url - Website URL
 * @param {Array<string>} redFlags - List of dropshipping red flags
 * @returns {Promise<boolean>} True if website has dropshipping signs
 */
async function checkDropshippingSigns(url, redFlags) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { timeout: 30000 });
    
    // Check for dropshipping signs
    const result = await page.evaluate((flags) => {
      const pageText = document.body.innerText.toLowerCase();
      const pageHtml = document.body.innerHTML.toLowerCase();
      
      // Check if any red flags are present in the page text or HTML
      for (const flag of flags) {
        if (pageText.includes(flag) || pageHtml.includes(flag)) {
          return true;
        }
      }
      
      return false;
    }, redFlags);
    
    return result;
  } catch (error) {
    console.error(`Error checking dropshipping signs for ${url}:`, error);
    return true; // Assume it has dropshipping signs if there's an error
  } finally {
    await browser.close();
  }
}

module.exports = {
  initBrowser,
  scrapeSearchResults,
  checkHttps,
  checkCleanUI,
  checkDropshippingSigns,
};
