const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { HuggingFaceTransformersEmbeddings } = require('@langchain/community/embeddings/hf_transformers');
const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Chroma database utility for vector embeddings
 */
class ChromaDB {
  constructor() {
    this.client = null;
    this.collection = null;
    this.embeddings = null;
    this.isInitialized = false;
    this.collectionName = 'drip-products';
    this.dbDirectory = path.join(__dirname, '../../data/chroma-db');
  }

  /**
   * Initialize the Chroma database connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create the database directory if it doesn't exist
      if (!fs.existsSync(this.dbDirectory)) {
        fs.mkdirSync(this.dbDirectory, { recursive: true });
      }

      // Initialize HuggingFace embeddings
      this.embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "sentence-transformers/all-MiniLM-L6-v2", // A lightweight model that works well for semantic search
      });

      // Initialize Chroma client
      this.client = new Chroma({
        collectionName: this.collectionName,
        url: config.chroma?.url,
        embeddingFunction: this.embeddings,
        collectionMetadata: {
          "hnsw:space": "cosine"
        },
        path: this.dbDirectory
      });

      console.log('Chroma connection has been established successfully.');
      this.isInitialized = true;
    } catch (error) {
      console.error('Unable to connect to Chroma:', error);
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
   * Store product embedding in Chroma
   * @param {Object} product - Product to store
   * @returns {Promise<string>} Chroma ID
   */
  async storeProductEmbedding(product) {
    await this.init();
    
    try {
      // Create metadata
      const metadata = {
        product_id: product.product_id,
        title: product.title || '',
        brand: product.brand || '',
        style_type: product.style_type || '',
        aesthetic: product.aesthetic || '',
        primary_color: product.primary_color || '',
        gender: product.gender || '',
        fit_type: product.fit_type || '',
        price: product.price ? product.price.toString() : '',
        currency: product.currency || ''
      };
      
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
      
      // Store in Chroma
      const chromaId = product.product_id;
      await this.client.addDocuments({
        ids: [chromaId],
        documents: [textRepresentation],
        metadatas: [metadata]
      });
      
      return chromaId;
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
      // Create filter expression
      const filterExpression = this.createFilterExpression(filters);
      
      // Query Chroma
      const results = await this.client.similaritySearch(queryText, topK, filterExpression);
      
      // Format results to match the expected structure
      const matches = results.map(result => ({
        id: result.metadata.product_id,
        score: result.score,
        metadata: result.metadata
      }));
      
      return matches;
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
      // Get the document by ID
      const document = await this.client.get([productId]);
      
      if (!document || document.ids.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      // Create filter expression
      const filterExpression = this.createFilterExpression(filters);
      
      // Query Chroma using the document's embedding
      const results = await this.client.similaritySearch(document.documents[0], topK, filterExpression);
      
      // Format results to match the expected structure
      const matches = results.map(result => ({
        id: result.metadata.product_id,
        score: result.score,
        metadata: result.metadata
      }));
      
      return matches;
    } catch (error) {
      console.error(`Error querying similar products for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Create filter expression for Chroma query
   * @param {Object} filters - Metadata filters
   * @returns {Object} Filter expression
   */
  createFilterExpression(filters) {
    const filterExpression = {};
    
    if (filters.brand) {
      filterExpression.brand = filters.brand;
    }
    
    if (filters.style_type) {
      filterExpression.style_type = filters.style_type;
    }
    
    if (filters.gender) {
      filterExpression.gender = filters.gender;
    }
    
    if (filters.fit_type) {
      filterExpression.fit_type = filters.fit_type;
    }
    
    // Note: Chroma's filtering is more limited than Pinecone's
    // For price ranges, we'd need to implement more complex filtering logic
    
    return Object.keys(filterExpression).length > 0 ? filterExpression : null;
  }

  /**
   * Delete product embedding from Chroma
   * @param {string} productId - Product ID to delete
   * @returns {Promise<void>}
   */
  async deleteProductEmbedding(productId) {
    await this.init();
    
    try {
      await this.client.delete([productId]);
    } catch (error) {
      console.error(`Error deleting product embedding for ${productId}:`, error);
      throw error;
    }
  }
}

module.exports = new ChromaDB();
