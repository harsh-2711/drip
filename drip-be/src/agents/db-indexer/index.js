const fs = require('fs');
const path = require('path');
const postgresDB = require('../../db/postgres');
const pineconeDB = require('../../db/pinecone');
const chromaDB = require('../../db/chroma');
const memoryVectorDB = require('../../db/memory-vector');
const config = require('../../config');

/**
 * Agent E: Database Indexer
 * Stores all structured fashion data in PostgreSQL and Pinecone
 */
class DBIndexerAgent {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../data/indexed_products');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Start the database indexing process
   * @param {Array} products - List of products with fit insights from Agent D
   * @returns {Promise<Array>} Indexed products
   */
  async indexProducts(products) {
    console.log('Starting database indexing process...');
    
    const indexedProducts = [];
    
    try {
      // Store brands in PostgreSQL
      console.log('Storing brands in PostgreSQL...');
      const brands = this.extractBrandsFromProducts(products);
      await postgresDB.storeBrands(brands);
      
      // Store products in PostgreSQL
      console.log('Storing products in PostgreSQL...');
      const storedProducts = await postgresDB.storeProducts(products);
      
      // Store product embeddings in vector database (Pinecone, Chroma, or Memory)
      let vectorDb, vectorDbName;
      
      if (config.vectorDb === 'pinecone') {
        vectorDb = pineconeDB;
        vectorDbName = 'Pinecone';
      } else if (config.vectorDb === 'chroma') {
        vectorDb = chromaDB;
        vectorDbName = 'Chroma';
      } else {
        vectorDb = memoryVectorDB;
        vectorDbName = 'Memory';
      }
      
      console.log(`Storing product embeddings in ${vectorDbName}...`);
      for (const product of products) {
        try {
          const vectorId = await vectorDb.storeProductEmbedding(product);
          
          // Update product in PostgreSQL with vector database ID
          await postgresDB.updateProductPineconeId(product.product_id, vectorId);
          
          // Add vector database ID to product
          product.vector_id = vectorId;
          
          indexedProducts.push(product);
          
          console.log(`Indexed product: ${product.title || 'Untitled Product'}`);
        } catch (error) {
          console.error(`Error indexing product ${product.product_id}:`, error);
        }
      }
      
      // Save indexed products to a JSON file
      const outputPath = path.join(this.outputDir, '../indexed_products.json');
      fs.writeFileSync(outputPath, JSON.stringify(indexedProducts, null, 2));
      
      console.log(`Indexing complete! Indexed ${indexedProducts.length} products.`);
    } catch (error) {
      console.error('Error during database indexing:', error);
    }
    
    return indexedProducts;
  }

  /**
   * Extract unique brands from products
   * @param {Array} products - List of products
   * @returns {Array} Unique brands
   */
  extractBrandsFromProducts(products) {
    const brandMap = new Map();
    
    for (const product of products) {
      if (product.brand && !brandMap.has(product.brand)) {
        brandMap.set(product.brand, {
          name: product.brand,
          url: product.brand_url || '',
          country: '',
          style_tags: []
        });
      }
    }
    
    return Array.from(brandMap.values());
  }

  /**
   * Test database connections and setup
   * @returns {Promise<boolean>} Whether the test was successful
   */
  async testDatabaseConnections() {
    try {
      console.log('Testing PostgreSQL connection...');
      await postgresDB.init();
      
      // Test vector database connection (Pinecone, Chroma, or Memory)
      let vectorDb, vectorDbName;
      
      if (config.vectorDb === 'pinecone') {
        vectorDb = pineconeDB;
        vectorDbName = 'Pinecone';
      } else if (config.vectorDb === 'chroma') {
        vectorDb = chromaDB;
        vectorDbName = 'Chroma';
      } else {
        vectorDb = memoryVectorDB;
        vectorDbName = 'Memory';
      }
      
      console.log(`Testing ${vectorDbName} connection...`);
      await vectorDb.init();
      
      console.log('Database connections successful!');
      return true;
    } catch (error) {
      console.error('Error testing database connections:', error);
      return false;
    }
  }

  /**
   * Run a test query to verify the database setup
   * @returns {Promise<Object>} Test query results
   */
  async runTestQuery() {
    try {
      console.log('Running test query...');
      
      // Query products from PostgreSQL
      const postgresProducts = await postgresDB.queryProducts({}, 5, 0);
      
      // Select vector database based on configuration
      let vectorDb, vectorDbName;
      
      if (config.vectorDb === 'pinecone') {
        vectorDb = pineconeDB;
        vectorDbName = 'Pinecone';
      } else if (config.vectorDb === 'chroma') {
        vectorDb = chromaDB;
        vectorDbName = 'Chroma';
      } else {
        vectorDb = memoryVectorDB;
        vectorDbName = 'Memory';
      }
      
      // If there are products, query similar products from vector database
      let vectorResults = [];
      if (postgresProducts.length > 0) {
        const firstProduct = postgresProducts[0];
        vectorResults = await vectorDb.querySimilarProductsById(firstProduct.product_id, {}, 5);
      } else {
        // If no products, query by text
        vectorResults = await vectorDb.querySimilarProductsByText('casual shirt', {}, 5);
      }
      
      return {
        postgresProducts,
        vectorResults,
        vectorDbName
      };
    } catch (error) {
      console.error('Error running test query:', error);
      return {
        postgresProducts: [],
        pineconeResults: []
      };
    }
  }
}

module.exports = DBIndexerAgent;
