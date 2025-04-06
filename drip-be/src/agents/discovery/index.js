const { chatModel } = require('../../utils/openai');
const { scrapeSearchResults, checkHttps, checkCleanUI, checkDropshippingSigns } = require('../../utils/scraper');
const config = require('../../config');

/**
 * Agent A: Trendy Brand Discovery
 * Discovers high-quality fashion websites based on criteria
 */
class DiscoveryAgent {
  constructor() {
    this.seedBrands = config.seedBrands;
    this.searchKeywords = config.searchKeywords;
    this.filteringCriteria = config.brandFilteringCriteria;
    this.discoveredBrands = [];
  }

  /**
   * Start the discovery process
   * @param {number} maxBrands - Maximum number of brands to discover
   * @returns {Promise<Array>} Discovered brands
   */
  async discoverBrands(maxBrands = config.scraping.maxBrandsToDiscover) {
    console.log('Starting brand discovery process...');
    
    // Start with seed brands
    this.discoveredBrands = [...this.seedBrands];
    console.log(`Added ${this.seedBrands.length} seed brands`);
    
    // Discover additional brands using search keywords
    for (const keyword of this.searchKeywords) {
      if (this.discoveredBrands.length >= maxBrands) {
        break;
      }
      
      console.log(`Searching for brands with keyword: "${keyword}"`);
      const searchResults = await scrapeSearchResults(keyword, 10);
      
      for (const result of searchResults) {
        if (this.discoveredBrands.length >= maxBrands) {
          break;
        }
        
        // Check if this URL is already in discovered brands
        const isDuplicate = this.discoveredBrands.some(brand => 
          brand.url === result.url || brand.url.includes(new URL(result.url).hostname)
        );
        
        if (!isDuplicate) {
          const brandInfo = await this.evaluateBrand(result);
          if (brandInfo) {
            this.discoveredBrands.push(brandInfo);
            console.log(`Discovered new brand: ${brandInfo.name} (${brandInfo.url})`);
          }
        }
      }
    }
    
    console.log(`Discovery complete. Found ${this.discoveredBrands.length} brands.`);
    return this.discoveredBrands;
  }

  /**
   * Evaluate a potential brand website
   * @param {Object} searchResult - Search result object
   * @returns {Promise<Object|null>} Brand info or null if rejected
   */
  async evaluateBrand(searchResult) {
    const { url, title, description } = searchResult;
    
    try {
      // Apply filtering criteria
      if (this.filteringCriteria.mustHaveHttps && !await checkHttps(url)) {
        console.log(`Rejected ${url}: No HTTPS`);
        return null;
      }
      
      if (!await checkCleanUI(url)) {
        console.log(`Rejected ${url}: Poor UI or no product catalog`);
        return null;
      }
      
      if (await checkDropshippingSigns(url, this.filteringCriteria.dropshippingRedFlags)) {
        console.log(`Rejected ${url}: Dropshipping signs detected`);
        return null;
      }
      
      // Use GPT to analyze the brand
      const brandAnalysis = await this.analyzeBrandWithGPT(url, title, description);
      
      // Apply Indian brand preference if configured
      if (this.filteringCriteria.preferIndianBrands && 
          brandAnalysis.country.toLowerCase() !== 'india' && 
          !brandAnalysis.country.toLowerCase().includes('india')) {
        // Don't immediately reject, but lower the rating
        brandAnalysis.rating_estimate -= 1;
      }
      
      // Only accept brands with a minimum rating
      if (brandAnalysis.rating_estimate < 3) {
        console.log(`Rejected ${url}: Low quality rating (${brandAnalysis.rating_estimate}/5)`);
        return null;
      }
      
      return {
        brand_url: url,
        brand_name: brandAnalysis.name,
        country: brandAnalysis.country,
        style_tags: brandAnalysis.style_tags,
        homepage_type: brandAnalysis.homepage_type,
        rating_estimate: brandAnalysis.rating_estimate
      };
    } catch (error) {
      console.error(`Error evaluating brand ${url}:`, error);
      return null;
    }
  }

  /**
   * Use GPT to analyze a brand website
   * @param {string} url - Website URL
   * @param {string} title - Website title
   * @param {string} description - Website description
   * @returns {Promise<Object>} Brand analysis
   */
  async analyzeBrandWithGPT(url, title, description) {
    try {
      // Create messages for chat completion
      const messages = [
        {
          role: "system",
          content: "You are a fashion industry expert who analyzes brand websites and extracts structured information. Always respond with valid JSON."
        },
        {
          role: "user",
          content: `
            Analyze this fashion brand website:
            URL: ${url}
            Title: ${title}
            Description: ${description}
            
            Extract the following information:
            1. Brand name
            2. Country of origin (best guess)
            3. Style tags (list of 2-4 style descriptors like "minimalist", "luxury", "ethnic", "streetwear", etc.)
            4. Homepage type (e-commerce, lookbook, etc.)
            5. Quality rating estimate (1-5, where 5 is highest quality luxury brand)
            
            Format your response as a JSON object with the following keys:
            name, country, style_tags (array), homepage_type, rating_estimate (number)
          `
        }
      ];
      
      // Use the chat model to get a response
      const response = await chatModel.invoke(messages);
      
      // Parse the JSON response
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        name: title.split(' - ')[0].split(' | ')[0],
        country: 'Unknown',
        style_tags: ['fashion'],
        homepage_type: 'e-commerce',
        rating_estimate: 3
      };
    } catch (error) {
      console.error('Error analyzing brand with GPT:', error);
      
      // Fallback if GPT analysis fails
      return {
        name: title.split(' - ')[0].split(' | ')[0],
        country: 'Unknown',
        style_tags: ['fashion'],
        homepage_type: 'e-commerce',
        rating_estimate: 3
      };
    }
  }
}

module.exports = DiscoveryAgent;
