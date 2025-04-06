/**
 * Chroma Setup Script
 * 
 * This script helps set up the Chroma vector database for the Drip project.
 * It creates the collection if it doesn't exist and initializes it.
 */

const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { HuggingFaceTransformersEmbeddings } = require('@langchain/community/embeddings/hf_transformers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const collectionName = 'drip-products';
const dbDirectory = path.join(__dirname, '../data/chroma-db');

async function main() {
  console.log('Starting Chroma setup...');
  
  try {
    // Create the database directory if it doesn't exist
    if (!fs.existsSync(dbDirectory)) {
      fs.mkdirSync(dbDirectory, { recursive: true });
      console.log(`Created database directory: ${dbDirectory}`);
    }
    
    // Initialize HuggingFace embeddings
    console.log('Initializing HuggingFace embeddings...');
    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2", // A lightweight model that works well for semantic search
    });
    
    // Initialize Chroma client
    console.log('Connecting to Chroma...');
    const client = new Chroma({
      collectionName,
      url: process.env.CHROMA_URL, // Optional, for remote Chroma server
      embeddingFunction: embeddings,
      collectionMetadata: {
        "hnsw:space": "cosine"
      },
      path: dbDirectory
    });
    
    // Test the connection by adding and retrieving a test document
    console.log('Testing Chroma connection...');
    const testId = 'test-document';
    const testDocument = 'This is a test document for Chroma setup.';
    
    // Add test document
    await client.addDocuments({
      ids: [testId],
      documents: [testDocument],
      metadatas: [{ test: true }]
    });
    
    // Retrieve test document
    const result = await client.get([testId]);
    
    if (result && result.ids.includes(testId)) {
      console.log('Successfully added and retrieved test document.');
      
      // Delete test document
      await client.delete([testId]);
      console.log('Test document deleted.');
    } else {
      console.error('Failed to retrieve test document.');
    }
    
    console.log('Chroma setup complete!');
    console.log(`Collection '${collectionName}' is ready to use.`);
    console.log(`Database location: ${dbDirectory}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up Chroma:', error);
    process.exit(1);
  }
}

main();
