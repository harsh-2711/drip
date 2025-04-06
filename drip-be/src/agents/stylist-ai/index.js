const { HuggingFaceTransformersEmbeddings } = require('@langchain/community/embeddings/hf_transformers');
const memoryVectorDB = require('../../db/memory-vector');
const pineconeDB = require('../../db/pinecone');
const chromaDB = require('../../db/chroma');
const postgresDB = require('../../db/postgres');
const config = require('../../config');
const fs = require('fs');
const path = require('path');
const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage } = require('@langchain/core/messages');
const OpenAI = require('openai');

/**
 * Agent E: Stylist AI
 * Real-Time Recommendation Engine that turns user inputs into a fashion persona
 * and generates product recommendations
 */
class StylistAIAgent {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../data/recommendations');
    this.embeddings = null;
    this.llm = null;
    this.imageLLM = null;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Initialize the agent
   * @returns {Promise<void>}
   */
  async init() {
    // Initialize HuggingFace embeddings
    this.embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2", // A lightweight model that works well for semantic search
    });

    // Initialize LLM
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      temperature: 0.7,
      modelName: config.openai.model,
      configuration: {
        baseURL: config.litellm.apiBase,
      }
    });

    this.imageLLM = new OpenAI({
      apiKey: config.actual_openai.apiKey,
    });
  }

  /**
   * Generate a user persona based on user image
   * @param {Object} userInput - User input data
   * @param {string} userInput.imageBase64 - Base64 encoded image of the user
   * @param {Object} userInput.preferences - User preferences (optional)
   * @returns {Promise<Object>} User persona
   */
  async generateUserPersona(userInput) {
    await this.init();
    
    try {
      console.log('Generating user persona from image...');
      
      // Extract user attributes from image
      const userAttributes = await this.extractUserAttributesFromImage(userInput.imageBase64);
      
      // Get best fits based on body shape
      const bestFits = await this.getBestFitsForBodyShape(userAttributes.body_shape, userAttributes.gender);
      
      // Get best colors based on skin tone and undertone
      const bestColors = await this.getBestColorsForSkinTone(userAttributes.skin_tone, userAttributes.undertone);
      
      // Determine ideal sizes based on body shape
      const idealSizes = await this.getIdealSizesForBodyShape(userAttributes.tops_size, userAttributes.bottoms_size);
      
      // Create user persona
      const userPersona = {
        user_id: userInput.userId || 'anonymous',
        gender: userAttributes.gender,
        body_shape: userAttributes.body_shape,
        skin_tone: userAttributes.skin_tone,
        undertone: userAttributes.undertone,
        best_fits: bestFits,
        best_colors: bestColors,
        ideal_size: idealSizes,
        preferred_colors: bestColors,
        preferred_fits: bestFits,
        disliked_tags: [],
        loved_tags: [],
        occasions: [],
        style_keywords: [],
        recent_feedback: {
          liked: [],
          disliked: []
        }
      };
      
      // Merge with existing preferences if provided
      if (userInput.preferences) {
        userPersona.preferred_colors = [...new Set([...userPersona.preferred_colors, ...(userInput.preferences.preferred_colors || [])])];
        userPersona.preferred_fits = [...new Set([...userPersona.preferred_fits, ...(userInput.preferences.preferred_fits || [])])];
        userPersona.disliked_tags = [...new Set([...userPersona.disliked_tags, ...(userInput.preferences.disliked_tags || [])])];
        userPersona.loved_tags = [...new Set([...userPersona.loved_tags, ...(userInput.preferences.loved_tags || [])])];
        userPersona.occasions = [...new Set([...userPersona.occasions, ...(userInput.preferences.occasions || [])])];
        userPersona.style_keywords = [...new Set([...userPersona.style_keywords, ...(userInput.preferences.style_keywords || [])])];
        
        if (userInput.preferences.recent_feedback) {
          userPersona.recent_feedback = userInput.preferences.recent_feedback;
        }
      }

      if (userInput.attributes) {
        // Create a map to count occurrences of each attribute
        const attributeCount = new Map();
        
        // Iterate through each string in the attributes array
        userInput.attributes.forEach(attributeString => {
          // Split the string by ", " to get individual attributes
          const attributes = attributeString.split(', ');
          
          // Count occurrences of each attribute
          attributes.forEach(attr => {
            const trimmedAttr = attr.trim();
            if (trimmedAttr) {
              attributeCount.set(trimmedAttr, (attributeCount.get(trimmedAttr) || 0) + 1);
            }
          });
        });
        
        // Convert map to array and sort by count in descending order
        const sortedAttributes = Array.from(attributeCount.entries())
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);
        
        // Take the top 5 attributes (or fewer if there aren't 5)
        const topAttributes = sortedAttributes.slice(0, 5);
        
        // Add top attributes to userPersona.loved_tags array
        userPersona.loved_tags = [...new Set([...userPersona.loved_tags, ...topAttributes])];
      }
      
      return userPersona;
    } catch (error) {
      console.error('Error generating user persona:', error);
      throw error;
    }
  }

  /**
   * Extract user attributes from image
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<Object>} User attributes
   */
  async extractUserAttributesFromImage(imageBase64) {
    try {

      const response = await this.imageLLM.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "user",
                content: [
                    { type: "input_text", text: `
                      You are an AI fashion consultant analyzing a user's image.
                      Based on the image, determine the following attributes:
                      
                      1. Skin tone (choose one): light/fair, medium, olive, deep/dark
                      2. Undertone (choose one): warm, cool, neutral
                      3. Gender (choose one): women, men
                      4. Body shape:
                        - For men (choose one): Ectomorph, Mesomorph, Endomorph, Rectangle, Athletic, Oval
                        - For women (choose one): Pear/Triangle, Inverted Triangle/Apple, Rectangle/Banana, Hourglass, Spoon, Diamond, Oval/Apple
                      5. Based on above data points, and the image provided, give a rough estimate for sizes that will be correct fit for tops as well as bottoms. Use standard size metrics like S,L,XL, etc.

                      Respond in JSON format without any json code block indicator:
                      {{
                        "skin_tone": "selected skin tone",
                        "undertone": "selected undertone",
                        "gender": "selected gender",
                        "body_shape": "selected body shape"
                        "tops_size": "guessed size for tops",
                        "bottoms_size": "guessed size for bottoms",
                      }}
                  ` },
                    {
                        type: "input_image",
                        image_url: `data:image/jpeg;base64,${imageBase64}`,
                    },
                ],
            },
        ],
    });
      
      // Parse the JSON response
      const jsonMatch = response.output_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        skin_tone: "medium",
        undertone: "neutral",
        gender: "women",
        body_shape: "rectangle"
      };
    } catch (error) {
      console.error('Error extracting user attributes from image:', error);
      
      // Return default values on error
      return {
        skin_tone: "medium",
        undertone: "neutral",
        gender: "women",
        body_shape: "rectangle"
      };
    }
  }

  /**
   * Get best fits for body shape
   * @param {string} bodyShape - User's body shape
   * @param {string} gender - User's gender
   * @returns {Promise<Array<string>>} Best fits
   */
  async getBestFitsForBodyShape(bodyShape, gender) {
    try {
      const maleBodyShapeFits = {
        "Ectomorph": ["Slim Fit", "Tailored Fit", "Athletic Fit"],
        "Mesomorph": ["Athletic Fit", "Tailored Fit", "Compression Fit"],
        "Endomorph": ["Relaxed Fit", "Regular Fit", "Oversized Fit"],
        "Rectangle": ["Tailored Fit", "Slim Fit", "Regular Fit"],
        "Athletic": ["Compression Fit", "Athletic Fit", "Tailored Fit"],
        "Oval": ["Regular Fit", "Relaxed Fit", "Slim Fit"]
      };
      
      const femaleBodyShapeFits = {
        "Pear/Triangle": ["Flowy Fit", "A-Line", "Regular Fit"],
        "Inverted Triangle/Apple": ["Draped Fit", "Tailored Fit", "Relaxed Fit"],
        "Rectangle/Banana": ["Form-Fitting", "Tailored Fit", "Slim Fit"],
        "Hourglass": ["Bodycon Fit", "Form-Fitting", "Tailored Fit"],
        "Spoon": ["Curvy Fit", "Plus Size Fit", "Relaxed Fit"],
        "Diamond": ["Petite Fit", "Tailored Fit", "Regular Fit"],
        "Oval/Apple": ["Plus Size Fit", "Relaxed Fit", "Regular Fit"]
      };
      
      if (gender === "men" && maleBodyShapeFits[bodyShape]) {
        return maleBodyShapeFits[bodyShape];
      } else if (gender === "women" && femaleBodyShapeFits[bodyShape]) {
        return femaleBodyShapeFits[bodyShape];
      }
      
      // Default fits if body shape not found
      return gender === "men" 
        ? ["Regular Fit", "Tailored Fit", "Relaxed Fit"]
        : ["Regular Fit", "Tailored Fit", "Flowy Fit"];
    } catch (error) {
      console.error('Error getting best fits for body shape:', error);
      return ["Regular Fit", "Tailored Fit"];
    }
  }

  /**
   * Get best colors for skin tone and undertone
   * @param {string} skinTone - User's skin tone
   * @param {string} undertone - User's undertone
   * @returns {Promise<Array<string>>} Best colors
   */
  async getBestColorsForSkinTone(skinTone, undertone) {
    try {
      const colorRecommendations = {
        "light/fair": {
          "Warm": ["peach", "coral", "gold", "warm beige", "orange-red"],
          "Cool": ["icy blue", "lavender", "pink", "emerald", "sapphire"],
          "Neutral": ["cream", "taupe", "muted green", "soft pastels"]
        },
        "medium": {
          "Warm": ["mustard yellow", "olive green", "warm brown", "burnt orange"],
          "Cool": ["navy blue", "purple", "magenta", "cool grey"],
          "Neutral": ["teal", "dusty rose", "soft brown"]
        },
        "olive": {
          "Warm": ["gold", "orange", "terracotta"],
          "Cool": ["turquoise", "emerald green", "royal blue"],
          "Neutral": ["beige", "cream", "muted green"]
        },
        "deep/dark": {
          "Warm": ["red-orange", "golden yellow", "copper"],
          "Cool": ["cobalt blue", "fuchsia", "silver"],
          "Neutral": ["ivory", "charcoal grey", "olive green"]
        }
      };
      
      if (colorRecommendations[skinTone] && colorRecommendations[skinTone][undertone]) {
        return colorRecommendations[skinTone][undertone];
      }
      
      // Default colors if skin tone or undertone not found
      return ["navy blue", "white", "black", "grey", "beige"];
    } catch (error) {
      console.error('Error getting best colors for skin tone:', error);
      return ["navy blue", "white", "black", "grey", "beige"];
    }
  }

  /**
   * Get ideal sizes for body shape
   * @param {string} bodyShape - User's body shape
   * @param {string} gender - User's gender
   * @returns {Promise<Object>} Ideal sizes
   */
  async getIdealSizesForBodyShape(tops_size, bottoms_size) {
    try {
      return {
        tops: tops_size,
        bottoms: bottoms_size,
      };
    } catch (error) {
      console.error('Error getting ideal sizes for body shape:', error);
      return {
        tops: "M",
        bottoms: "M"
      };
    }
  }

  /**
   * Extract style information from user prompt
   * @param {string} prompt - User prompt
   * @returns {Promise<Object>} Extracted style information
   */
  async extractStyleInfoFromPrompt(prompt) {
    try {
      const promptTemplate = `
        Extract fashion style information from the following user request. 
        Identify colors, fits, things to avoid, things to prefer, occasions, and style keywords.
        
        User request: "${prompt}"
        
        Respond in JSON format without any json code block indicator:
        {{
          "colors": ["color1", "color2"],
          "fits": ["fit1", "fit2"],
          "avoid": ["avoid1", "avoid2"],
          "prefer": ["prefer1", "prefer2"],
          "occasions": ["occasion1", "occasion2"],
          "style_keywords": ["keyword1", "keyword2"]
        }}
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        colors: [],
        fits: [],
        avoid: [],
        prefer: [],
        occasions: [],
        style_keywords: []
      };
    } catch (error) {
      console.error('Error extracting style info from prompt:', error);
      
      // Return empty values on error
      return {
        colors: [],
        fits: [],
        avoid: [],
        prefer: [],
        occasions: [],
        style_keywords: []
      };
    }
  }

  /**
   * Generate recommendations based on user persona
   * @param {Object} userPersona - User persona
   * @param {Object} filters - Additional filters
   * @param {string} refImage - Reference image (optional)
   * @param {number} limit - Maximum number of recommendations
   * @returns {Promise<Array>} Recommendations
   */
  async generateRecommendations(userPersona, filters = {}, refImage = null, limit = 10) {
    await this.init();
    
    try {
      console.log('Generating recommendations...');
      
      // Create a text representation of the user persona for vector search
      const personaText = this.createPersonaText(userPersona);
      
      // Select vector database based on configuration
      let vectorDb;
      if (config.vectorDb === 'pinecone') {
        vectorDb = pineconeDB;
      } else if (config.vectorDb === 'chroma') {
        vectorDb = chromaDB;
      } else {
        vectorDb = memoryVectorDB;
      }
      
      // Prepare filters for vector database query
      const vectorFilters = {};
      
      // Add all filter attributes to vector filters with proper case conversion
      if (filters.gender) {
        vectorFilters.gender = filters.gender.toLowerCase();
      } else if (userPersona.gender) {
        vectorFilters.gender = userPersona.gender.toLowerCase();
      }
      
      if (filters.category) {
        vectorFilters.category = filters.category.toLowerCase();
      }
      
      // Use array filters directly with ChromaDB's $in operator
      if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
        vectorFilters.colors = filters.colors.map(color => color.toLowerCase());
      } else if (filters.primary_color) {
        vectorFilters.primary_color = filters.primary_color.toLowerCase();
      }
      
      if (filters.fits && Array.isArray(filters.fits) && filters.fits.length > 0) {
        vectorFilters.fits = filters.fits;
      } else if (filters.fit_type) {
        vectorFilters.fit_type = filters.fit_type;
      }
      
      if (filters.styles && Array.isArray(filters.styles) && filters.styles.length > 0) {
        vectorFilters.styles = filters.styles;
      } else if (filters.style_type) {
        vectorFilters.style_type = filters.style_type;
      }
      
      if (filters.occasions && Array.isArray(filters.occasions) && filters.occasions.length > 0) {
        vectorFilters.occasions = filters.occasions;
      } else if (filters.occasion) {
        vectorFilters.occasion = filters.occasion;
      }
      
      // Convert currency to uppercase if provided
      if (filters.currency) {
        vectorFilters.currency = filters.currency.toUpperCase();
      }
      
      // Price filters are handled separately in PostgreSQL
      
      // Query vector database for similar products with filters
      // console.log('Querying vector database with filters:', vectorFilters);
      // const vectorResults = await vectorDb.querySimilarProductsByText(personaText, vectorFilters, limit);
      
      // Get full product details from PostgreSQL with additional filters
      const recommendations = [];
      
      // Process vector results and apply PostgreSQL filters
      // for (const result of vectorResults) {
      //   try {
      //     // Create a filter object for PostgreSQL query
      //     const productFilter = { product_id: result.id };
          
      //     // Add all filters to PostgreSQL query with proper case conversion
      //     if (filters.gender) {
      //       productFilter.gender = filters.gender.toLowerCase();
      //     } else {
      //       productFilter.gender = userPersona.gender.toLowerCase();
      //     }
          
      //     if (filters.category) {
      //       productFilter.category = filters.category.toLowerCase();
      //     }
          
      //     if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
      //       productFilter.colors = filters.colors.map(color => color.toLowerCase());
      //     } else if (filters.primary_color) {
      //       productFilter.primary_color = filters.primary_color.toLowerCase();
      //     }
          
      //     if (filters.fits && Array.isArray(filters.fits) && filters.fits.length > 0) {
      //       productFilter.fits = filters.fits;
      //     } else if (filters.fit_type) {
      //       productFilter.fit_type = filters.fit_type;
      //     }
          
      //     if (filters.styles && Array.isArray(filters.styles) && filters.styles.length > 0) {
      //       productFilter.styles = filters.styles;
      //     } else if (filters.style_type) {
      //       productFilter.style_type = filters.style_type;
      //     }
          
      //     if (filters.occasions && Array.isArray(filters.occasions) && filters.occasions.length > 0) {
      //       productFilter.occasions = filters.occasions;
      //     } else if (filters.occasion) {
      //       productFilter.occasion = filters.occasion;
      //     }
          
      //     // Convert currency to uppercase if provided
      //     if (filters.currency) {
      //       productFilter.currency = filters.currency.toUpperCase();
      //     }
          
      //     // Add price range filters if specified
      //     if (filters.price_min !== undefined) {
      //       productFilter.price_min = filters.price_min;
      //     }
          
      //     if (filters.price_max !== undefined) {
      //       productFilter.price_max = filters.price_max;
      //     }
          
      //     // Query PostgreSQL with combined filters
      //     const products = await postgresDB.queryProducts(productFilter, 1, 0);
          
      //     if (products.length > 0) {
      //       const product = products[0];
          
      //       // Add similarity score
      //       product.dataValues.similarity_score = result.score;
          
      //       // Add recommendation reason
      //       product.dataValues.recommendation_reason = await this.generateRecommendationReason(product, userPersona, refImage);
          
      //       recommendations.push(product);
      //     }
      //   } catch (error) {
      //     console.error(`Error fetching product details for ${result.id}:`, error);
      //   }
      // }
      
      // Instead of using vector search, directly query PostgreSQL with user persona filters
      try {
        // Create a filter object for PostgreSQL query based on user persona
        const productFilter = {};
        
        // Add user persona attributes to filters
        if (userPersona.gender) {
          productFilter.gender = userPersona.gender.toLowerCase();
        }
        
        if (userPersona.preferred_colors && userPersona.preferred_colors.length > 0) {
          productFilter.colors = userPersona.preferred_colors.map(color => color.toLowerCase());
        }
        
        if (userPersona.preferred_fits && userPersona.preferred_fits.length > 0) {
          productFilter.fits = userPersona.preferred_fits;
        }
        
        if (userPersona.style_keywords && userPersona.style_keywords.length > 0) {
          productFilter.styles = userPersona.style_keywords;
        }
        
        // if (userPersona.occasions && userPersona.occasions.length > 0) {
        //   productFilter.occasions = userPersona.occasions;
        // }
        
        // Add additional filters from the filters parameter
        if (filters.gender) {
          productFilter.gender = filters.gender.toLowerCase();
        }
        
        if (filters.category) {
          productFilter.category = filters.category.toLowerCase();
        }
        
        if (filters.colors && Array.isArray(filters.colors) && filters.colors.length > 0) {
          productFilter.colors = filters.colors.map(color => color.toLowerCase());
        } else if (filters.primary_color) {
          productFilter.primary_color = filters.primary_color.toLowerCase();
        }
        
        if (filters.fits && Array.isArray(filters.fits) && filters.fits.length > 0) {
          productFilter.fits = filters.fits;
        } else if (filters.fit_type) {
          productFilter.fit_type = filters.fit_type;
        }
        
        if (filters.styles && Array.isArray(filters.styles) && filters.styles.length > 0) {
          productFilter.styles = filters.styles;
        } else if (filters.style_type) {
          productFilter.style_type = filters.style_type;
        }
        
        if (filters.occasions && Array.isArray(filters.occasions) && filters.occasions.length > 0) {
          productFilter.occasions = filters.occasions;
        } else if (filters.occasion) {
          productFilter.occasion = filters.occasion;
        }
        
        // Convert currency to uppercase if provided
        if (filters.currency) {
          productFilter.currency = filters.currency.toUpperCase();
        }
        
        // Add price range filters if specified
        if (filters.price_min !== undefined) {
          productFilter.price_min = filters.price_min;
        }
        
        if (filters.price_max !== undefined) {
          productFilter.price_max = filters.price_max;
        }
        
        // Query PostgreSQL with combined filters
        console.log('Querying PostgreSQL with filters:', productFilter);
        const products = await postgresDB.queryProducts(productFilter, limit, 0);
        
        // Process results
        for (const product of products) {
          // Add recommendation reason
          product.dataValues.recommendation_reason = await this.generateRecommendationReason(product, userPersona, refImage);
          recommendations.push(product);
        }
      } catch (error) {
        console.error('Error querying PostgreSQL:', error);
      }
      
      // Sort recommendations by similarity score if available
      // recommendations.sort((a, b) => b.dataValues.similarity_score - a.dataValues.similarity_score);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Create a text representation of the user persona for vector search
   * @param {Object} userPersona - User persona
   * @returns {string} Text representation
   */
  createPersonaText(userPersona) {
    return `
      Style preferences for a ${userPersona.gender} with ${userPersona.body_shape} body shape and ${userPersona.skin_tone} skin tone.
      Colors: ${userPersona.preferred_colors?.join(', ')}
      Fits: ${userPersona.preferred_fits?.join(', ')}
      Loves: ${userPersona.loved_tags?.join(', ')}
      Avoids: ${userPersona.disliked_tags?.join(', ')}
      Occasions: ${userPersona.occasions?.join(', ')}
      Style: ${userPersona.style_keywords?.join(', ')}
    `;
  }

  /**
   * Generate a recommendation reason for a product
   * @param {Object} product - Product
   * @param {Object} userPersona - User persona
   * @param {string} refImage - Reference image (optional)
   * @returns {Promise<string>} Recommendation reason
   */
  async generateRecommendationReason(product, userPersona, refImage = null) {
    try {
      // Prepare the content array for the LLM
      const content = [
        { 
          type: "input_text", 
          text: `
            You are a fashion expert. Your task is to generate a personalized recommendation reason for why this product would be good for this user.
            
            Product:
            - Title: ${product.title || 'Untitled Product'}
            - Brand: ${product.brand || 'Unknown Brand'}
            - Style: ${product.style_type || 'Unknown Style'}
            - Color: ${product.primary_color || 'Unknown Color'}
            - Fabric: ${product.fabric || 'Unknown Fabric'}
            - Fit: ${product.fit_type || 'Unknown Fit'}
            
            User Preferences:
            - Body Shape: ${userPersona.body_shape}
            - Skin Tone: ${userPersona.skin_tone}
            - Preferred Colors: ${userPersona.preferred_colors?.join(', ')}
            - Preferred Fits: ${userPersona.preferred_fits?.join(', ')}
            - Style Keywords: ${userPersona.style_keywords?.join(', ')}
            
            Keep the reason concise (max 2 sentences) and focus on why this product matches the user's preferences.
          `
        }
      ];
      
      // Add reference image information if provided
      if (refImage) {
        content[0].text += `
          
          The user has also provided a reference image to help with the recommendations.
          Consider the visual elements in the reference image when generating the recommendation reason.
        `;
        
        content.push({
          type: "input_image",
          image_url: `data:image/jpeg;base64,${refImage}`,
        });
      }
      
      // Use imageLLM for all cases
      const response = await this.imageLLM.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: content,
          },
        ],
      });
      
      return response.output_text.trim();
    } catch (error) {
      console.error('Error generating recommendation reason:', error);
      return 'This product matches your style preferences.';
    }
  }

  /**
   * Process user feedback on recommendations
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {boolean} liked - Whether the user liked the product
   * @param {string} feedback - Additional feedback text (optional)
   * @param {Object} userPersona - Current user persona
   * @returns {Promise<Object>} Updated user persona
   */
  async processUserFeedback(userId, productId, liked, feedback = '', userPersona) {
    try {
      console.log(`Processing user feedback for product ${productId}...`);
      
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      // Clone the user persona to avoid modifying the original
      const updatedPersona = JSON.parse(JSON.stringify(userPersona));
      
      // Add product to liked or disliked list
      if (liked) {
        updatedPersona.recent_feedback.liked.push(productId);
        
        // Add product attributes to preferences
        if (product.primary_color && !updatedPersona.preferred_colors.includes(product.primary_color)) {
          updatedPersona.preferred_colors.push(product.primary_color);
        }
        
        if (product.fit_type && !updatedPersona.preferred_fits.includes(product.fit_type)) {
          updatedPersona.preferred_fits.push(product.fit_type);
        }
        
        if (product.style_type && !updatedPersona.style_keywords.includes(product.style_type)) {
          updatedPersona.style_keywords.push(product.style_type);
        }
      } else {
        updatedPersona.recent_feedback.disliked.push(productId);
        
        // Add product attributes to disliked list
        if (product.primary_color && !updatedPersona.disliked_tags.includes(product.primary_color)) {
          updatedPersona.disliked_tags.push(product.primary_color);
        }
      }
      
      // Process additional feedback if provided
      if (feedback) {
        const updatedPreferences = await this.extractPreferencesFromFeedback(feedback, product, updatedPersona);
        
        // Merge updated preferences
        updatedPersona.preferred_colors = [...new Set([...updatedPersona.preferred_colors, ...updatedPreferences.preferred_colors])];
        updatedPersona.preferred_fits = [...new Set([...updatedPersona.preferred_fits, ...updatedPreferences.preferred_fits])];
        updatedPersona.disliked_tags = [...new Set([...updatedPersona.disliked_tags, ...updatedPreferences.disliked_tags])];
        updatedPersona.loved_tags = [...new Set([...updatedPersona.loved_tags, ...updatedPreferences.loved_tags])];
        updatedPersona.style_keywords = [...new Set([...updatedPersona.style_keywords, ...updatedPreferences.style_keywords])];
      }
      
      return updatedPersona;
    } catch (error) {
      console.error('Error processing user feedback:', error);
      throw error;
    }
  }

  /**
   * Extract filters from user prompt
   * @param {string} prompt - User prompt
   * @param {string} refImage - Reference image (optional)
   * @returns {Promise<Object>} Extracted filters
   */
  async extractFiltersFromPrompt(prompt, refImage = null) {
    await this.init();

    try {
      // Prepare the content array for the LLM
      const content = [
        { 
          type: "input_text", 
          text: `
            You are a fashion expert. Your only task is to categorize user requests into features such that they can be queries against database to find relevant items that user wants.
            The request will always have a user prompt which defines what the user actually wants. Sometimes, it might have a reference image along with the prompt as well.
            In that case, you need to evaluate user's prompt against that image and then provide the features categorization.
            Don't jump directly to conclusions based on user prompt only.
            Try to provide category and colors at least to make the database search easy.
            But you don't need to provide any false data if you don't know the answer. Empty string or null will work.
            
            User request: "${prompt}"

            Extract filters in JSON format without any json code block indicator:
            {{
              "category": "category name if mentioned, otherwise null -- category can be tops, bottoms or one-piece",
              "colors": ["color1", "color2"],
              "fits": ["fit1", "fit2"],
              "styles": ["style1", "style2"],
              "occasions": ["occasion1", "occasion2"],
              "dislike_tags": ["tag1:value1", "tag2:value2"]
            }}
            
            For dislike_tags, format them as clothing_type:value, for example "jeans:skinny" or "shirt:full-sleeves".
          `
        }
      ];
      
      // Add reference image information if provided
      if (refImage) {
        content[0].text += `
          
          The user has also provided a reference image to help with the recommendations.
          Consider the visual elements in the reference image when extracting filters.
        `;
        
        content.push({
          type: "input_image",
          image_url: `data:image/jpeg;base64,${refImage}`,
        });
      }
      
      // Use imageLLM for all cases
      const response = await this.imageLLM.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: content,
          },
        ],
      });
      
      // Parse the JSON response
      const jsonMatch = response.output_text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        category: null,
        colors: [],
        fits: [],
        styles: [],
        occasions: [],
        dislike_tags: []
      };
    } catch (error) {
      console.error('Error extracting filters from prompt:', error);
      
      // Return empty values on error
      return {
        category: null,
        colors: [],
        fits: [],
        styles: [],
        occasions: [],
        dislike_tags: []
      };
    }
  }

  /**
   * Extract preferences from user feedback
   * @param {string} feedback - User feedback
   * @param {Object} product - Product
   * @param {Object} currentPersona - Current user persona
   * @returns {Promise<Object>} Extracted preferences
   */
  async extractPreferencesFromFeedback(feedback, product, currentPersona) {
    try {
      const promptTemplate = `
        Extract fashion preferences from the following user feedback about a product.
        
        Product:
        - Title: ${product.title || 'Untitled Product'}
        - Brand: ${product.brand || 'Unknown Brand'}
        - Style: ${product.style_type || 'Unknown Style'}
        - Color: ${product.primary_color || 'Unknown Color'}
        - Fabric: ${product.fabric || 'Unknown Fabric'}
        - Fit: ${product.fit_type || 'Unknown Fit'}
        
        User Feedback: "${feedback}"
        
        Extract preferences in JSON format without any json code block indicator:
        {{
          "preferred_colors": [],
          "preferred_fits": [],
          "disliked_tags": [],
          "loved_tags": [],
          "style_keywords": []
        }}
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        preferred_colors: [],
        preferred_fits: [],
        disliked_tags: [],
        loved_tags: [],
        style_keywords: []
      };
    } catch (error) {
      console.error('Error extracting preferences from feedback:', error);
      
      // Return empty values on error
      return {
        preferred_colors: [],
        preferred_fits: [],
        disliked_tags: [],
        loved_tags: [],
        style_keywords: []
      };
    }
  }
}

module.exports = StylistAIAgent;
