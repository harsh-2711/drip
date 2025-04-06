const { ChatOpenAI } = require('@langchain/openai');
const config = require('../../config');
const StylistAIAgent = require('../stylist-ai');
const postgresDB = require('../../db/postgres');
const fs = require('fs');
const path = require('path');

/**
 * Agent F: Feedback & Refinement Loop
 * Conversational Refinement agent that processes user feedback and refines recommendations
 */
class FeedbackRefinementAgent {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../data/feedback');
    this.llm = null;
    this.stylistAI = null;
    
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
      temperature: 0.7,
      modelName: config.openai.model,
      configuration: {
        baseURL: config.openai.apiBase,
      }
    });
    
    // Initialize Stylist AI agent
    this.stylistAI = new StylistAIAgent();
  }

  /**
   * Process user feedback and refine recommendations
   * @param {string} userId - User ID
   * @param {string} feedback - User feedback text
   * @param {Object} userPersona - Current user persona
   * @param {Array} previousRecommendations - Previous recommendations
   * @param {Object} filters - Additional filters
   * @param {number} limit - Maximum number of recommendations
   * @returns {Promise<Object>} Refined recommendations and updated user persona
   */
  async processAndRefine(userId, feedback, userPersona, previousRecommendations = [], filters = {}, limit = 10) {
    await this.init();
    
    try {
      console.log('Processing feedback and refining recommendations...');
      
      // Extract feedback insights
      const feedbackInsights = await this.extractFeedbackInsights(feedback, previousRecommendations);
      
      // Update user persona based on feedback
      const updatedPersona = await this.updateUserPersona(userPersona, feedbackInsights);
      
      // Save updated persona to file for reference
      const personaPath = path.join(this.outputDir, `${userId || 'anonymous'}_persona.json`);
      fs.writeFileSync(personaPath, JSON.stringify(updatedPersona, null, 2));
      
      // Apply feedback insights to filters
      const refinedFilters = this.refineFilters(filters, feedbackInsights);
      
      // Generate new recommendations with updated persona and filters
      const refinedRecommendations = await this.stylistAI.generateRecommendations(updatedPersona, refinedFilters, limit);
      
      // Generate explanation for the refined recommendations
      const explanation = await this.generateRefinementExplanation(feedback, feedbackInsights, refinedRecommendations);
      
      return {
        recommendations: refinedRecommendations,
        userPersona: updatedPersona,
        explanation,
        feedbackInsights
      };
    } catch (error) {
      console.error('Error processing feedback and refining recommendations:', error);
      throw error;
    }
  }

  /**
   * Extract dislike tags from user feedback
   * @param {string} feedback - User feedback text
   * @param {string} productId - Product ID
   * @returns {Promise<Array<string>>} Dislike tags
   */
  async extractDislikeTags(feedback, productId) {
    await this.init();
    
    try {
      console.log('Extracting dislike tags from feedback...');
      
      // Get product details
      const products = await postgresDB.queryProducts({ product_id: productId }, 1, 0);
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }
      
      const product = products[0];
      
      const promptTemplate = `
        Extract dislike tags from the user's feedback about a product.
        
        Product:
        - Title: ${product.title || 'Untitled Product'}
        - Brand: ${product.brand || 'Unknown Brand'}
        - Style: ${product.style_type || 'Unknown Style'}
        - Color: ${product.primary_color || 'Unknown Color'}
        - Fabric: ${product.fabric || 'Unknown Fabric'}
        - Fit: ${product.fit_type || 'Unknown Fit'}
        
        User Feedback: "${feedback}"
        
        Extract dislike tags in the format "clothing_type:value", for example "jeans:skinny" or "shirt:full-sleeves".
        Return the tags as a JSON array:
        
        ["tag1", "tag2", "tag3"]
        
        Focus on specific attributes that the user dislikes about the product.
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return [];
    } catch (error) {
      console.error('Error extracting dislike tags:', error);
      return [];
    }
  }

  /**
   * Extract insights from user feedback
   * @param {string} feedback - User feedback text
   * @param {Array} previousRecommendations - Previous recommendations
   * @returns {Promise<Object>} Extracted feedback insights
   */
  async extractFeedbackInsights(feedback, previousRecommendations) {
    try {
      // Create a list of previous recommendation titles
      const recommendationTitles = previousRecommendations.map(rec => 
        `${rec.title || 'Untitled'} (${rec.brand || 'Unknown Brand'})`
      ).join('\n- ');
      
      const promptTemplate = `
        Extract fashion preference insights from the following user feedback about previous recommendations.
        
        Previous Recommendations:
        - ${recommendationTitles || 'No previous recommendations'}
        
        User Feedback: "${feedback}"
        
        Extract insights in JSON format:
        {
          "liked_aspects": ["aspect1", "aspect2"],
          "disliked_aspects": ["aspect1", "aspect2"],
          "preferred_colors": ["color1", "color2"],
          "preferred_fits": ["fit1", "fit2"],
          "preferred_styles": ["style1", "style2"],
          "preferred_price_range": {"min": null, "max": null},
          "preferred_occasions": ["occasion1", "occasion2"],
          "specific_requests": ["request1", "request2"]
        }
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      
      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        liked_aspects: [],
        disliked_aspects: [],
        preferred_colors: [],
        preferred_fits: [],
        preferred_styles: [],
        preferred_price_range: { min: null, max: null },
        preferred_occasions: [],
        specific_requests: []
      };
    } catch (error) {
      console.error('Error extracting feedback insights:', error);
      
      // Return empty values on error
      return {
        liked_aspects: [],
        disliked_aspects: [],
        preferred_colors: [],
        preferred_fits: [],
        preferred_styles: [],
        preferred_price_range: { min: null, max: null },
        preferred_occasions: [],
        specific_requests: []
      };
    }
  }

  /**
   * Update user persona based on feedback insights
   * @param {Object} userPersona - Current user persona
   * @param {Object} feedbackInsights - Extracted feedback insights
   * @returns {Promise<Object>} Updated user persona
   */
  async updateUserPersona(userPersona, feedbackInsights) {
    try {
      // Clone the user persona to avoid modifying the original
      const updatedPersona = JSON.parse(JSON.stringify(userPersona));
      
      // Update preferred colors
      if (feedbackInsights.preferred_colors && feedbackInsights.preferred_colors.length > 0) {
        updatedPersona.preferred_colors = [...new Set([...updatedPersona.preferred_colors, ...feedbackInsights.preferred_colors])];
      }
      
      // Update preferred fits
      if (feedbackInsights.preferred_fits && feedbackInsights.preferred_fits.length > 0) {
        updatedPersona.preferred_fits = [...new Set([...updatedPersona.preferred_fits, ...feedbackInsights.preferred_fits])];
      }
      
      // Update style keywords
      if (feedbackInsights.preferred_styles && feedbackInsights.preferred_styles.length > 0) {
        updatedPersona.style_keywords = [...new Set([...updatedPersona.style_keywords, ...feedbackInsights.preferred_styles])];
      }
      
      // Update occasions
      if (feedbackInsights.preferred_occasions && feedbackInsights.preferred_occasions.length > 0) {
        updatedPersona.occasions = [...new Set([...updatedPersona.occasions, ...feedbackInsights.preferred_occasions])];
      }
      
      // Update disliked tags
      if (feedbackInsights.disliked_aspects && feedbackInsights.disliked_aspects.length > 0) {
        updatedPersona.disliked_tags = [...new Set([...updatedPersona.disliked_tags, ...feedbackInsights.disliked_aspects])];
      }
      
      // Update loved tags
      if (feedbackInsights.liked_aspects && feedbackInsights.liked_aspects.length > 0) {
        updatedPersona.loved_tags = [...new Set([...updatedPersona.loved_tags, ...feedbackInsights.liked_aspects])];
      }
      
      return updatedPersona;
    } catch (error) {
      console.error('Error updating user persona:', error);
      return userPersona; // Return original persona on error
    }
  }

  /**
   * Refine filters based on feedback insights
   * @param {Object} filters - Current filters
   * @param {Object} feedbackInsights - Extracted feedback insights
   * @returns {Object} Refined filters
   */
  refineFilters(filters, feedbackInsights) {
    // Clone the filters to avoid modifying the original
    const refinedFilters = { ...filters };
    
    // Apply price range if specified
    if (feedbackInsights.preferred_price_range) {
      if (feedbackInsights.preferred_price_range.min !== null) {
        refinedFilters.price_min = feedbackInsights.preferred_price_range.min;
      }
      
      if (feedbackInsights.preferred_price_range.max !== null) {
        refinedFilters.price_max = feedbackInsights.preferred_price_range.max;
      }
    }
    
    // Apply style filter if specified
    if (feedbackInsights.preferred_styles && feedbackInsights.preferred_styles.length > 0) {
      refinedFilters.style_type = feedbackInsights.preferred_styles[0]; // Use the first preferred style
    }
    
    return refinedFilters;
  }

  /**
   * Generate an explanation for the refined recommendations
   * @param {string} feedback - User feedback text
   * @param {Object} feedbackInsights - Extracted feedback insights
   * @param {Array} refinedRecommendations - Refined recommendations
   * @returns {Promise<string>} Explanation
   */
  async generateRefinementExplanation(feedback, feedbackInsights, refinedRecommendations) {
    try {
      // Create a list of refined recommendation titles
      const recommendationTitles = refinedRecommendations.slice(0, 3).map(rec => 
        `${rec.title || 'Untitled'} (${rec.brand || 'Unknown Brand'})`
      ).join('\n- ');
      
      const promptTemplate = `
        Generate a concise explanation for how these refined recommendations address the user's feedback.
        
        User Feedback: "${feedback}"
        
        Key Insights from Feedback:
        - Liked: ${feedbackInsights.liked_aspects.join(', ') || 'None specified'}
        - Disliked: ${feedbackInsights.disliked_aspects.join(', ') || 'None specified'}
        - Preferred Colors: ${feedbackInsights.preferred_colors.join(', ') || 'None specified'}
        - Preferred Fits: ${feedbackInsights.preferred_fits.join(', ') || 'None specified'}
        - Preferred Styles: ${feedbackInsights.preferred_styles.join(', ') || 'None specified'}
        
        Top Refined Recommendations:
        - ${recommendationTitles || 'No recommendations found'}
        
        Keep the explanation concise (2-3 sentences) and focus on how the new recommendations address the user's feedback.
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      return response.content.trim();
    } catch (error) {
      console.error('Error generating refinement explanation:', error);
      return 'Based on your feedback, we\'ve refined our recommendations to better match your preferences.';
    }
  }

  /**
   * Generate a conversational response to user feedback
   * @param {string} feedback - User feedback text
   * @param {Object} feedbackInsights - Extracted feedback insights
   * @param {Array} refinedRecommendations - Refined recommendations
   * @returns {Promise<string>} Conversational response
   */
  async generateConversationalResponse(feedback, feedbackInsights, refinedRecommendations) {
    try {
      const promptTemplate = `
        Generate a friendly, conversational response to the user's feedback about fashion recommendations.
        
        User Feedback: "${feedback}"
        
        Key Insights from Feedback:
        - Liked: ${feedbackInsights.liked_aspects?.join(', ') || 'None specified'}
        - Disliked: ${feedbackInsights.disliked_aspects?.join(', ') || 'None specified'}
        - Preferred Colors: ${feedbackInsights.preferred_colors?.join(', ') || 'None specified'}
        - Preferred Fits: ${feedbackInsights.preferred_fits?.join(', ') || 'None specified'}
        - Preferred Styles: ${feedbackInsights.preferred_styles?.join(', ') || 'None specified'}
        
        Number of Refined Recommendations: ${refinedRecommendations.length}
        
        Keep the response conversational, empathetic, and brief (2-3 sentences). Acknowledge their feedback and mention that you've updated the recommendations accordingly.
      `;
      
      const response = await this.llm.invoke(promptTemplate);
      return response.content.trim();
    } catch (error) {
      console.error('Error generating conversational response:', error);
      return 'Thanks for your feedback! I\'ve updated your recommendations based on what you shared.';
    }
  }
}

module.exports = FeedbackRefinementAgent;
