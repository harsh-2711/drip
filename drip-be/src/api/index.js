const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const StylistAIAgent = require('../agents/stylist-ai');
const FeedbackRefinementAgent = require('../agents/feedback-refinement');
const FitPersonalizationAgent = require('../agents/fit-personalization');
const VisualGenerationAgent = require('../agents/visual-generation');
const config = require('../config');

// Import routes
const visualRoutes = require('./routes/visual');

// Initialize agents
const stylistAI = new StylistAIAgent();
const feedbackRefinement = new FeedbackRefinementAgent();
const fitPersonalization = new FitPersonalizationAgent();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({limit: '100mb'}));

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: true,
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes

/**
 * Agent E: Stylist AI
 */

// Generate user persona from image
app.post('/api/stylist/persona',
  [
    body('imageBase64').isString().notEmpty().withMessage('Image in base64 format is required'),
    body('userId').optional().isString(),
    body('preferences').optional().isObject(),
    body('attributes').optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const userPersona = await stylistAI.generateUserPersona(req.body);
      res.json({
        success: true,
        userPersona
      });
    } catch (error) {
      next(error);
    }
  }
);

// Generate recommendations
app.post('/api/stylist/recommendations',
  [
    body('userPersona').isObject().notEmpty().withMessage('User persona is required'),
    body('category').optional().isString(),
    body('loved_colors').optional().isArray(),
    body('loved_fits').optional().isArray(),
    body('dislike_tags').optional().isArray(),
    body('user_prompt').optional().isString(),
    body('ref_image').optional().isString(),
    body('filters').optional().isObject(),
    body('limit').optional().isInt({ min: 1, max: 50 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { 
        userPersona, 
        category, 
        loved_colors = [], 
        loved_fits = [], 
        dislike_tags = [], 
        user_prompt = '',
        ref_image = null,
        filters = {}, 
        limit = 10 
      } = req.body;

      // Update user persona with additional preferences
      const enhancedPersona = { ...userPersona };
      if (loved_colors.length > 0) {
        enhancedPersona.preferred_colors = [...new Set([
          ...(enhancedPersona.preferred_colors || []),
          ...loved_colors
        ])];
      }
      
      if (loved_fits.length > 0) {
        enhancedPersona.preferred_fits = [...new Set([
          ...(enhancedPersona.preferred_fits || []),
          ...loved_fits
        ])];
      }
      
      if (dislike_tags.length > 0) {
        enhancedPersona.disliked_tags = [...new Set([
          ...(enhancedPersona.disliked_tags || []),
          ...dislike_tags
        ])];
      }
      
      // Process user prompt to modify filters if needed
      let updatedFilters = { ...filters };
      if (user_prompt) {
        // user prompt will override everything else
        const promptFilters = await stylistAI.extractFiltersFromPrompt(user_prompt, ref_image);
        const recommendations = await stylistAI.generateRecommendations(enhancedPersona, promptFilters, ref_image, limit);
      
        return res.json({
          success: true,
          count: recommendations.length,
          recommendations
        });
      }
      
      // Add category to filters if provided
      if (category) {
        updatedFilters.category = category;
      }
      
      const recommendations = await stylistAI.generateRecommendations(enhancedPersona, updatedFilters, ref_image, limit);
      
      res.json({
        success: true,
        count: recommendations.length,
        recommendations
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Agent F: Feedback & Refinement
 */

// Process feedback and extract dislike tags
app.post('/api/feedback/refine',
  [
    body('feedback').isString().notEmpty().withMessage('Feedback is required'),
    body('productId').isString().notEmpty().withMessage('Product ID is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { feedback, productId } = req.body;
      const dislikeTags = await feedbackRefinement.extractDislikeTags(feedback, productId);
      res.json({
        success: true,
        dislike_tags: dislikeTags
      });
    } catch (error) {
      next(error);
    }
  }
);

// This endpoint has been removed as per FLEET_B_UPGRADES.md requirements

/**
 * Agent G: Fit & Size Personalization
 */

// Generate size recommendation
app.post('/api/fit/size-recommendation',
  [
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('userMeasurements').isObject().notEmpty().withMessage('User measurements are required'),
    body('userPreferences').optional().isObject()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { productId, userMeasurements, userPreferences = {} } = req.body;
      const sizeRecommendation = await fitPersonalization.generateSizeRecommendation(
        productId,
        userMeasurements,
        userPreferences
      );
      res.json({
        success: true,
        sizeRecommendation
      });
    } catch (error) {
      next(error);
    }
  }
);

// This endpoint has been removed as per FLEET_B_UPGRADES.md requirements

// Generate fit advice
app.post('/api/fit/advice',
  [
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('userPersona').isObject().notEmpty().withMessage('User persona is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { productId, userPersona } = req.body;
      const fitResult = await fitPersonalization.generateFitAdviceFromPersona(
        productId,
        userPersona
      );
      res.json({
        success: true,
        recommended_size: fitResult.recommended_size,
        fitting_advice: fitResult.fitting_advice
      });
    } catch (error) {
      next(error);
    }
  }
);

// Generate size chart
app.get('/api/fit/size-chart/:productId',
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const sizeChart = await fitPersonalization.generateSizeChart(productId);
      res.json({
        success: true,
        sizeChart
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Agent H: Visual Generation
 */

// Use visual routes
app.use('/api/visual', visualRoutes);

// Apply error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3000;

const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Fleet B API server running on port ${PORT}`);
      resolve(server);
    });
    
    server.on('error', (error) => {
      reject(error);
    });
  });
};

module.exports = { app, startServer };
