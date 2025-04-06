const ReviewParserAgent = require('./agents/review-parser');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    console.log('Starting Agent D: Review Parser & Fit Engine');
    
    // Load enriched products from Agent C
    const productsPath = path.join(__dirname, '..', 'data', 'enriched_products.json');
    
    if (!fs.existsSync(productsPath)) {
      console.error('Error: No enriched products found. Please run Agent C first.');
      return;
    }
    
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Loaded ${products.length} products from Agent C.`);
    
    // Initialize and run the review parser agent
    const reviewParserAgent = new ReviewParserAgent();
    const productsWithFitInsights = await reviewParserAgent.parseReviews(products);
    
    console.log(`Review parsing complete! Processed ${productsWithFitInsights.length} products.`);
    console.log(`Results saved to data/products_with_fit_insights.json and individual files in data/fit_insights/`);
  } catch (error) {
    console.error('Error running review parser agent:', error);
  }
}

main();
