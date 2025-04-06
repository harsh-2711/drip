const ParserAgent = require('./agents/parser');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Starting Agent C: Parsing & Metadata Enhancement');
    
    // Load scraped products from Agent B
    const productsPath = path.join(__dirname, '..', 'data', 'all_products.json');
    
    if (!fs.existsSync(productsPath)) {
      console.error('Error: No scraped products found. Please run Agent B first.');
      return;
    }
    
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Loaded ${products.length} products from Agent B.`);
    
    // Initialize and run the parser agent
    const parserAgent = new ParserAgent();
    const enrichedProducts = await parserAgent.parseProducts(products);
    
    console.log(`Parsing complete! Enriched ${enrichedProducts.length} products.`);
    console.log(`Results saved to data/enriched_products.json and individual files in data/enriched_products/`);
  } catch (error) {
    console.error('Error running parser agent:', error);
  }
}

main();
