/**
 * Drip: Hyper-personalized Fashion
 * Fleet A: Data Ingestion & Curation Architecture
 * Fleet B: User Interaction & Recommendation Agents
 */

const DiscoveryAgent = require('./agents/discovery');
const ScraperAgent = require('./agents/scraper');
const ParserAgent = require('./agents/parser');
const ReviewParserAgent = require('./agents/review-parser');
const DBIndexerAgent = require('./agents/db-indexer');
const { startServer } = require('./api');
const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Run Agent A: Trendy Brand Discovery
 */
async function runDiscoveryAgent() {
  console.log('Starting Agent A: Trendy Brand Discovery');
  
  const discoveryAgent = new DiscoveryAgent();
  const discoveredBrands = await discoveryAgent.discoverBrands();
  
  // Save the discovered brands to a JSON file
  const outputPath = path.join(dataDir, 'discovered_brands.json');
  fs.writeFileSync(outputPath, JSON.stringify(discoveredBrands, null, 2));
  
  console.log(`Discovery complete! Found ${discoveredBrands.length} brands.`);
  console.log(`Results saved to ${outputPath}`);
  
  return discoveredBrands;
}

/**
 * Run Agent B: Product Scraper
 * @param {Array} brands - Discovered brands from Agent A
 */
async function runScraperAgent(brands) {
  console.log('Starting Agent B: Product Scraper');
  
  const scraperAgent = new ScraperAgent();
  const scrapedProducts = await scraperAgent.scrapeProducts(brands);
  
  // Save all scraped products to a single JSON file
  const outputPath = path.join(dataDir, 'all_products.json');
  fs.writeFileSync(outputPath, JSON.stringify(scrapedProducts, null, 2));
  
  console.log(`Scraping complete! Found ${scrapedProducts.length} products.`);
  console.log(`Results saved to ${outputPath} and individual brand files in data/products/`);
  
  return scrapedProducts;
}

/**
 * Run Agent C: Parsing & Metadata Enhancement
 * @param {Array} products - Scraped products from Agent B
 */
async function runParserAgent(products) {
  console.log('Starting Agent C: Parsing & Metadata Enhancement');
  
  const parserAgent = new ParserAgent();
  const enrichedProducts = await parserAgent.parseProducts(products);
  
  // Save all enriched products to a single JSON file
  const outputPath = path.join(dataDir, 'enriched_products.json');
  fs.writeFileSync(outputPath, JSON.stringify(enrichedProducts, null, 2));
  
  console.log(`Parsing complete! Enriched ${enrichedProducts.length} products.`);
  console.log(`Results saved to ${outputPath} and individual files in data/enriched_products/`);
  
  return enrichedProducts;
}

/**
 * Run Agent D: Review Parser & Fit Engine
 * @param {Array} products - Enriched products from Agent C
 */
async function runReviewParserAgent(products) {
  console.log('Starting Agent D: Review Parser & Fit Engine');
  
  const reviewParserAgent = new ReviewParserAgent();
  const productsWithFitInsights = await reviewParserAgent.parseReviews(products);
  
  // Save all products with fit insights to a single JSON file
  const outputPath = path.join(dataDir, 'products_with_fit_insights.json');
  fs.writeFileSync(outputPath, JSON.stringify(productsWithFitInsights, null, 2));
  
  console.log(`Review parsing complete! Processed ${productsWithFitInsights.length} products.`);
  console.log(`Results saved to ${outputPath} and individual files in data/fit_insights/`);
  
  return productsWithFitInsights;
}

/**
 * Run Agent E: Database Indexer
 * @param {Array} products - Products with fit insights from Agent D
 */
async function runDBIndexerAgent(products) {
  console.log('Starting Agent E: Database Indexer');
  
  const dbIndexerAgent = new DBIndexerAgent();
  
  // Test database connections
  console.log('Testing database connections...');
  const connectionsSuccessful = await dbIndexerAgent.testDatabaseConnections();
  
  if (!connectionsSuccessful) {
    console.error('Database connections failed. Please check your configuration.');
    return [];
  }
  
  // Index products
  const indexedProducts = await dbIndexerAgent.indexProducts(products);
  
  // Save all indexed products to a single JSON file
  const outputPath = path.join(dataDir, 'indexed_products.json');
  fs.writeFileSync(outputPath, JSON.stringify(indexedProducts, null, 2));
  
  console.log(`Indexing complete! Indexed ${indexedProducts.length} products.`);
  console.log(`Results saved to ${outputPath}`);
  
  return indexedProducts;
}

/**
 * Run Fleet B API Server
 */
async function runFleetBAPIServer() {
  console.log('Starting Fleet B: User Interaction & Recommendation Agents');
  
  try {
    // Start the API server
    console.log('Starting API server...');
    const server = await startServer();
    
    console.log('Fleet B API Server is running.');
    return server;
  } catch (error) {
    console.error('Error starting Fleet B API server:', error);
    throw error;
  }
}

/**
 * Main function to run both Fleet A and Fleet B
 */
async function main() {
  try {
    // Determine which fleet to run based on command line arguments
    const args = process.argv.slice(2);
    const runFleetA = args.includes('--fleet-a') || (!args.includes('--fleet-b') && !args.includes('--api-only'));
    const runFleetB = args.includes('--fleet-b') || args.includes('--api-only') || (!args.includes('--fleet-a'));
    
    if (runFleetA) {
      console.log('Starting Fleet A: Data Ingestion & Curation Architecture');
      
      // Agent A is not required for now, but we'll keep the logic and generation scripts
      // Use seed brands or previously discovered brands directly
      const discoveredBrandsPath = path.join(dataDir, 'discovered_brands.json');
      let discoveredBrands = [];
      
      if (fs.existsSync(discoveredBrandsPath)) {
        console.log('Using previously discovered brands from file');
        discoveredBrands = JSON.parse(fs.readFileSync(discoveredBrandsPath, 'utf8'));
      } else {
        console.log('No discovered brands file found, using seed brands from config');
        // Get seed brands from config
        const config = require('./config');
        discoveredBrands = config.seedBrands || [];
        // Save the seed brands to a JSON file for consistency
        fs.writeFileSync(discoveredBrandsPath, JSON.stringify(discoveredBrands, null, 2));
      }
      
      console.log(`Using ${discoveredBrands.length} brands for scraping.`);
      
      // Step 2: Run Agent B - Product Scraper
      const scrapedProducts = await runScraperAgent(discoveredBrands);
      
      // Step 3: Run Agent C - Parsing & Metadata Enhancement
      const enrichedProducts = await runParserAgent(scrapedProducts);
      
      // Step 4: Run Agent D - Review Parser & Fit Engine
      const productsWithFitInsights = await runReviewParserAgent(enrichedProducts);
      
      // Step 5: Database & Indexing
      const indexedProducts = await runDBIndexerAgent(productsWithFitInsights);
      
      console.log('Fleet A pipeline completed successfully!');
    }
    
    if (runFleetB) {
      // Run Fleet B API Server
      await runFleetBAPIServer();
    }
  } catch (error) {
    console.error('Error running Drip backend:', error);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

// Export functions for use in other modules
module.exports = {
  runDiscoveryAgent,
  runFleetBAPIServer,
  main,
};
