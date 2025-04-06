const fs = require('fs');
const path = require('path');
const { chatModel } = require('../../utils/openai');
const config = require('../../config');

/**
 * Agent D: Review Parser & Fit Engine
 * Extracts crowd-sourced size/fitting insights from product reviews
 */
class ReviewParserAgent {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../data/fit_insights');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Few-shot examples for GPT prompt with specific body types
    this.fewShotExamples = [
      {
        reviews: [
          "I usually wear a size 32 in jeans, but these run small. Had to exchange for a 34.",
          "Great jeans but definitely size up. I'm normally a 30 and had to get a 32.",
          "True to size for me. I'm 5'10\" and the 32 fits perfectly.",
          "The waist is fine but they're tight in the thighs. Consider sizing up if you have athletic legs."
        ],
        fit_insights: {
          fit_consensus: "runs small",
          size_recommendation: "size up",
          common_complaints: ["tight in thighs", "small waist"],
          body_type_insights: {
            "Mesomorph": "size up",
            "Rectangle": "true to size"
          },
          confidence_score: 0.8
        }
      },
      {
        reviews: [
          "This dress is gorgeous but it's huge! I'm usually a medium and had to return for a small.",
          "Beautiful fabric but runs large. Size down.",
          "I found it true to size. I'm 5'6\" and 140lbs and the medium fits perfectly.",
          "The shoulders are a bit wide but otherwise fits as expected."
        ],
        fit_insights: {
          fit_consensus: "runs large",
          size_recommendation: "size down",
          common_complaints: ["wide shoulders", "too loose"],
          body_type_insights: {
            "Pear/Triangle": "size down",
            "Hourglass": "consider sizing down"
          },
          confidence_score: 0.7
        }
      },
      {
        reviews: [
          "The shirt fits perfectly across my shoulders but is a bit tight around the waist.",
          "Great for athletic builds, the arms fit well but it's snug in the midsection.",
          "Had to size up because of my broad shoulders, but then it was too loose in the waist.",
          "Perfect for my slim build, true to size."
        ],
        fit_insights: {
          fit_consensus: "true to size",
          size_recommendation: "depends on body type",
          common_complaints: ["tight in waist", "loose in waist when sized for shoulders"],
          body_type_insights: {
            "Inverted Triangle/Apple": "size up",
            "Ectomorph": "true to size",
            "Athletic": "consider athletic fit options"
          },
          confidence_score: 0.85
        }
      }
    ];
  }

  /**
   * Start the review parsing process for all products
   * @param {Array} products - List of enriched products from Agent C
   * @returns {Promise<Array>} Products with fit insights
   */
  async parseReviews(products) {
    console.log('Starting review parsing and fit insight extraction process...');
    
    const productsWithFitInsights = [];
    
    for (const product of products) {
      console.log(`Parsing reviews for product: ${product.title || 'Untitled Product'}`);
      
      try {
        // For this implementation, we'll simulate reviews since we don't have actual reviews
        // In a real implementation, reviews would be scraped alongside products in Agent B
        const simulatedReviews = this.generateSimulatedReviews(product);
        
        // Skip products with too few reviews
        if (simulatedReviews.length < 3) {
          console.log(`Skipping product due to insufficient reviews: ${product.title || 'Untitled Product'}`);
          productsWithFitInsights.push(product);
          continue;
        }
        
        // Extract fit insights from reviews
        const fitInsights = await this.extractFitInsights(product, simulatedReviews);
        
        // Create a copy of the product with fit insights
        const productWithFitInsights = {
          ...product,
          fit_insights: fitInsights,
          fit_analysis_at: new Date().toISOString()
        };
        
        productsWithFitInsights.push(productWithFitInsights);
        
        // Save product with fit insights to a JSON file
        const outputPath = path.join(this.outputDir, `${product.product_id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(productWithFitInsights, null, 2));
        
        console.log(`Extracted fit insights for product: ${product.title || 'Untitled Product'}`);
      } catch (error) {
        console.error(`Error parsing reviews for product ${product.product_id}:`, error);
        productsWithFitInsights.push(product);
      }
    }
    
    // Save all products with fit insights to a single JSON file
    const allOutputPath = path.join(this.outputDir, '../products_with_fit_insights.json');
    fs.writeFileSync(allOutputPath, JSON.stringify(productsWithFitInsights, null, 2));
    
    console.log(`Review parsing complete. Processed ${productsWithFitInsights.length} products.`);
    return productsWithFitInsights;
  }

  /**
   * Generate simulated reviews for a product
   * This is a placeholder for actual review scraping in Agent B
   * @param {Object} product - Product information
   * @returns {Array<string>} Simulated reviews
   */
  generateSimulatedReviews(product) {
    // In a real implementation, reviews would be scraped alongside products
    // For this implementation, we'll generate simulated reviews based on product attributes
    
    const reviews = [];
    const reviewCount = Math.floor(Math.random() * 8) + 3; // 3-10 reviews
    
    // Common fit-related phrases
    const fitPhrases = [
      { type: 'small', phrases: ['runs small', 'size up', 'too tight', 'smaller than expected'] },
      { type: 'large', phrases: ['runs large', 'size down', 'too loose', 'bigger than expected'] },
      { type: 'true', phrases: ['true to size', 'fits as expected', 'perfect fit', 'accurate sizing'] }
    ];
    
    // Common body parts mentioned in clothing reviews
    const bodyParts = ['shoulders', 'waist', 'hips', 'thighs', 'chest', 'arms', 'length'];
    
    // Common quality comments
    const qualityComments = [
      'Great quality material.',
      'The fabric is nice and soft.',
      'Stitching is well done.',
      'Color is exactly as shown in the picture.',
      'Very comfortable to wear.',
      'Looks expensive and well-made.',
      'The material is a bit thin.',
      'Not as durable as I expected.'
    ];
    
    // Generate reviews
    for (let i = 0; i < reviewCount; i++) {
      // Determine fit type for this review (biased toward product's actual fit)
      let fitType;
      if (product.fit_type) {
        const fitTypeMap = {
          'slim': 'small',
          'regular': 'true',
          'loose': 'large'
        };
        fitType = fitTypeMap[product.fit_type.toLowerCase()] || 
                 ['small', 'true', 'large'][Math.floor(Math.random() * 3)];
      } else {
        fitType = ['small', 'true', 'large'][Math.floor(Math.random() * 3)];
      }
      
      // Get random fit phrase for this fit type
      const fitPhrase = fitPhrases.find(fp => fp.type === fitType);
      const randomFitPhrase = fitPhrase.phrases[Math.floor(Math.random() * fitPhrase.phrases.length)];
      
      // Maybe mention a body part
      const mentionBodyPart = Math.random() > 0.5;
      let bodyPartComment = '';
      if (mentionBodyPart) {
        const bodyPart = bodyParts[Math.floor(Math.random() * bodyParts.length)];
        if (fitType === 'small') {
          bodyPartComment = ` It's particularly tight in the ${bodyPart}.`;
        } else if (fitType === 'large') {
          bodyPartComment = ` It's particularly loose in the ${bodyPart}.`;
        } else {
          bodyPartComment = ` The ${bodyPart} fits perfectly.`;
        }
      }
      
      // Add a quality comment
      const qualityComment = qualityComments[Math.floor(Math.random() * qualityComments.length)];
      
      // Construct the review
      const review = `${qualityComment} The sizing ${randomFitPhrase}.${bodyPartComment}`;
      reviews.push(review);
    }
    
    return reviews;
  }

  /**
   * Extract fit insights from reviews using GPT
   * @param {Object} product - Product information
   * @param {Array<string>} reviews - Product reviews
   * @returns {Promise<Object>} Fit insights
   */
  async extractFitInsights(product, reviews) {
    // If there are too few reviews, return low confidence result
    if (reviews.length < 3) {
      return {
        fit_consensus: "insufficient data",
        size_recommendation: "unknown",
        common_complaints: [],
        body_type_insights: {},
        confidence_score: 0.1
      };
    }
    
    // Create few-shot examples string
    const fewShotExamplesString = this.fewShotExamples.map(example => 
      `EXAMPLE REVIEWS:\n${example.reviews.map(r => `- "${r}"`).join('\n')}\n\nEXAMPLE FIT INSIGHTS: ${JSON.stringify(example.fit_insights, null, 2)}`
    ).join('\n\n');
    
    // Create messages for chat completion
    const messages = [
      {
        role: "system",
        content: `You are a fashion fit analysis expert who extracts sizing and fit insights from product reviews.
        Your task is to analyze reviews and determine the consensus on how a product fits, common complaints, and recommendations for different body types.
        Always respond with valid JSON containing only the fit insight fields, nothing else.
        For body type insights, use ONLY the specific body type terms provided in the instructions.`
      },
      {
        role: "user",
        content: `I need you to analyze these product reviews and extract fit insights.
        
        Here are a few examples of how to extract fit insights from reviews:
        
        ${fewShotExamplesString}
        
        Now, please analyze these reviews for the following product:
        
        PRODUCT: ${product.title || 'Untitled Product'}
        CATEGORY: ${product.category || product.tags?.join(', ') || 'Unknown'}
        BRAND: ${product.brand || 'Unknown'}
        GENDER: ${product.gender || 'Unknown'}
        
        REVIEWS:
        ${reviews.map(r => `- "${r}"`).join('\n')}
        
        Extract the following fit insights:
        1. fit_consensus: overall consensus on how the product fits (runs small, true to size, runs large)
        2. size_recommendation: general recommendation (size up, size down, true to size)
        3. common_complaints: array of common issues mentioned in reviews
        4. body_type_insights: object mapping body types to specific recommendations
        5. confidence_score: number between 0-1 indicating confidence in these insights based on review consistency
        
        IMPORTANT: For body_type_insights, use ONLY these specific body type terms:
        
        For men's clothing:
        - Ectomorph: Slender build, narrow shoulders and hips
        - Mesomorph: Athletic and muscular build, broad shoulders, narrow waist
        - Endomorph: Rounder physique, gains fat easily
        - Rectangle: Shoulders and hips are similar in width
        - Athletic: Muscular body without excessive curves
        - Oval: Fuller midsection with narrower shoulders and hips
        
        For women's clothing:
        - Pear/Triangle: Narrow shoulders, wide hips
        - Inverted Triangle/Apple: Broad shoulders, narrow hips
        - Rectangle/Banana: Equal width of shoulders, waist, and hips
        - Hourglass: Balanced bust and hip measurements with a defined narrow waist
        - Spoon: Wider hips than bust with a clearly defined waist
        - Diamond: Broader hips than shoulders, fuller waistline
        - Oval/Apple: Fuller torso with lean limbs
        
        Format your response as a JSON object with these keys.`
      }
    ];
    
    try {
      // Use the chat model to get a response
      const response = await chatModel.invoke(messages);
      
      // Parse the JSON response
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          return this.createFallbackFitInsights(reviews);
        }
      }
      
      return this.createFallbackFitInsights(reviews);
    } catch (error) {
      console.error('Error calling GPT for fit insights:', error);
      return this.createFallbackFitInsights(reviews);
    }
  }

  /**
   * Create fallback fit insights when GPT extraction fails
   * @param {Array<string>} reviews - Product reviews
   * @returns {Object} Fallback fit insights
   */
  createFallbackFitInsights(reviews) {
    // Simple heuristic analysis of reviews
    let smallCount = 0;
    let trueCount = 0;
    let largeCount = 0;
    
    // Count mentions of common sizing phrases
    for (const review of reviews) {
      const lowerReview = review.toLowerCase();
      
      if (lowerReview.includes('runs small') || 
          lowerReview.includes('size up') || 
          lowerReview.includes('too tight') || 
          lowerReview.includes('smaller than expected')) {
        smallCount++;
      }
      
      if (lowerReview.includes('true to size') || 
          lowerReview.includes('fits as expected') || 
          lowerReview.includes('perfect fit') || 
          lowerReview.includes('accurate sizing')) {
        trueCount++;
      }
      
      if (lowerReview.includes('runs large') || 
          lowerReview.includes('size down') || 
          lowerReview.includes('too loose') || 
          lowerReview.includes('bigger than expected')) {
        largeCount++;
      }
    }
    
    // Determine fit consensus
    let fitConsensus = 'true to size';
    let sizeRecommendation = 'true to size';
    
    if (smallCount > trueCount && smallCount > largeCount) {
      fitConsensus = 'runs small';
      sizeRecommendation = 'size up';
    } else if (largeCount > trueCount && largeCount > smallCount) {
      fitConsensus = 'runs large';
      sizeRecommendation = 'size down';
    }
    
    // Calculate confidence score based on consensus strength
    const totalMentions = smallCount + trueCount + largeCount;
    const maxMentions = Math.max(smallCount, trueCount, largeCount);
    const confidenceScore = totalMentions > 0 ? maxMentions / totalMentions : 0.3;
    
    return {
      fit_consensus: fitConsensus,
      size_recommendation: sizeRecommendation,
      common_complaints: [],
      body_type_insights: {},
      confidence_score: confidenceScore
    };
  }
}

module.exports = ReviewParserAgent;
