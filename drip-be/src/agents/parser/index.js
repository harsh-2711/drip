const fs = require('fs');
const path = require('path');
const { chatModel } = require('../../utils/openai');
const config = require('../../config');

/**
 * Agent C: Parsing & Metadata Enhancement
 * Cleans, normalizes, and enriches product data using GPT
 */
class ParserAgent {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../data/enriched_products');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Few-shot examples for GPT prompt with expanded examples
    this.fewShotExamples = [
      {
        description: "Classic blue denim jeans with a slim fit and slight stretch for comfort. Five-pocket styling with button closure and zip fly.",
        enriched: {
          style_type: "Casual",
          aesthetic: "Minimalist",
          primary_color: "blue",
          fabric: "Denim",
          cut: "Slim Fit",
          gender: "unisex",
          fit_type: "Slim Fit",
          occasion: ["Everyday Wear", "Casual"],
          category: "bottoms"
        }
      },
      {
        description: "Elegant floral print maxi dress with a V-neckline and flutter sleeves. Perfect for summer weddings or garden parties.",
        enriched: {
          style_type: "Semi-Formal",
          aesthetic: "Romantic",
          primary_color: "floral",
          fabric: "Chiffon",
          cut: "Maxi Length",
          gender: "women",
          fit_type: "Flowy Fit",
          occasion: ["Wedding Guest", "Garden Party", "Cocktail Party"],
          category: "one-piece"
        }
      },
      {
        description: "Traditional hand-embroidered kurta with intricate threadwork. Features a mandarin collar and side slits for ease of movement.",
        enriched: {
          style_type: "Traditional / Ethnic Wear",
          aesthetic: "Ethnic (Traditional Inspired)",
          primary_color: "white",
          fabric: "Cotton",
          cut: "Straight",
          gender: "men",
          fit_type: "Regular Fit",
          occasion: ["Festival", "Traditional Ceremony", "Cultural Event"],
          category: "tops"
        }
      },
      {
        description: "Oversized cotton t-shirt with graphic print on the front. Ribbed crew neck and short sleeves with a relaxed fit.",
        enriched: {
          style_type: "Casual",
          aesthetic: "Streetwear",
          primary_color: "black",
          fabric: "Cotton",
          cut: "Crew Neck",
          gender: "unisex",
          fit_type: "Oversized Fit",
          occasion: ["Everyday Wear", "Casual"],
          category: "tops"
        }
      },
      {
        description: "High-waisted tailored trousers with front pleats and wide legs. Features belt loops, side pockets, and a concealed zip fastening.",
        enriched: {
          style_type: "Business Casual",
          aesthetic: "Minimalist",
          primary_color: "navy",
          fabric: "Polyester Blend",
          cut: "Wide Leg",
          gender: "women",
          fit_type: "Relaxed Fit",
          occasion: ["Office Wear", "Business Casual"],
          category: "bottoms"
        }
      }
    ];
  }


  /**
   * Parse and enrich a single product
   * @param {Object} product - Product information
   * @returns {Promise<Object>} Enriched product
   */
  async parseProduct(product) {
    // Create a copy of the product to avoid modifying the original
    const enrichedProduct = { ...product };
    
    try {
      // Extract metadata using GPT
      const metadata = await this.extractMetadataWithGPT(product);
      
      // Filter out products with missing primary color
      if (!metadata.primary_color || metadata.primary_color === 'not specified') {
        console.log(`Skipping product ${product.product_id || 'unknown'}: Missing primary color`);
        return null;
      }
      
      // Merge the extracted metadata with the product
      Object.assign(enrichedProduct, metadata);
      
      // Add a timestamp for when the product was enriched
      enrichedProduct.enriched_at = new Date().toISOString();
      
      // Remove skin_tone_match field as it's no longer needed
      if (enrichedProduct.skin_tone_match) {
        delete enrichedProduct.skin_tone_match;
      }
      
      // Remove sku field as per requirements
      if (enrichedProduct.sku) {
        delete enrichedProduct.sku;
      }
      
      // Remove pinecone_id field as per requirements
      if (enrichedProduct.pinecone_id) {
        delete enrichedProduct.pinecone_id;
      }
      
      return enrichedProduct;
    } catch (error) {
      console.error(`Error enriching product ${product.product_id}:`, error);
      return null;
    }
  }

  /**
   * Extract metadata from product using GPT
   * @param {Object} product - Product information
   * @returns {Promise<Object>} Extracted metadata
   */
  async extractMetadataWithGPT(product) {
    // Prepare the product information for the prompt
    const productInfo = {
      title: product.title || '',
      description: product.description || '',
      brand: product.brand || '',
      tags: product.tags || [],
      price: product.price || 0,
      currency: product.currency || '',
    };
    
    // Create few-shot examples string
    const fewShotExamplesString = this.fewShotExamples.map(example => 
      `EXAMPLE DESCRIPTION: ${example.description}\nEXAMPLE ENRICHED DATA: ${JSON.stringify(example.enriched, null, 2)}`
    ).join('\n\n');
    
    // Create messages for chat completion
    const messages = [
      {
        role: "system",
        content: `You are a fashion metadata expert who analyzes product information and extracts structured metadata. 
        Your task is to enrich product data by inferring style type, aesthetic, colors, fabric, fit, gender, and suitable occasions.
        Always respond with valid JSON containing only the enriched metadata fields, nothing else.
        You must strictly use values from the provided lists for each field.`
      },
      {
        role: "user",
        content: `I need you to analyze this fashion product and extract detailed metadata.
        
        Here are a few examples of how to extract metadata from product descriptions:
        
        ${fewShotExamplesString}
        
        Now, please analyze this product and extract the metadata:
        
        PRODUCT TITLE: ${productInfo.title}
        PRODUCT DESCRIPTION: ${productInfo.description}
        BRAND: ${productInfo.brand}
        TAGS: ${productInfo.tags.join(', ')}
        PRICE: ${productInfo.price} ${productInfo.currency}
        
        Extract the following metadata using ONLY values from these lists:
        
        1. style_type (choose one): Casual, Smart Casual, Business Casual, Business Professional, Formal, Semi-Formal, Black Tie, White Tie, Cocktail, Partywear, Clubwear, Athleisure, Activewear, Sportswear, Loungewear, Sleepwear, Streetwear, Workwear, Outerwear, Beachwear, Swimwear, Resort Wear, Traditional / Ethnic Wear, Fusion Wear, Maternity Wear, Unisex
        
        2. aesthetic (choose one): Bohemian (Boho), Vintage, Retro, Gothic, Punk, Grunge, Preppy, Hipster, Chic, Artsy, Minimalist, Maximalist, Avant-Garde, Eclectic, Androgynous, Feminine, Masculine, Modest, Urban (Street), Hip-Hop, Skate, Surf, Western (Cowboy), Classic, Elegant, Luxury, Glamorous, Sexy, Kitsch, Camp, Sporty, Futuristic, Cyberpunk, Steampunk, Techwear, Gorpcore, Normcore, Cottagecore, Dark Academia, Light Academia, Emo, Geek Chic, Ethnic (Traditional Inspired), Folkloric, Tribal Prints, African-Inspired, Victorian, Art Deco (1920s), Dandy, Military, Utility, Industrial, Biker (Motorcycle), Y2K (2000s), 90s (1990s Retro), 80s (1980s Retro), 70s (1970s Retro), 60s (Mod Era), 50s (Pin-up/Rockabilly), Harajuku, Kawaii, Lolita, E-girl / E-boy, K-Pop, Bollywood, Scandinavian Minimalist, French Chic, Italian Classic, Beachy, Tropical, Safari, Nautical, Eco-Friendly (Sustainable)
        
        3. primary_color (specify the main color): Must be a specific color name, not "not specified" or "various"
        
        4. fabric (choose one): Cotton, Organic Cotton, Linen, Hemp, Jute, Wool, Merino Wool, Cashmere, Mohair, Silk, Satin, Denim, Leather, Faux Leather (Vegan Leather), Suede, Fur, Faux Fur, Down (Feather), Velvet, Velour, Corduroy, Tweed, Flannel, Fleece, Jersey, Knit, Lace, Crochet, Chiffon, Organza, Tulle, Mesh, Canvas, Chambray, Rayon (Viscose), Modal, Lyocell (Tencel), Bamboo Fiber, Polyester, Recycled Polyester, Nylon, Acrylic, Spandex (Elastane), Neoprene, Gore-Tex, Polyurethane, PVC (Vinyl), Latex, Sequined Fabric, Beaded Fabric, Brocade, Ikat, Batik, Tie-Dye, Handwoven, Hand-knit, Lurex (Metallic), Silk Blend, Wool Blend, Poly-Cotton Blend
        
        5. cut (choose one): A-Line, Sheath, Shift, Fit-and-Flare, Empire Waist, Drop Waist, Mermaid Silhouette, Trumpet Silhouette, Ballgown, Peplum, Wrap Style, Asymmetrical Design, High-Low Hem, Tiered Skirt, Pleated, Draped, Ruched, Cut-Out Details, High Slit, Train, Off-Shoulder, One-Shoulder, Halter Neck, Strapless, Spaghetti Straps, Sweetheart Neckline, V-Neck, Plunging Neckline, Crew Neck, Scoop Neck, Square Neck, Boat Neck, Collared, Turtleneck, Cowl Neck, Keyhole Neckline, Backless, Long Sleeves, Three-Quarter Sleeves, Short Sleeves, Sleeveless, Cap Sleeves, Bell Sleeves, Puff Sleeves, Bishop Sleeves, Balloon Sleeves, Kimono Sleeves, Raglan Sleeves, Dolman Sleeves, Cold-Shoulder Sleeves, Flutter Sleeves, High-Rise Waist, Mid-Rise Waist, Low-Rise Waist, Paperbag Waist, Elastic Waist, Drawstring Waist, Skinny Leg, Tapered Leg, Straight Leg, Wide Leg, Bootcut, Flared Leg, Palazzo Pants, Harem Pants, Cuffed Hem, Jogger Style, Cropped Length, Capri Length, Ankle Length, Knee Length, Tea Length, Floor Length, Mini Length, Midi Length, Maxi Length, Longline, Double-Breasted, Single-Breasted, Hooded, Button-Down Front
        
        6. gender (choose one): men, women, unisex
        
        7. fit_type (choose one): Slim Fit, Regular Fit, Relaxed Fit, Loose Fit, Oversized Fit, Tailored Fit, Boxy Fit, Compression Fit, Skinny Fit, Baggy Fit, Bodycon Fit, Form-Fitting, Draped Fit, Flowy Fit, Athletic Fit, Curvy Fit, Plus Size Fit, Petite Fit, Tall Fit, Maternity Fit, Unisex Fit
        
        8. occasion (list 1-3): Everyday Wear, Office Wear, Job Interview, Formal Event, Black Tie Event, White Tie Event, Cocktail Party, Wedding (Guest), Bridal Wear, Bridesmaid, Party / Celebration, Holiday Party, Night Out (Clubbing), Date Night, Dinner Party, Prom, Graduation, Music Festival, Beach Day, Resort Vacation, Pool Party, Beach Wedding, Gym / Workout, Running / Jogging, Yoga Session, Hiking / Camping, Travel, Lounge at Home, Sleep / Nightwear, Funeral / Memorial, Rainy Weather, Winter (Cold Weather), Autumn / Fall, Spring, Summer (Hot Weather)
        
        9. category (choose one): tops, bottoms, one-piece
        
        Format your response as a JSON object with these keys. Make educated guesses for any missing information based on the available data, but always use values from the provided lists.`
      }
    ];
    
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
        return this.createFallbackMetadata(product);
      }
    }
    
    return this.createFallbackMetadata(product);
  }

  /**
   * Create fallback metadata when GPT extraction fails
   * @param {Object} product - Product information
   * @returns {Object} Fallback metadata
   */
  createFallbackMetadata(product) {
    // Extract basic information from product tags or title
    const tags = product.tags || [];
    const title = product.title || '';
    const lowerTitle = title.toLowerCase();
    
    // Determine style_type
    let style_type = 'Casual';
    if (tags.some(tag => tag.toLowerCase().includes('formal') || tag.toLowerCase().includes('party'))) {
      style_type = 'Semi-Formal';
    } else if (tags.some(tag => tag.toLowerCase().includes('ethnic') || tag.toLowerCase().includes('traditional'))) {
      style_type = 'Traditional / Ethnic Wear';
    }
    
    // Determine gender
    let gender = 'unisex';
    if (tags.some(tag => tag.toLowerCase().includes('women') || tag.toLowerCase().includes('ladies'))) {
      gender = 'women';
    } else if (tags.some(tag => tag.toLowerCase().includes('men'))) {
      gender = 'men';
    }
    
    // Determine primary_color (very basic)
    const commonColors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray'];
    let primary_color = null;
    for (const color of commonColors) {
      if (lowerTitle.includes(color)) {
        primary_color = color;
        break;
      }
    }
    
    // If no color found, return null to filter out this product
    if (!primary_color) {
      return null;
    }
    
    // Determine category
    let category = 'tops';
    const bottomsKeywords = ['pants', 'jeans', 'shorts', 'skirt', 'trousers', 'leggings'];
    const onePieceKeywords = ['dress', 'jumpsuit', 'romper', 'gown', 'saree', 'kurta set'];
    
    if (bottomsKeywords.some(keyword => lowerTitle.includes(keyword) || tags.some(tag => tag.toLowerCase().includes(keyword)))) {
      category = 'bottoms';
    } else if (onePieceKeywords.some(keyword => lowerTitle.includes(keyword) || tags.some(tag => tag.toLowerCase().includes(keyword)))) {
      category = 'one-piece';
    }
    
    return {
      style_type,
      aesthetic: 'Minimalist',
      primary_color,
      fabric: 'Cotton',
      cut: 'Regular Fit',
      gender,
      fit_type: 'Regular Fit',
      occasion: ['Everyday Wear'],
      category
    };
  }

  /**
   * Validate the enriched product data
   * @param {Object} enrichedProduct - Enriched product data
   * @returns {boolean} Whether the data is valid
   */
  validateEnrichedProduct(enrichedProduct) {
    // Check if required fields are present
    const requiredFields = [
      'style_type',
      'aesthetic',
      'primary_color',
      'fabric',
      'cut',
      'gender',
      'fit_type',
      'occasion',
      'category'
    ];
    
    for (const field of requiredFields) {
      if (!enrichedProduct[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }
    
    // Check if arrays are actually arrays
    const arrayFields = ['occasion'];
    for (const field of arrayFields) {
      if (!Array.isArray(enrichedProduct[field])) {
        console.error(`Field ${field} should be an array`);
        return false;
      }
    }
    
    return true;
  }
  /**
   * Start the parsing process for all products
   * @param {Array} products - List of scraped products from Agent B
   * @returns {Promise<Array>} Enriched products
   */
  async parseProducts(products) {
    console.log('Starting product parsing and enrichment process...');
    
    const enrichedProducts = [];
    
    for (const product of products) {
      console.log(`Parsing and enriching product: ${product.title || 'Untitled Product'}`);
      
      try {
        const enrichedProduct = await this.parseProduct(product);
        
        // Skip products that failed enrichment or have missing primary color
        if (!enrichedProduct) {
          console.log(`Skipping product: ${product.title || 'Untitled Product'} - Failed enrichment or missing primary color`);
          continue;
        }
        
        enrichedProducts.push(enrichedProduct);
        
        // Save enriched product to a JSON file
        const outputPath = path.join(this.outputDir, `${enrichedProduct.product_id}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(enrichedProduct, null, 2));
        
        console.log(`Enriched product: ${enrichedProduct.title || 'Untitled Product'}`);
      } catch (error) {
        console.error(`Error parsing product ${product.product_id}:`, error);
      }
    }
    
    // Save all enriched products to a single JSON file
    const allOutputPath = path.join(this.outputDir, '../enriched_products.json');
    fs.writeFileSync(allOutputPath, JSON.stringify(enrichedProducts, null, 2));
    
    console.log(`Parsing complete. Enriched ${enrichedProducts.length} products.`);
    return enrichedProducts;
  }
}

module.exports = ParserAgent;
