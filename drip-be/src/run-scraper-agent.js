const ScraperAgent = require('./agents/scraper');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Starting Agent B: Product Scraper');
    
    // Load discovered brands from Agent A
    const brandsPath = path.join(__dirname, '..', 'data', 'discovered_brands.json');
    
    if (!fs.existsSync(brandsPath)) {
      console.error('Error: No discovered brands found. Please run Agent A first.');
      return;
    }
    
    const brands = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
    console.log(`Loaded ${brands.length} brands from Agent A.`);
    
    // Initialize and run the scraper agent
    const scraperAgent = new ScraperAgent();
    const scrapedProducts = await scraperAgent.scrapeProducts(brands);
    
    // Save all scraped products to a single JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'all_products.json');
    fs.writeFileSync(outputPath, JSON.stringify(scrapedProducts, null, 2));
    
    console.log(`Scraping complete! Found ${scrapedProducts.length} products.`);
    console.log(`Results saved to ${outputPath} and individual brand files in data/products/`);
  } catch (error) {
    console.error('Error running scraper agent:', error);
  }
}

main();
