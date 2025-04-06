/**
 * Pinecone Setup Script
 * 
 * This script helps set up the Pinecone vector database for the Drip project.
 * It creates the index if it doesn't exist and initializes it.
 */

const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

// Configuration
const indexName = 'drip-products';
const dimension = 1536; // OpenAI embeddings dimension

async function main() {
  console.log('Starting Pinecone setup...');
  
  try {
    // Check for API key
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      console.error('Error: PINECONE_API_KEY environment variable is not set.');
      console.log('Please set your Pinecone API key in the .env file:');
      console.log('PINECONE_API_KEY=your_pinecone_api_key_here');
      process.exit(1);
    }
    
    // Initialize Pinecone client
    console.log('Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey
    });
    
    // List existing indexes
    console.log('Checking for existing indexes...');
    const indexNames = await listIndicesName(pinecone);
    console.log('Available indexes:', indexNames);
    
    // Check if index exists
    if (!indexNames.includes(indexName)) {
      console.log(`Index '${indexName}' does not exist. Creating...`);
      
      // Create index
      await pinecone.createIndex({
        name: indexName,
        dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      console.log(`Index '${indexName}' creation initiated.`);
      console.log('Note: Index creation can take up to 1-2 minutes to complete.');
      console.log('Waiting for index to be ready...');
      
      // Wait for index to be ready (up to 2 minutes)
      let isReady = false;
      const maxAttempts = 12;
      let attempts = 0;
      
      while (!isReady && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const updatedIndexNames = await listIndicesName(pinecone);
        if (updatedIndexNames.includes(indexName)) {
          isReady = true;
          console.log(`Index '${indexName}' is now ready.`);
        } else {
          console.log(`Waiting for index to be ready... (${attempts}/${maxAttempts})`);
        }
      }
      
      if (!isReady) {
        console.log('Index creation is taking longer than expected.');
        console.log('Please check the Pinecone console to verify when it\'s ready.');
      }
    } else {
      console.log(`Index '${indexName}' already exists.`);
    }
    
    // Get index details
    console.log('Retrieving index details...');
    const index = pinecone.index(indexName);
    const stats = await index.describeIndexStats();
    
    console.log('Index details:');
    console.log(`- Name: ${indexName}`);
    console.log(`- Dimension: ${dimension}`);
    console.log(`- Total vector count: ${stats.totalVectorCount}`);
    
    console.log('Pinecone setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up Pinecone:', error);
    process.exit(1);
  }
}

async function listIndicesName(pinecone) {
  const indexesResponse = await pinecone.listIndexes();
  const indexNames = indexesResponse.indexes?.map((index) => index.name);
  return indexNames;
}

main();
