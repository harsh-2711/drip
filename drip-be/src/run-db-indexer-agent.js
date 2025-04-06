const DBIndexerAgent = require('./agents/db-indexer');
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function main() {
  try {
    console.log('Starting Agent E: Database Indexer');
    
    // Load products with fit insights from Agent D
    const productsPath = path.join(__dirname, '..', 'data', 'products_with_fit_insights.json');
    
    if (!fs.existsSync(productsPath)) {
      console.error('Error: No products with fit insights found. Please run Agent D first.');
      return;
    }
    
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Loaded ${products.length} products from Agent D.`);
    
    // Initialize and run the database indexer agent
    const dbIndexerAgent = new DBIndexerAgent();
    
    // Test database connections
    console.log('Testing database connections...');
    const connectionsSuccessful = await dbIndexerAgent.testDatabaseConnections();
    
    if (!connectionsSuccessful) {
      console.error('Database connections failed. Please check your configuration.');
      return;
    }
    
    // Index products
    const indexedProducts = await dbIndexerAgent.indexProducts(products);
    
    console.log(`Indexing complete! Indexed ${indexedProducts.length} products.`);
    console.log(`Results saved to data/indexed_products.json`);
    
    // Run a test query
    console.log('Running a test query to verify the database setup...');
    const testQueryResults = await dbIndexerAgent.runTestQuery();
    
    console.log(`Test query results:`);
    console.log(`- PostgreSQL: Found ${testQueryResults.postgresProducts.length} products`);
    console.log(`- ${testQueryResults.vectorDbName || 'Vector DB'}: Found ${testQueryResults.vectorResults.length} similar products`);
  } catch (error) {
    console.error('Error running database indexer agent:', error);
  }
}

main();
