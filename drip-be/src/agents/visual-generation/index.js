const { LLMChain } = require('langchain/chains');
const { PromptTemplate } = require('@langchain/core/prompts');
const { ChatOpenAI } = require('@langchain/openai');
const axios = require('axios');
const config = require('../../config');
const postgresDB = require('../../db/postgres');

/**
 * Visual Generation Agent
 * 
 * This agent is responsible for generating visualizations of outfits,
 * styling tips, mood boards, and outfit descriptions.
 */
class VisualGenerationAgent {
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: config.openai.model,
      temperature: 0.7,
      openAIApiKey: config.openai.apiKey,
      configuration: {
        baseURL: config.litellm.apiBase,
      }
    });
  }

  /**
   * Generate an outfit visualization by replacing user's clothes with product using Fashn.ai API
   * @param {string} userImageBase64 - User image in base64 format
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Visualization result with base64 image
   */
  async generateOutfitWithUserImage(userImageBase64, productId) {
    try {
      console.log(`Generating outfit visualization with user image for product ${productId}...`);
      
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      // Get the first product image
      const productImage = product.image_urls && product.image_urls.length > 0 
        ? product.image_urls[0] 
        : null;
        
      if (!productImage) {
        throw new Error(`No image found for product ${productId}`);
      }
      
      // Determine the category based on product type
      let category = 'auto';
      const productType = (product.style_type || '').toLowerCase();
      
      if (productType.includes('shirt') || productType.includes('top') || productType.includes('blouse') || 
          productType.includes('sweater') || productType.includes('jacket') || productType.includes('coat')) {
        category = 'tops';
      } else if (productType.includes('pant') || productType.includes('trouser') || productType.includes('short') || 
                productType.includes('skirt') || productType.includes('jeans')) {
        category = 'bottoms';
      } else if (productType.includes('dress') || productType.includes('jumpsuit') || 
                productType.includes('romper') || productType.includes('suit')) {
        category = 'one-pieces';
      }
      
      // Prepare the request to Fashn.ai API
      const fashnApiKey = config.fashn ? config.fashn.apiKey : 'YOUR_FASHN_API_KEY';
      
      // Make the initial request to start the prediction
      const runResponse = await axios.post(
        'https://api.fashn.ai/v1/run',
        {
          model_image: `data:image/jpeg;base64,${userImageBase64}`,
          garment_image: productImage,
          category: category,
          mode: 'quality' // Use quality mode for best results
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fashnApiKey}`
          }
        }
      );
      
      if (!runResponse.data || !runResponse.data.id) {
        throw new Error('Failed to start prediction with Fashn.ai API');
      }
      
      const predictionId = runResponse.data.id;
      console.log(`Prediction started with ID: ${predictionId}`);
      
      // Poll the status endpoint until the prediction is completed
      let statusResponse;
      let attempts = 0;
      const maxAttempts = 30; // Maximum number of polling attempts
      const pollingInterval = 2000; // 2 seconds between polls
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollingInterval));
        
        statusResponse = await axios.get(
          `https://api.fashn.ai/v1/status/${predictionId}`,
          {
            headers: {
              'Authorization': `Bearer ${fashnApiKey}`
            }
          }
        );
        
        console.log(`Prediction status: ${statusResponse.data.status}`);
        
        if (statusResponse.data.status === 'completed') {
          break;
        } else if (statusResponse.data.status === 'failed') {
          throw new Error(`Prediction failed: ${statusResponse.data.error || 'Unknown error'}`);
        }
        
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Prediction timed out');
      }
      
      // Get the output image URL
      if (!statusResponse.data.output || !statusResponse.data.output.length) {
        throw new Error('No output image found in prediction result');
      }
      
      const outputImageUrl = statusResponse.data.output[0];
      
      // Download the image and convert to base64
      const imageResponse = await axios.get(outputImageUrl, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
      
      return {
        image: base64Image,
        product_id: productId
      };
    } catch (error) {
      console.error('Error generating outfit with user image:', error);
      
      // Return a placeholder image in case of error
      return {
        image: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", // Tiny transparent GIF
        product_id: productId,
        error: error.message
      };
    }
  }

  /**
   * Generate a visualization of an outfit
   * @param {Array} products - Products to visualize
   * @param {Object} userPersona - User persona
   * @param {string} styleContext - Additional style context
   * @param {string} outputFormat - Output format (url or base64)
   * @returns {Promise<Object>} Visualization result
   */
  async generateOutfitVisualization(products, userPersona, styleContext = '', outputFormat = 'url') {
    try {
      // Create a detailed prompt for the outfit visualization
      const outfitPrompt = await this._createOutfitVisualizationPrompt(products, userPersona, styleContext);
      
      // In a real implementation, this would call an image generation API
      // For now, we'll return a placeholder
      
      return {
        prompt: outfitPrompt,
        imageUrl: 'https://placeholder.com/outfit-visualization',
        format: outputFormat,
        products: products.map(p => p.product_id || p.id)
      };
    } catch (error) {
      console.error('Error generating outfit visualization:', error);
      throw error;
    }
  }

  /**
   * Generate styling tips for products
   * @param {Array} products - Products to generate styling tips for
   * @param {Object} userPersona - User persona
   * @returns {Promise<Object>} Styling tips
   */
  async generateStylingTips(products, userPersona) {
    try {
      const promptTemplate = new PromptTemplate({
        template: `
          You are a professional fashion stylist with expertise in creating personalized styling advice.
          
          # User Profile
          - Body shape: {bodyShape}
          - Skin tone: {skinTone}
          - Style preferences: {stylePreferences}
          - Preferred fits: {preferredFits}
          - Disliked elements: {dislikedElements}
          
          # Products
          {productDetails}
          
          # Task
          Create detailed styling tips for these products that are personalized to the user's profile.
          Include:
          1. How to wear these items together
          2. Suggestions for complementary accessories
          3. Occasions where this outfit would be appropriate
          4. Alternative styling options
          5. Care instructions for maintaining the look
          
          Format your response as a JSON object with the following structure without any json code block indicator:
          {{
            "outfitName": "Name of the outfit combination",
            "primaryStylingTip": "Main styling advice",
            "stylingTips": [
              {{
                "title": "Tip title",
                "description": "Detailed description"
              }}
            ],
            "occasions": ["Occasion 1", "Occasion 2"],
            "accessorySuggestions": ["Suggestion 1", "Suggestion 2"],
            "careInstructions": ["Instruction 1", "Instruction 2"]
          }}
        `,
        inputVariables: [
          'bodyShape',
          'skinTone',
          'stylePreferences',
          'preferredFits',
          'dislikedElements',
          'productDetails'
        ]
      });
      
      // Format product details
      const productDetails = products.map(p => {
        return `
          - Product: ${p.title || 'Unknown'}
          - Brand: ${p.brand || 'Unknown'}
          - Category: ${p.style_type || 'Unknown'}
          - Color: ${p.primary_color || 'Unknown'}
          - Fabric: ${p.fabric || 'Unknown'}
        `;
      }).join('\n');
      
      // Create the chain
      const chain = new LLMChain({
        llm: this.llm,
        prompt: promptTemplate
      });
      
      // Run the chain
      const result = await chain.call({
        bodyShape: userPersona.body_shape || 'unknown',
        skinTone: userPersona.skin_tone || 'unknown',
        stylePreferences: Array.isArray(userPersona.loved_colors) ? userPersona.loved_colors.join(', ') : 'versatile',
        preferredFits: Array.isArray(userPersona.preferred_fits) ? userPersona.preferred_fits.join(', ') : 'standard',
        dislikedElements: Array.isArray(userPersona.disliked_tags) ? userPersona.disliked_tags.join(', ') : 'none',
        productDetails
      });
      
      // Parse the result
      const stylingTips = JSON.parse(result.text);
      
      return stylingTips;
    } catch (error) {
      console.error('Error generating styling tips:', error);
      throw error;
    }
  }

  /**
   * Generate a mood board for a style concept
   * @param {string} styleDescription - Style description
   * @param {Object} userPersona - User persona
   * @param {number} numImages - Number of images to generate
   * @returns {Promise<Object>} Mood board
   */
  async generateMoodBoard(styleDescription, userPersona, numImages = 4) {
    try {
      const promptTemplate = new PromptTemplate({
        template: `
          You are a fashion mood board creator with expertise in visualizing style concepts.
          
          # Style Description
          {styleDescription}
          
          # User Profile
          - Body shape: {bodyShape}
          - Skin tone: {skinTone}
          - Style preferences: {stylePreferences}
          
          # Task
          Create a detailed mood board concept based on the style description and user profile.
          Include:
          1. A title for the mood board
          2. A description of the overall aesthetic
          3. ${numImages} image prompts that would represent this style concept
          4. Color palette suggestions
          5. Key elements that define this style
          
          Format your response as a JSON object with the following structure without any json code identifier:
          {{
            "title": "Mood board title",
            "description": "Overall aesthetic description",
            "imagePrompts": [
              "Detailed image prompt 1",
              "Detailed image prompt 2"
            ],
            "colorPalette": ["Color 1", "Color 2", "Color 3"],
            "keyElements": ["Element 1", "Element 2", "Element 3"]
          }}
        `,
        inputVariables: [
          'styleDescription',
          'bodyShape',
          'skinTone',
          'stylePreferences'
        ]
      });
      
      // Create the chain
      const chain = new LLMChain({
        llm: this.llm,
        prompt: promptTemplate
      });
      
      // Run the chain
      const result = await chain.call({
        styleDescription,
        bodyShape: userPersona.body_shape || 'unknown',
        skinTone: userPersona.skin_tone || 'unknown',
        stylePreferences: Array.isArray(userPersona.loved_colors) ? userPersona.loved_colors.join(', ') : 'versatile'
      });
      
      // Parse the result
      const moodBoard = JSON.parse(result.text);
      
      // In a real implementation, we would generate images based on the prompts
      // For now, we'll add placeholder image URLs
      moodBoard.images = moodBoard.imagePrompts.map((_, index) => {
        return `https://placeholder.com/mood-board-image-${index + 1}`;
      });
      
      return moodBoard;
    } catch (error) {
      console.error('Error generating mood board:', error);
      throw error;
    }
  }

  /**
   * Generate a description of how an outfit would look on the user
   * @param {Array} products - Products to describe
   * @param {Object} userPersona - User persona
   * @returns {Promise<Object>} Outfit description
   */
  async generateOutfitDescription(products, userPersona) {
    try {
      const promptTemplate = new PromptTemplate({
        template: `
          You are a fashion expert with a talent for visualizing how outfits will look on different body types.
          
          # User Profile
          - Body shape: {bodyShape}
          - Skin tone: {skinTone}
          - Style preferences: {stylePreferences}
          
          # Products
          {productDetails}
          
          # Task
          Create a detailed description of how these products would look when worn together by this specific user.
          Include:
          1. How the colors complement the user's skin tone
          2. How the fit works with the user's body shape
          3. The overall silhouette created by the outfit
          4. How the outfit enhances the user's best features
          5. The impression the outfit would make
          
          Format your response as a JSON object with the following structure without any json code identifier:
          {{
            "overallImpression": "Brief summary of the outfit's impact",
            "colorAnalysis": "How the colors work with the user's skin tone",
            "fitAnalysis": "How the fit works with the user's body shape",
            "silhouetteDescription": "Description of the overall silhouette",
            "enhancedFeatures": ["Feature 1", "Feature 2"],
            "stylingRecommendations": ["Recommendation 1", "Recommendation 2"]
          }}
        `,
        inputVariables: [
          'bodyShape',
          'skinTone',
          'stylePreferences',
          'productDetails'
        ]
      });
      
      // Format product details
      const productDetails = products.map(p => {
        return `
          - Product: ${p.title || 'Unknown'}
          - Brand: ${p.brand || 'Unknown'}
          - Category: ${p.style_type || 'Unknown'}
          - Color: ${p.primary_color || 'Unknown'}
          - Fabric: ${p.fabric || 'Unknown'}
          - Fit: ${p.fit_type || 'Unknown'}
        `;
      }).join('\n');
      
      // Create the chain
      const chain = new LLMChain({
        llm: this.llm,
        prompt: promptTemplate
      });
      
      // Run the chain
      const result = await chain.call({
        bodyShape: userPersona.body_shape || 'unknown',
        skinTone: userPersona.skin_tone || 'unknown',
        stylePreferences: Array.isArray(userPersona.loved_colors) ? userPersona.loved_colors.join(', ') : 'versatile',
        productDetails
      });
      
      // Parse the result
      const outfitDescription = JSON.parse(result.text);
      
      return outfitDescription;
    } catch (error) {
      console.error('Error generating outfit description:', error);
      throw error;
    }
  }

  /**
   * Create a detailed prompt for outfit visualization
   * @param {Array} products - Products to visualize
   * @param {Object} userPersona - User persona
   * @param {string} styleContext - Additional style context
   * @returns {Promise<string>} Detailed prompt
   * @private
   */
  async _createOutfitVisualizationPrompt(products, userPersona, styleContext) {
    try {
      const promptTemplate = new PromptTemplate({
        template: `
          Create a detailed prompt for generating an image of an outfit based on the following products and user profile.
          
          # User Profile
          - Body shape: {bodyShape}
          - Skin tone: {skinTone}
          
          # Products
          {productDetails}
          
          # Style Context
          {styleContext}
          
          # Task
          Create a detailed, photorealistic prompt for an image generation system that shows how these products would look when worn together.
          The prompt should be detailed enough to generate a high-quality, realistic image.
          Do not include any text or UI elements in the image description.
          Focus on the outfit, styling, and how it would complement the user's body shape and skin tone.
        `,
        inputVariables: [
          'bodyShape',
          'skinTone',
          'productDetails',
          'styleContext'
        ]
      });
      
      // Format product details
      const productDetails = products.map(p => {
        return `
          - Product: ${p.title || 'Unknown'}
          - Category: ${p.style_type || 'Unknown'}
          - Color: ${p.primary_color || 'Unknown'}
          - Fabric: ${p.fabric || 'Unknown'}
        `;
      }).join('\n');
      
      // Create the chain
      const chain = new LLMChain({
        llm: this.llm,
        prompt: promptTemplate
      });
      
      // Run the chain
      const result = await chain.call({
        bodyShape: userPersona.body_shape || 'unknown',
        skinTone: userPersona.skin_tone || 'unknown',
        productDetails,
        styleContext
      });
      
      return result.text;
    } catch (error) {
      console.error('Error creating outfit visualization prompt:', error);
      throw error;
    }
  }
}

module.exports = VisualGenerationAgent;
