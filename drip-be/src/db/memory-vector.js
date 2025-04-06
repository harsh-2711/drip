const { ChromaClient } = require('chromadb');
const { HuggingFaceTransformersEmbeddings } = require('@langchain/community/embeddings/hf_transformers');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Simple in-memory storage as a fallback
const inMemoryStore = new Map();

/**
 * In-memory vector database utility using chromadb directly
 */
class MemoryVectorDB {
  constructor() {
    this.client = null;
    this.collection = null;
    this.embeddingFunction = null;
    this.isInitialized = false;
    this.collectionName = 'drip-products';
  }

  /**
   * Initialize the in-memory vector database
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize chromadb client (in-memory by default)
      this.client = new ChromaClient();
      
      // Initialize HuggingFace embeddings
      this.huggingFaceEmbeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2", // A lightweight model that works well for semantic search
      });
      
      // Create embedding function for Chroma
      this.embeddingFunction = {
        generate: async (texts) => {
          const results = [];
          for (const text of texts) {
            const embedding = await this.huggingFaceEmbeddings.embedQuery(text);
            results.push(embedding);
          }
          return results;
        }
      };
      
      // Create or get collection
      try {
        this.collection = await this.client.getCollection({
          name: this.collectionName,
          embeddingFunction: this.embeddingFunction
        });
        console.log(`Collection '${this.collectionName}' already exists.`);
      } catch (error) {
        // Collection doesn't exist, create it
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          embeddingFunction: this.embeddingFunction
        });
        console.log(`Collection '${this.collectionName}' created.`);
      }
      
      console.log('In-memory vector database has been initialized successfully.');
      this.isInitialized = true;
    } catch (error) {
      console.error('Unable to initialize in-memory vector database:', error);
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
    
    // Initialize HuggingFace embeddings if not already initialized
    if (!this.huggingFaceEmbeddings) {
      this.huggingFaceEmbeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2",
      });
    }
    
    // Generate embedding using HuggingFace embeddings
    const embedding = await this.huggingFaceEmbeddings.embedQuery(textRepresentation);
    return embedding;
  }

  /**
   * Store product embedding in the vector database
   * @param {Object} product - Product to store
   * @returns {Promise<string>} Vector database ID
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
        currency: product.currency || '',
        category: product.category || '',
        tags: product.tags ? product.tags.join(', ') : '',
        occasion: product.occasion ? product.occasion.join(', ') : '',
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
      
      // Store in vector database
      const id = product.product_id;
      
      // Store in our simple in-memory store as a fallback
      inMemoryStore.set(id, {
        id,
        text: textRepresentation,
        metadata,
        embedding: await this.generateEmbedding(product)
      });
      
      console.log(`Document with ID ${id} stored in memory.`);
      
      // Try to store in Chroma as well
      try {
        console.log(`Trying to store document with ID ${id} in Chroma...`);
        
        // Check if the document already exists
        const existingDoc = await this.collection.get({ ids: [id] });
        
        if (existingDoc && existingDoc.ids && existingDoc.ids.length > 0) {
          // If it exists, update it
          console.log(`Updating document with ID ${id} in Chroma...`);
          await this.collection.update({
            ids: [id],
            documents: [textRepresentation],
            metadatas: [metadata]
          });
        } else {
          // If it doesn't exist, add it
          console.log(`Adding document with ID ${id} to Chroma...`);
          await this.collection.add({
            ids: [id],
            documents: [textRepresentation],
            metadatas: [metadata]
          });
        }
        
        console.log(`Document with ID ${id} stored in Chroma.`);
      } catch (chromaError) {
        console.warn(`Warning: Could not store document in Chroma: ${chromaError.message}`);
        console.warn('Using in-memory fallback instead.');
      }
      
      return id;
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
      // Try to query Chroma first
      try {
        console.log(`Querying Chroma for text: "${queryText}"...`);
        
        // Create filter expression
        // const whereClause = this.createFilterExpression(filters);

        // Query vector database
        const results = await this.collection.query({
          queryTexts: [queryText],
          nResults: topK * 2, // to be filtered more by postgres
          // where: whereClause
        });
        
        console.log('Chroma query results:', results);
        
        // Format results to match the expected structure
        const matches = [];
        if (results && results.ids && results.ids.length > 0 && results.ids[0].length > 0) {
          for (let i = 0; i < results.ids[0].length; i++) {
            matches.push({
              id: results.ids[0][i],
              score: results.distances ? results.distances[0][i] : 0,
              metadata: results.metadatas ? results.metadatas[0][i] : {}
            });
          }
        }
        
        if (matches.length > 0) {
          console.log(`Found ${matches.length} matches in Chroma.`);
          return matches;
        }
      } catch (chromaError) {
        console.warn(`Warning: Could not query Chroma: ${chromaError.message}`);
      }
      
      // Fall back to in-memory search if Chroma query returns no results or fails
      console.log('Falling back to in-memory search...');
      
      if (inMemoryStore.size === 0) {
        console.log('In-memory store is empty.');
        return [];
      }
      
      // Generate embedding for the query text
      const queryEmbedding = await this.huggingFaceEmbeddings.embedQuery(queryText);
      
      // Simple vector similarity search with filtering
      let results = Array.from(inMemoryStore.values())
        .map(item => {
          // Calculate cosine similarity
          const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
          return {
            id: item.id,
            score: similarity,
            metadata: item.metadata
          };
        });
      
      // Apply filters to in-memory results
      if (filters && Object.keys(filters).length > 0) {
        results = results.filter(item => {
          // Check each filter condition
          for (const [key, value] of Object.entries(filters)) {
            // Handle array filters
            if (Array.isArray(value) && value.length > 0) {
              // For array filters, check if the metadata value is in the filter array
              if (key === 'colors' && item.metadata.primary_color) {
                if (!value.includes(item.metadata.primary_color)) {
                  return false;
                }
              } else if (key === 'fits' && item.metadata.fit_type) {
                if (!value.includes(item.metadata.fit_type)) {
                  return false;
                }
              } else if (key === 'styles' && item.metadata.style_type) {
                if (!value.includes(item.metadata.style_type)) {
                  return false;
                }
              } else if (key === 'occasions' && item.metadata.occasion) {
                // For occasions, we need to check if any of the occasions match
                const itemOccasions = Array.isArray(item.metadata.occasion) 
                  ? item.metadata.occasion 
                  : [item.metadata.occasion];
                
                const hasMatchingOccasion = itemOccasions.some(occasion => 
                  value.includes(occasion)
                );
                
                if (!hasMatchingOccasion) {
                  return false;
                }
              } else {
                // For other array filters, check if the metadata value is in the filter array
                if (!value.includes(item.metadata[key])) {
                  return false;
                }
              }
            } else if (item.metadata[key] !== value) {
              // For non-array filters, check for exact match
              return false;
            }
          }
          return true;
        });
      }
      
      // Sort and limit results
      results = results
        .sort((a, b) => b.score - a.score) // Sort by similarity (descending)
        .slice(0, topK); // Take top K results
      
      console.log(`Found ${results.length} matches in memory.`);
      return results;
    } catch (error) {
      console.error('Error querying similar products:', error);
      throw error;
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param {Array<number>} a - First vector
   * @param {Array<number>} b - Second vector
   * @returns {number} Cosine similarity
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
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
      const document = await this.collection.get({ ids: [productId] });
      
      if (!document || !document.documents || document.documents.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      // Create filter expression
      const whereClause = this.createFilterExpression(filters);
      
      // Query vector database using the document's text
      const results = await this.collection.query({
        queryTexts: [document.documents[0]],
        nResults: topK + 1, // +1 because the query will include the original document
        where: whereClause
      });
      
      // Format results to match the expected structure
      const matches = [];
      if (results && results.ids && results.ids.length > 0 && results.ids[0].length > 0) {
        for (let i = 0; i < results.ids[0].length; i++) {
          // Skip the original document
          if (results.ids[0][i] === productId) continue;
          
          matches.push({
            id: results.ids[0][i],
            score: results.distances ? results.distances[0][i] : 0,
            metadata: results.metadatas ? results.metadatas[0][i] : {}
          });
        }
      }
      
      return matches;
    } catch (error) {
      console.error(`Error querying similar products for ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Create filter expression for vector database query
   * @param {Object} filters - Metadata filters
   * @returns {Object} Filter expression
   */
  createFilterExpression(filters) {
    // For Chroma, we need to use a different format
    // Chroma expects filters in the format: { "field": "value" }
    const whereClause = {};
    
    // Handle non-array fields first
    if (filters.brand && filters.brand !== null) {
      whereClause.brand = filters.brand;
    }
    
    if (filters.style_type && filters.style_type !== null) {
      whereClause.style_type = filters.style_type;
    }
    
    if (filters.gender && filters.gender !== null) {
      whereClause.gender = filters.gender.toLowerCase();
    }
    
    if (filters.fit_type && filters.fit_type !== null) {
      whereClause.fit_type = filters.fit_type;
    }
    
    if (filters.category && filters.category !== null) {
      whereClause.category = filters.category.toLowerCase();
    }
    
    if (filters.primary_color && filters.primary_color !== null) {
      whereClause.primary_color = filters.primary_color.toLowerCase();
    }
    
    if (filters.occasion && filters.occasion !== null) {
      whereClause.occasion = filters.occasion;
    }
    
    if (filters.currency && filters.currency !== null) {
      whereClause.currency = filters.currency.toUpperCase();
    }
    
    // Handle array filters - select only the first value since vector DB doesn't support $in operator
    if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
      // Take only the first color from the array
      whereClause.primary_color = filters.colors[0].toLowerCase();
    }
    
    if (filters.fits && Array.isArray(filters.fits) && filters.fits.length > 0) {
      // Take only the first fit from the array
      whereClause.fit_type = filters.fits[0];
    }
    
    if (filters.styles && Array.isArray(filters.styles) && filters.styles.length > 0) {
      // Take only the first style from the array
      whereClause.style_type = filters.styles[0];
    }
    
    if (filters.occasions && Array.isArray(filters.occasions) && filters.occasions.length > 0) {
      // Take only the first occasion from the array
      whereClause.occasion = filters.occasions[0];
    }
    
    return Object.keys(whereClause).length > 0 ? whereClause : null;
  }

  /**
   * Delete product embedding from vector database
   * @param {string} productId - Product ID to delete
   * @returns {Promise<void>}
   */
  async deleteProductEmbedding(productId) {
    await this.init();
    
    try {
      await this.collection.delete({ ids: [productId] });
    } catch (error) {
      console.error(`Error deleting product embedding for ${productId}:`, error);
      throw error;
    }
  }
}

module.exports = new MemoryVectorDB();
