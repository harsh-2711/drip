const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');
const fs = require('fs');
const path = require('path');

/**
 * PostgreSQL database utility for structured product data
 */
class PostgresDB {
  constructor() {
    this.sequelize = null;
    this.models = {};
    this.isInitialized = false;
  }

  /**
   * Initialize the PostgreSQL database connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create a connection to PostgreSQL
      this.sequelize = new Sequelize(config.postgres.uri, {
        logging: config.postgres.logging ? console.log : false,
        dialectOptions: {
          ssl: config.postgres.ssl
        }
      });

      // Test the connection
      await this.sequelize.authenticate();
      console.log('PostgreSQL connection has been established successfully.');

      // Define models
      this.defineModels();

      // Sync models with database
      if (config.postgres.sync) {
        await this.sequelize.sync({ alter: config.postgres.alter });
        console.log('Database models synchronized successfully.');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Unable to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  /**
   * Define database models
   */
  defineModels() {
    // Brand model
    this.models.Brand = this.sequelize.define('Brand', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING
      },
      style_tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      homepage_type: {
        type: DataTypes.STRING
      },
      rating_estimate: {
        type: DataTypes.FLOAT
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'brands',
      timestamps: true,
      underscored: true
    });

    // Product model
    this.models.Product = this.sequelize.define('Product', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      category: {
        type: DataTypes.TEXT
      },
      price: {
        type: DataTypes.FLOAT
      },
      currency: {
        type: DataTypes.STRING
      },
      available_sizes: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      product_url: {
        type: DataTypes.STRING
      },
      image_urls: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      style_type: {
        type: DataTypes.STRING
      },
      aesthetic: {
        type: DataTypes.STRING
      },
      primary_color: {
        type: DataTypes.STRING
      },
      fabric: {
        type: DataTypes.STRING
      },
      cut: {
        type: DataTypes.STRING
      },
      gender: {
        type: DataTypes.STRING
      },
      fit_type: {
        type: DataTypes.STRING
      },
      occasion: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      pinecone_id: {
        type: DataTypes.STRING
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'products',
      timestamps: true,
      underscored: true
    });

    // FitInsight model
    this.models.FitInsight = this.sequelize.define('FitInsight', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fit_consensus: {
        type: DataTypes.STRING
      },
      size_recommendation: {
        type: DataTypes.STRING
      },
      common_complaints: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      body_type_insights: {
        type: DataTypes.JSONB
      },
      confidence_score: {
        type: DataTypes.FLOAT
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'fit_insights',
      timestamps: true,
      underscored: true
    });

    // Define relationships
    this.models.Brand.hasMany(this.models.Product);
    this.models.Product.belongsTo(this.models.Brand);
    this.models.Product.hasOne(this.models.FitInsight);
    this.models.FitInsight.belongsTo(this.models.Product);
  }

  /**
   * Store brands in the database
   * @param {Array} brands - List of brands to store
   * @returns {Promise<Array>} Stored brands
   */
  async storeBrands(brands) {
    await this.init();

    const storedBrands = [];

    for (const brand of brands) {
      try {
        // Normalize brand data
        const normalizedBrand = {
          name: brand.brand_name || brand.name,
          url: brand.brand_url || brand.url,
          country: brand.country,
          style_tags: brand.style_tags || [],
          homepage_type: brand.homepage_type,
          rating_estimate: brand.rating_estimate
        };

        // Create or update brand
        const [storedBrand, created] = await this.models.Brand.findOrCreate({
          where: { name: normalizedBrand.name },
          defaults: normalizedBrand
        });

        if (!created) {
          await storedBrand.update(normalizedBrand);
        }

        storedBrands.push(storedBrand);
      } catch (error) {
        console.error(`Error storing brand ${brand.brand_name || brand.name}:`, error);
      }
    }

    return storedBrands;
  }

  /**
   * Store products in the database
   * @param {Array} products - List of products to store
   * @returns {Promise<Array>} Stored products
   */
  async storeProducts(products) {
    await this.init();

    const storedProducts = [];

    for (const product of products) {
      try {
        // Find or create brand
        const [brand] = await this.models.Brand.findOrCreate({
          where: { name: product.brand },
          defaults: {
            name: product.brand,
            url: product.brand_url || ''
          }
        });

        // Normalize product data
        const normalizedProduct = {
          product_id: product.product_id,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          available_sizes: product.available_sizes || [],
          tags: product.tags || [],
          product_url: product.product_url,
          image_urls: product.image_urls || [],
          style_type: product.style_type,
          aesthetic: product.aesthetic,
          primary_color: product.primary_color,
          fabric: product.fabric,
          cut: product.cut,
          gender: product.gender,
          fit_type: product.fit_type,
          occasion: product.occasion || [],
          category: product.category || 'tops',
          BrandId: brand.id
        };

        // Create or update product
        const [storedProduct, created] = await this.models.Product.findOrCreate({
          where: { product_id: normalizedProduct.product_id },
          defaults: normalizedProduct
        });

        if (!created) {
          await storedProduct.update(normalizedProduct);
        }

        // Store fit insights if available
        if (product.fit_insights) {
          const fitInsightData = {
            fit_consensus: product.fit_insights.fit_consensus,
            size_recommendation: product.fit_insights.size_recommendation,
            common_complaints: product.fit_insights.common_complaints || [],
            body_type_insights: product.fit_insights.body_type_insights || {},
            confidence_score: product.fit_insights.confidence_score,
            ProductId: storedProduct.id
          };

          const [fitInsight, fitCreated] = await this.models.FitInsight.findOrCreate({
            where: { ProductId: storedProduct.id },
            defaults: fitInsightData
          });

          if (!fitCreated) {
            await fitInsight.update(fitInsightData);
          }
        }

        storedProducts.push(storedProduct);
      } catch (error) {
        console.error(`Error storing product ${product.product_id}:`, error);
      }
    }

    return storedProducts;
  }

   /**
    * Update product with Pinecone ID
    * @param {string} productId - Product ID
    * @param {string} pineconeId - Pinecone ID
    * @returns {Promise<Object>} Updated product
    */
   async updateProductPineconeId(productId, pineconeId) {
    await this.init();

    try {
      const product = await this.models.Product.findOne({
        where: { product_id: productId }
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      await product.update({ pinecone_id: pineconeId });
      return product;
    } catch (error) {
      console.error(`Error updating product ${productId} with Pinecone ID:`, error);
      throw error;
    }
  }

  /**
   * Query products with filters
   * @param {Object} filters - Query filters
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Matching products
   */
  async queryProducts(filters = {}, limit = 10, offset = 0) {
    await this.init();

    try {
      const query = {
        where: {},
        include: [
          { model: this.models.Brand },
          { model: this.models.FitInsight }
        ],
        limit,
        offset
      };

      // Apply filters with non-null checks
      if (filters.product_id && filters.product_id !== null) {
        query.where.product_id = filters.product_id;
      }

      if (filters.brand && filters.brand !== null) {
        query.include[0].where = { name: filters.brand };
      }

      if (filters.style_type && filters.style_type !== null) {
        query.where.style_type = filters.style_type;
      }

      if (filters.gender && filters.gender !== null) {
        query.where.gender = filters.gender.toLowerCase();
      }

      if (filters.fit_type && filters.fit_type !== null) {
        query.where.fit_type = filters.fit_type;
      }
      
      if (filters.category && filters.category !== null) {
        query.where.category = filters.category.toLowerCase();
      }
      
      if (filters.primary_color && filters.primary_color !== null) {
        query.where.primary_color = filters.primary_color.toLowerCase();
      }
      
      if (filters.currency && filters.currency !== null) {
        query.where.currency = filters.currency.toUpperCase();
      }
      
      // Handle array filters for colors, fits, styles, occasions
      if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
        query.where.primary_color = {
          [Sequelize.Op.in]: filters.colors.map(color => color.toLowerCase())
        };
      }
      
      if (filters.fits && Array.isArray(filters.fits) && filters.fits.length > 0) {
        query.where.fit_type = {
          [Sequelize.Op.in]: filters.fits
        };
      }
      
      if (filters.styles && Array.isArray(filters.styles) && filters.styles.length > 0) {
        query.where.style_type = {
          [Sequelize.Op.in]: filters.styles
        };
      }
      
      if (filters.occasions && Array.isArray(filters.occasions) && filters.occasions.length > 0) {
        query.where.occasion = {
          [Sequelize.Op.overlap]: filters.occasions
        };
      }

      if (filters.price_min !== undefined && filters.price_min !== null && 
          filters.price_max !== undefined && filters.price_max !== null) {
        query.where.price = {
          [Sequelize.Op.between]: [filters.price_min, filters.price_max]
        };
      } else if (filters.price_min !== undefined && filters.price_min !== null) {
        query.where.price = {
          [Sequelize.Op.gte]: filters.price_min
        };
      } else if (filters.price_max !== undefined && filters.price_max !== null) {
        query.where.price = {
          [Sequelize.Op.lte]: filters.price_max
        };
      }

      const products = await this.models.Product.findAll(query);
      return products;
    } catch (error) {
      console.error('Error querying products:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('PostgreSQL connection closed.');
    }
  }
}

module.exports = new PostgresDB();
