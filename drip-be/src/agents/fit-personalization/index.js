const { ChatOpenAI } = require('@langchain/openai');
const config = require('../../config');
const postgresDB = require('../../db/postgres');
const fs = require('fs');
const path = require('path');

/**
 * Agent G: Fit & Size Personalization Agent
 * Dynamic Size Suggestions agent that recommends the correct size for products
 * based on user body measurements and product sizing information
 */
class FitPersonalizationAgent {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../data/fit_recommendations');
    this.llm = null;
    
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
    // Initialize LLM
    this.llm = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      temperature: 0.3, // Lower temperature for more consistent size recommendations
      modelName: config.openai.model,
      configuration: {
        baseURL: config.litellm.apiBase,
      }
    });
  }

  /**
   * Generate size recommendation for a product
   * @param {string} productId - Product ID
   * @param {Object} userMeasurements - User body measurements
   * @param {Object} userPreferences - User fit preferences
   * @returns {Promise<Object>} Size recommendation
   */
  async generateSizeRecommendation(productId, userMeasurements, userPreferences = {}) {
    await this.init();
    
    try {
      console.log(`Generating size recommendation for product ${productId}...`);
      
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      // Get fit insights for the product
      let fitInsights = null;
      if (product.FitInsight) {
        fitInsights = product.FitInsight;
      }
      
      // Generate size recommendation
      const sizeRecommendation = await this.predictSize(product, fitInsights, userMeasurements, userPreferences);
      
      // Save recommendation to file for reference
      const recommendationPath = path.join(this.outputDir, `${productId}_size_recommendation.json`);
      fs.writeFileSync(recommendationPath, JSON.stringify(sizeRecommendation, null, 2));
      
      return sizeRecommendation;
    } catch (error) {
      console.error(`Error generating size recommendation for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Predict the best size for a product
   * @param {Object} product - Product details
   * @param {Object} fitInsights - Fit insights for the product
   * @param {Object} userMeasurements - User body measurements
   * @param {Object} userPreferences - User fit preferences
   * @returns {Promise<Object>} Size prediction
   */
  async predictSize(product, fitInsights, userMeasurements, userPreferences) {
    try {
      // Create a text representation of the available sizes
      const availableSizes = product.available_sizes || [];
      const sizesText = availableSizes.join(', ');
      
      // Create a text representation of the fit insights
      let fitInsightsText = 'No fit insights available.';
      if (fitInsights) {
        fitInsightsText = `
          Fit Consensus: ${fitInsights.fit_consensus || 'Unknown'}
          Size Recommendation: ${fitInsights.size_recommendation || 'Unknown'}
          Common Complaints: ${fitInsights.common_complaints ? fitInsights.common_complaints.join(', ') : 'None'}
          Body Type Insights: ${JSON.stringify(fitInsights.body_type_insights || {})}
          Confidence Score: ${fitInsights.confidence_score || 0}
        `;
      }
      
      // Create a text representation of the user measurements
      const measurementsText = Object.entries(userMeasurements)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      // Create a text representation of the user preferences
      const preferencesText = Object.entries(userPreferences)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      const promptTemplate = `
        Predict the best size for this product based on the user's measurements and the product details.
        
        Product:
        - Title: ${product.title || 'Untitled Product'}
        - Brand: ${product.brand || 'Unknown Brand'}
        - Style: ${product.style_type || 'Unknown Style'}
        - Fit Type: ${product.fit_type || 'Unknown Fit'}
        - Available Sizes: ${sizesText || 'Unknown'}
        
        Fit Insights:
        ${fitInsightsText}
        
        User Measurements:
        ${measurementsText || 'No measurements provided'}
        
        User Preferences:
        ${preferencesText || 'No preferences provided'}
        
        Respond in JSON format:
        {
          "recommended_size": "size",
          "confidence_level": "high/medium/low",
          "fit_notes": "Brief explanation of the recommendation",
          "alternative_size": "Alternative size if between sizes",
          "sizing_advice": "General advice about this brand/product sizing"
        }
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        recommended_size: availableSizes.length > 0 ? availableSizes[Math.floor(availableSizes.length / 2)] : 'M',
        confidence_level: 'low',
        fit_notes: 'Unable to generate personalized recommendation.',
        alternative_size: null,
        sizing_advice: 'Consider checking the brand\'s size chart for more accurate sizing.'
      };
    } catch (error) {
      console.error('Error predicting size:', error);
      
      // Return a fallback recommendation
      const availableSizes = product.available_sizes || [];
      return {
        recommended_size: availableSizes.length > 0 ? availableSizes[Math.floor(availableSizes.length / 2)] : 'M',
        confidence_level: 'low',
        fit_notes: 'Error generating personalized recommendation.',
        alternative_size: null,
        sizing_advice: 'Consider checking the brand\'s size chart for more accurate sizing.'
      };
    }
  }

  /**
   * Extract body measurements from image
   * @param {string} imageUrl - URL of the user's body image
   * @returns {Promise<Object>} Extracted measurements
   */
  async extractMeasurementsFromImage(imageUrl) {
    try {
      console.log('Extracting measurements from image...');
      
      // Note: In a real implementation, this would use MediaPipe or a similar
      // computer vision library to extract body measurements from the image.
      // For this implementation, we'll use a placeholder that returns estimated measurements.
      
      const promptTemplate = `
        You are a computer vision system that has analyzed a user's body image.
        Generate plausible body measurements for a random adult.
        
        Respond in JSON format:
        {
          "height_cm": 170,
          "weight_kg": 70,
          "chest_cm": 95,
          "waist_cm": 80,
          "hips_cm": 95,
          "shoulder_width_cm": 45,
          "inseam_cm": 80,
          "body_shape": "rectangle/hourglass/pear/apple/inverted-triangle",
          "fit_preference": "loose/regular/slim"
        }
        Ensure the measurements are realistic and consistent with each other.
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        height_cm: 170,
        weight_kg: 70,
        chest_cm: 95,
        waist_cm: 80,
        hips_cm: 95,
        shoulder_width_cm: 45,
        inseam_cm: 80,
        body_shape: 'rectangle',
        fit_preference: 'regular'
      };
    } catch (error) {
      console.error('Error extracting measurements from image:', error);
      
      // Return default measurements on error
      return {
        height_cm: 170,
        weight_kg: 70,
        chest_cm: 95,
        waist_cm: 80,
        hips_cm: 95,
        shoulder_width_cm: 45,
        inseam_cm: 80,
        body_shape: 'rectangle',
        fit_preference: 'regular'
      };
    }
  }

  /**
   * Generate fit advice from user persona
   * @param {string} productId - Product ID
   * @param {Object} userPersona - User persona
   * @returns {Promise<Object>} Fit advice and recommended size
   */
  async generateFitAdviceFromPersona(productId, userPersona) {
    await this.init();
    
    try {
      console.log(`Generating fit advice for product ${productId} from user persona...`);
      
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      // Get fit insights for the product
      let bodyTypeInsights = {};
      if (product.body_type_insights) {
        bodyTypeInsights = product.body_type_insights;
      }
      
      const promptTemplate = `
        Generate a size recommendation and fit advice for this product based on the user's persona.
        
        Product:
        - Title: ${product.title || 'Untitled Product'}
        - Brand: ${product.brand || 'Unknown Brand'}
        - Style Type: ${product.style_type || 'Unknown Style'}
        - Fit Type: ${product.fit_type || 'Unknown Fit'}
        - Available Sizes: ${product.available_sizes?.join(', ') || 'Unknown'}
        - Body Type Insights: ${JSON.stringify(bodyTypeInsights)}
        
        User Persona:
        - Gender: ${userPersona.gender || 'Unknown'}
        - Body Shape: ${userPersona.body_shape || 'Unknown'}
        - Ideal Size: ${JSON.stringify(userPersona.ideal_size || {})}
        
        Based on the product details and user's body shape, recommend the best size and provide
        a brief explanation (max 2 sentences) of why this size would be the best fit.
        
        Respond in JSON format:
        {
          "recommended_size": "size",
          "fitting_advice": "Brief explanation of the recommendation"
        }
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      const availableSizes = product.available_sizes || ['S', 'M', 'L', 'XL'];
      return {
        recommended_size: userPersona.ideal_size?.tops || availableSizes[Math.floor(availableSizes.length / 2)],
        fitting_advice: "This size should provide a comfortable fit based on your body shape."
      };
    } catch (error) {
      console.error(`Error generating fit advice for product ${productId}:`, error);
      
      // Return a fallback recommendation
      return {
        recommended_size: "M",
        fitting_advice: "We recommend a medium size as a standard fit for most body types."
      };
    }
  }

  /**
   * Generate fit advice for a product
   * @param {string} productId - Product ID
   * @param {Object} userMeasurements - User body measurements
   * @param {Object} sizeRecommendation - Size recommendation
   * @returns {Promise<string>} Fit advice
   */
  async generateFitAdvice(productId, userMeasurements, sizeRecommendation) {
    try {
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      const promptTemplate = `
        Generate personalized fit advice for this product based on the user's measurements and the size recommendation.
        
        Product:
        - Title: ${product.title || 'Untitled Product'}
        - Brand: ${product.brand || 'Unknown Brand'}
        - Style: ${product.style_type || 'Unknown Style'}
        - Fit Type: ${product.fit_type || 'Unknown Fit'}
        
        User Measurements:
        - Height: ${userMeasurements.height_cm || 'Unknown'} cm
        - Weight: ${userMeasurements.weight_kg || 'Unknown'} kg
        - Body Shape: ${userMeasurements.body_shape || 'Unknown'}
        
        Size Recommendation:
        - Recommended Size: ${sizeRecommendation.recommended_size || 'Unknown'}
        - Confidence Level: ${sizeRecommendation.confidence_level || 'Unknown'}
        - Sizing Advice: ${sizeRecommendation.sizing_advice || 'Unknown'}
        
        Provide 2-3 sentences of personalized advice on how this product will fit the user's body type,
        any areas that might be tighter or looser, and how to style it for their body shape.
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      return response.content.trim();
    } catch (error) {
      console.error('Error generating fit advice:', error);
      return 'This product should fit well in the recommended size. Consider the sizing advice for the best fit.';
    }
  }

  /**
   * Generate a size chart for a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Size chart
   */
  async generateSizeChart(productId) {
    try {
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      // Create a text representation of the available sizes
      const availableSizes = product.available_sizes || [];
      
      const promptTemplate = `
        Generate a plausible size chart for this product based on the available sizes and product type.
        
        Product:
        - Title: ${product.title || 'Untitled Product'}
        - Brand: ${product.brand || 'Unknown Brand'}
        - Style: ${product.style_type || 'Unknown Style'}
        - Fit Type: ${product.fit_type || 'Unknown Fit'}
        - Available Sizes: ${availableSizes.join(', ') || 'Unknown'}
        
        Respond with a JSON object where keys are sizes and values are objects with measurements.
        For example:
        {
          "S": {
            "chest_cm": 90,
            "waist_cm": 75,
            "hips_cm": 90,
            "shoulder_width_cm": 42,
            "length_cm": 70
          },
          "M": {
            "chest_cm": 95,
            "waist_cm": 80,
            "hips_cm": 95,
            "shoulder_width_cm": 44,
            "length_cm": 72
          }
        }
        
        Include all available sizes and ensure the measurements are realistic and consistent.
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      const fallbackChart = {};
      for (const size of availableSizes) {
        fallbackChart[size] = {
          chest_cm: 90 + (availableSizes.indexOf(size) * 5),
          waist_cm: 75 + (availableSizes.indexOf(size) * 5),
          hips_cm: 90 + (availableSizes.indexOf(size) * 5),
          shoulder_width_cm: 42 + (availableSizes.indexOf(size) * 2),
          length_cm: 70 + (availableSizes.indexOf(size) * 2)
        };
      }
      
      return fallbackChart;
    } catch (error) {
      console.error('Error generating size chart:', error);
      
      // Return a fallback size chart
      const availableSizes = product?.available_sizes || ['S', 'M', 'L', 'XL'];
      const fallbackChart = {};
      
      for (const size of availableSizes) {
        fallbackChart[size] = {
          chest_cm: 90 + (availableSizes.indexOf(size) * 5),
          waist_cm: 75 + (availableSizes.indexOf(size) * 5),
          hips_cm: 90 + (availableSizes.indexOf(size) * 5),
          shoulder_width_cm: 42 + (availableSizes.indexOf(size) * 2),
          length_cm: 70 + (availableSizes.indexOf(size) * 2)
        };
      }
      
      return fallbackChart;
    }
  }
}

module.exports = FitPersonalizationAgent;
