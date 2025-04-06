const express = require('express');
const router = express.Router();
const VisualGenerationAgent = require('../../agents/visual-generation');

// Initialize the Visual Generation agent
const visualAgent = new VisualGenerationAgent();

/**
 * @route POST /api/visual/outfit
 * @desc Generate a visualization of an outfit by replacing user's clothes with product
 * @access Public
 */
router.post('/outfit', async (req, res) => {
  try {
    const { userImageBase64, productId } = req.body;

    // Validate request
    if (!userImageBase64) {
      return res.status(400).json({
        error: true,
        message: 'User image in base64 format is required',
        errors: [{ param: 'userImageBase64', msg: 'User image is required', location: 'body' }]
      });
    }

    if (!productId) {
      return res.status(400).json({
        error: true,
        message: 'Product ID is required',
        errors: [{ param: 'productId', msg: 'Product ID is required', location: 'body' }]
      });
    }

    // Generate outfit visualization
    const result = await visualAgent.generateOutfitWithUserImage(
      userImageBase64,
      productId
    );

    return res.json({
      success: true,
      image: result.image
    });
  } catch (error) {
    console.error('Error generating outfit visualization:', error);
    return res.status(500).json({
      error: true,
      message: 'Error generating outfit visualization',
      errors: [{ msg: error.message }]
    });
  }
});

/**
 * @route POST /api/visual/styling-tips
 * @desc Generate styling tips for products
 * @access Public
 */
router.post('/styling-tips', async (req, res) => {
  try {
    const { products, userPersona } = req.body;

    // Validate request
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Products array is required',
        errors: [{ param: 'products', msg: 'Products array is required', location: 'body' }]
      });
    }

    if (!userPersona) {
      return res.status(400).json({
        error: true,
        message: 'User persona is required',
        errors: [{ param: 'userPersona', msg: 'User persona is required', location: 'body' }]
      });
    }

    // Generate styling tips
    const stylingTips = await visualAgent.generateStylingTips(products, userPersona);

    return res.json({
      success: true,
      stylingTips
    });
  } catch (error) {
    console.error('Error generating styling tips:', error);
    return res.status(500).json({
      error: true,
      message: 'Error generating styling tips',
      errors: [{ msg: error.message }]
    });
  }
});

/**
 * @route POST /api/visual/mood-board
 * @desc Generate a mood board for a style concept
 * @access Public
 */
router.post('/mood-board', async (req, res) => {
  try {
    const { styleDescription, userPersona, numImages } = req.body;

    // Validate request
    if (!styleDescription) {
      return res.status(400).json({
        error: true,
        message: 'Style description is required',
        errors: [{ param: 'styleDescription', msg: 'Style description is required', location: 'body' }]
      });
    }

    if (!userPersona) {
      return res.status(400).json({
        error: true,
        message: 'User persona is required',
        errors: [{ param: 'userPersona', msg: 'User persona is required', location: 'body' }]
      });
    }

    // Generate mood board
    const moodBoard = await visualAgent.generateMoodBoard(
      styleDescription,
      userPersona,
      numImages || 4
    );

    return res.json({
      success: true,
      moodBoard
    });
  } catch (error) {
    console.error('Error generating mood board:', error);
    return res.status(500).json({
      error: true,
      message: 'Error generating mood board',
      errors: [{ msg: error.message }]
    });
  }
});

/**
 * @route POST /api/visual/outfit-description
 * @desc Generate a description of how an outfit would look on the user
 * @access Public
 */
router.post('/outfit-description', async (req, res) => {
  try {
    const { products, userPersona } = req.body;

    // Validate request
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Products array is required',
        errors: [{ param: 'products', msg: 'Products array is required', location: 'body' }]
      });
    }

    if (!userPersona) {
      return res.status(400).json({
        error: true,
        message: 'User persona is required',
        errors: [{ param: 'userPersona', msg: 'User persona is required', location: 'body' }]
      });
    }

    // Generate outfit description
    const description = await visualAgent.generateOutfitDescription(products, userPersona);

    return res.json({
      success: true,
      description
    });
  } catch (error) {
    console.error('Error generating outfit description:', error);
    return res.status(500).json({
      error: true,
      message: 'Error generating outfit description',
      errors: [{ msg: error.message }]
    });
  }
});

module.exports = router;
