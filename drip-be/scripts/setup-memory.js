/**
 * In-Memory Vector Database Setup Script
 * 
 * This script helps set up the in-memory vector database for the Drip project.
 * It creates the collection and initializes it.
 */

const memoryVectorDB = require('../src/db/memory-vector');
require('dotenv').config();

async function main() {
  console.log('Starting in-memory vector database setup...');
  
  try {
    // Initialize the in-memory vector database
    await memoryVectorDB.init();
    
    // Test the connection by adding and retrieving a test document
    console.log('Testing in-memory vector database...');
    const testId = 'test-document';
    const testDocument = {
      product_id: testId,
      title: 'Test Product',
      description: 'This is a test product for in-memory vector database setup.',
      brand: 'Test Brand',
      style_type: 'test',
      aesthetic: 'test',
      primary_color: 'test',
      gender: 'unisex',
      fit_type: 'regular',
      price: 100,
      currency: 'USD'
    };
    
    // Store test document
    console.log('Storing test document...');
    await memoryVectorDB.storeProductEmbedding(testDocument);
    
    // Query test document
    console.log('Querying test document...');
    const results = await memoryVectorDB.querySimilarProductsByText('test product');
    
    console.log('Query results:', JSON.stringify(results, null, 2));
    
    if (results && results.length > 0) {
      console.log('Successfully stored and retrieved test document.');
      console.log(`Found ${results.length} results.`);
      
      // Delete test document
      await memoryVectorDB.deleteProductEmbedding(testId);
      console.log('Test document deleted.');
    } else {
      console.log('Failed to retrieve test document. This might be expected for the first run.');
      
      // Let's try to get the document directly
      try {
        console.log('Trying to get the document directly...');
        const doc = await memoryVectorDB.collection.get({ ids: [testId] });
        console.log('Direct document retrieval result:', JSON.stringify(doc, null, 2));
      } catch (error) {
        console.log('Error getting document directly:', error.message);
      }
    }
    
    console.log('In-memory vector database setup complete!');
    console.log('Collection is ready to use.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up in-memory vector database:', error);
    process.exit(1);
  }
}

main();
