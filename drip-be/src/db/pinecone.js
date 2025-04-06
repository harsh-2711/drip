const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('@langchain/openai');
const config = require('../config');

/**
 * Pinecone database utility for vector embeddings
 */
class PineconeDB {
  constructor() {
    this.pinecone = null;
    this.index = null;
    this.embeddings = null;
    this.isInitialized = false;
    this.namespace = 'drip-products';
  }

  /**
   * Initialize the Pinecone database connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize Pinecone client
      this.pinecone = new Pinecone({
        apiKey: config.pinecone.apiKey
      });

      // Get or create index
      const indexName = config.pinecone.indexName;
      const indexesResponse = await this.pinecone.listIndexes();
      const indexNames = indexesResponse.indexes?.map((index) => index.name);
      console.log('Available indexes:', indexNames);
      
      if (!indexNames.includes(indexName)) {
        console.log(`Creating Pinecone index: ${indexName}`);
        await this.pinecone.createIndex({
          name: indexName,
          dimension: 1536, // OpenAI embeddings dimension
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      
      this.index = this.pinecone.index(indexName);
      
      // Initialize OpenAI embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: config.openai.apiKey,
        batchSize: 512,
        modelName: 'text-embedding-ada-002'
      });
      
      console.log('Pinecone connection has been established successfully.');
      this.isInitialized = true;
    } catch (error) {
      console.error('Unable to connect to Pinecone:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a product
   * @param {Object} product - Product to generate embedding for
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateEmbedding(product) {
    // Create a rich text representation of the product
    const textRepresentation = `
      Product: ${product.title || ''}
      Brand: ${product.brand || ''}
      Description: ${product.description || ''}
      Style: ${product.style_type || ''}
      Aesthetic: ${product.aesthetic || ''}
      Color: ${product.primary_color || ''}
      Fabric: ${product.fabric || ''}
      Gender: ${product.gender || ''}
      Fit: ${product.fit_type || ''}
      Occasion: ${product.occasion ? product.occasion.join(', ') : ''}
      Tags: ${product.tags ? product.tags.join(', ') : ''}
    `;
    
    // Generate embedding
    const embedding = await this.embeddings.embedQuery(textRepresentation);
    return embedding;
  }

  /**
   * Store product embedding in Pinecone
   * @param {Object} product - Product to store
   * @returns {Promise<string>} Pinecone ID
   */
  async storeProductEmbedding(product) {
    await this.init();
    
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(product);
      
      // Create metadata
      const metadata = {
        product_id: product.product_id,
        title: product.title,
        brand: product.brand,
        style_type: product.style_type,
        aesthetic: product.aesthetic,
        primary_color: product.primary_color,
        gender: product.gender,
        fit_type: product.fit_type,
        price: product.price,
        currency: product.currency
      };
      
      // Store in Pinecone
      const pineconeId = product.product_id;
      await this.index.upsert([{
        id: pineconeId,
        values: embedding,
        metadata
      }]);
      
      return pineconeId;
    } catch (error) {
      console.error(`Error storing product embedding for ${product.product_id}:`, error);
      throw error;
    }
  }

  /**
   * Query similar products by text
   * @param {string} queryText - Text to query
   * @param {Object} filters - Metadata filters
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} Similar products
   */
  async querySimilarProductsByText(queryText, filters = {}, topK = 10) {
    await this.init();
    
    try {
      // Generate embedding for query text
      const queryEmbedding = await this.embeddings.embedQuery(queryText);
      
      // Create filter expression
      const filterExpression = this.createFilterExpression(filters);
      
      // Query Pinecone
      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: filterExpression
      });
      
      return queryResponse.matches;
    } catch (error) {
      console.error('Error querying similar products:', error);
      throw error;
    }
  }

  /**
   * Query similar products by product ID
   * @param {string} productId - Product ID to find similar products for
   * @param {Object} filters - Metadata filters
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} Similar products
   */
  async querySimilarProductsById(productId, filters = {}, topK = 10) {
    await this.init();
    
    try {
      // Create filter expression
      const filterExpression = this.createFilterExpression(filters);
      
      // Query Pinecone
      const queryResponse = await this.index.query({
        id: productId,
        topK,
        includeMetadata: true,
        filter: filterExpression
      });
      
      return queryResponse.matches;
    } catch (error) {
      console.error(`Error querying similar products for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Create filter expression for Pinecone query
   * @param {Object} filters - Metadata filters
   * @returns {Object} Filter expression
   */
  createFilterExpression(filters) {
    const filterExpression = {};
    
    if (filters.brand) {
      filterExpression.brand = { $eq: filters.brand };
    }
    
    if (filters.style_type) {
      filterExpression.style_type = { $eq: filters.style_type };
    }
    
    if (filters.gender) {
      filterExpression.gender = { $eq: filters.gender };
    }
    
    if (filters.fit_type) {
      filterExpression.fit_type = { $eq: filters.fit_type };
    }
    
    if (filters.price_min !== undefined && filters.price_max !== undefined) {
      filterExpression.price = { $gte: filters.price_min, $lte: filters.price_max };
    } else if (filters.price_min !== undefined) {
      filterExpression.price = { $gte: filters.price_min };
    } else if (filters.price_max !== undefined) {
      filterExpression.price = { $lte: filters.price_max };
    }
    
    return Object.keys(filterExpression).length > 0 ? filterExpression : undefined;
  }

  /**
   * Delete product embedding from Pinecone
   * @param {string} productId - Product ID to delete
   * @returns {Promise<void>}
   */
  async deleteProductEmbedding(productId) {
    await this.init();
    
    try {
      await this.index.deleteOne(productId);
    } catch (error) {
      console.error(`Error deleting product embedding for ${productId}:`, error);
      throw error;
    }
  }
}

module.exports = new PineconeDB();
