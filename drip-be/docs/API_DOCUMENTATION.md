# Drip API Documentation

This document provides detailed information about the Drip API endpoints, request/response formats, and usage examples.

## Base URL

```
http://localhost:3000/api
```

## Health Check

### GET /health

Check if the API server is running.

#### Response

```json
{
  "status": "ok",
  "timestamp": "2025-04-04T15:30:00.000Z",
  "version": "1.0.0"
}
```

## Agent E: Stylist AI

### POST /stylist/persona

Generate a user persona based on an image.

#### Request

```json
{
  "userId": "user123",
  "userImage": "base64_encoded_image_data_here"
}
```

#### Response

```json
{
  "success": true,
  "userPersona": {
    "user_id": "user123",
    "gender": "Female",
    "skin_tone": "Medium",
    "undertone": "Warm",
    "body_shape": "Hourglass",
    "best_fits": ["Bodycon Fit", "Form-Fitting", "Tailored Fit"],
    "best_colors": ["mustard yellow", "olive green", "warm browns", "burnt orange"],
    "ideal_size": {
      "tops": "M",
      "bottoms": "M"
    }
  }
}
```

### POST /stylist/recommendations

Generate product recommendations based on a user persona.

#### Request

```json
{
  "userPersona": {
    "user_id": "user123",
    "gender": "Female",
    "body_shape": "Hourglass",
    "skin_tone": "Medium",
    "undertone": "Warm",
    "best_fits": ["Bodycon Fit", "Form-Fitting", "Tailored Fit"],
    "best_colors": ["mustard yellow", "olive green", "warm browns", "burnt orange"],
    "ideal_size": {
      "tops": "M",
      "bottoms": "M"
    }
  },
  "filters": {
    "price_min": 20,
    "price_max": 200,
    "category": "tops",
    "loved_colors": ["terracotta", "beige"],
    "loved_fits": ["Regular Fit", "Relaxed Fit"],
    "dislike_tags": ["shirt:full-sleeves", "tops:crop"],
    "user_prompt": "I need something casual for a weekend brunch"
  },
  "limit": 5
}
```

#### Response

```json
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
      "product_id": "p123",
      "title": "Linen Relaxed Shirt",
      "brand": "EarthTones",
      "price": 89.99,
      "currency": "USD",
      "image_url": "https://example.com/shirt.jpg",
      "match_score": 0.92,
      "match_reasons": [
        "Color matches your preferred palette",
        "Relaxed fit aligns with your preferences",
        "Perfect for beach vacations"
      ]
    },
    // More products...
  ]
}
```

## Agent F: Feedback & Refinement

### POST /feedback/refine

Process user feedback and extract dislike tags.

#### Request

```json
{
  "userId": "user123",
  "feedback": "I like the linen shirt but would prefer something with shorter sleeves. Also, the pants are too formal for a beach vacation.",
  "productId": "p123"
}
```

#### Response

```json
{
  "success": true,
  "dislikeTags": ["shirt:full-sleeves", "pants:formal"]
}
```


## Agent G: Fit & Size Personalization

### POST /fit/size-recommendation

Generate a size recommendation for a product.

#### Request

```json
{
  "productId": "p789",
  "userMeasurements": {
    "height": 165,
    "weight": 60,
    "bust": 92,
    "waist": 74,
    "hips": 98,
    "shoulder": 38
  },
  "userPreferences": {
    "preferredFit": "relaxed"
  }
}
```

#### Response

```json
{
  "success": true,
  "sizeRecommendation": {
    "recommendedSize": "M",
    "confidenceScore": 0.85,
    "alternativeSizes": ["S", "L"],
    "fitNotes": "This brand tends to run slightly small. The medium should provide the relaxed fit you prefer.",
    "specificAreas": {
      "shoulders": "Good fit",
      "bust": "Comfortable with room",
      "waist": "Relaxed as preferred",
      "hips": "Comfortable fit"
    }
  }
}
```


### POST /fit/advice

Generate fit advice for a product based on user persona.

#### Request

```json
{
  "productId": "p789",
  "userPersona": {
    "gender": "Female",
    "body_shape": "Hourglass",
    "ideal_size": {
      "tops": "M",
      "bottoms": "M"
    }
  }
}
```

#### Response

```json
{
  "success": true,
  "recommendedSize": "M",
  "fittingAdvice": "This shirt will provide a comfortable, slightly relaxed fit in size M. The cut complements your hourglass shape by defining your waist while providing room in the bust and hips."
}
```

### GET /fit/size-chart/:productId

Get the size chart for a product.

#### Response

```json
{
  "success": true,
  "sizeChart": {
    "brand": "BeachVibes",
    "productType": "Shirts",
    "units": "cm",
    "sizes": ["XS", "S", "M", "L", "XL"],
    "measurements": {
      "chest": [86, 92, 98, 104, 110],
      "waist": [70, 76, 82, 88, 94],
      "hips": [90, 96, 102, 108, 114],
      "shoulder": [36, 38, 40, 42, 44],
      "length": [65, 67, 69, 71, 73]
    },
    "fitType": "Regular fit",
    "notes": "This brand tends to run slightly small. If you're between sizes, we recommend sizing up."
  }
}
```

## Agent H: Visual Generation

### POST /visual/outfit

Generate a virtual try-on visualization using the user's image and product image.

#### Request

```json
{
  "userImage": "base64_encoded_image_data_here",
  "productId": "p789"
}
```

#### Response

```json
{
  "success": true,
  "image": "base64_encoded_image_data_here"
}
```

### POST /visual/styling-tips

Generate styling tips for products.

#### Request

```json
{
  "products": [
    {
      "product_id": "p789",
      "title": "Short-sleeve Linen Shirt",
      "brand": "BeachVibes",
      "style_type": "shirt",
      "primary_color": "terracotta",
      "fabric": "linen"
    },
    {
      "product_id": "p101",
      "title": "Relaxed Linen Shorts",
      "brand": "SummerEssentials",
      "style_type": "shorts",
      "primary_color": "off-white",
      "fabric": "linen"
    }
  ],
  "userPersona": {
    "body_shape": "hourglass",
    "skin_tone": "warm beige",
    "loved_colors": ["olive", "off-white", "terracotta"],
    "preferred_fits": ["relaxed", "flowy"],
    "disliked_tags": ["crop", "tight", "formal"]
  }
}
```

#### Response

```json
{
  "success": true,
  "stylingTips": {
    "outfitName": "Terracotta Breeze Beach Ensemble",
    "primaryStylingTip": "Create a relaxed beach-ready look by leaving the shirt unbuttoned over a simple white tank top, and cuff the shorts once for a casual finish.",
    "stylingTips": [
      {
        "title": "Layering Options",
        "description": "For cooler evenings, layer with a light cream cardigan or a denim jacket for versatility."
      },
      {
        "title": "Tucking Technique",
        "description": "Try a casual front-tuck of the shirt to define your waist while maintaining the relaxed aesthetic."
      },
      {
        "title": "Footwear Pairing",
        "description": "Complete the look with leather sandals or espadrilles for an effortless beach-to-town transition."
      }
    ],
    "occasions": ["Beach day", "Casual lunch", "Resort dining", "Sightseeing"],
    "accessorySuggestions": [
      "Wide-brim straw hat",
      "Woven tote bag",
      "Delicate gold layered necklaces",
      "Tortoiseshell sunglasses"
    ],
    "careInstructions": [
      "Hand wash linen in cold water to preserve the natural texture",
      "Air dry to prevent shrinkage and maintain the relaxed fit",
      "Iron on low heat while slightly damp for best results"
    ]
  }
}
```

### POST /visual/mood-board

Generate a mood board for a style concept.

#### Request

```json
{
  "styleDescription": "Bohemian beach resort style with natural textures and earth tones",
  "userPersona": {
    "body_shape": "hourglass",
    "skin_tone": "warm beige",
    "loved_colors": ["olive", "off-white", "terracotta"]
  },
  "numImages": 4
}
```

#### Response

```json
{
  "success": true,
  "moodBoard": {
    "title": "Sun-Kissed Bohemian Resort",
    "description": "A relaxed, earth-toned collection inspired by natural textures and bohemian silhouettes, perfect for beach resorts and warm-weather getaways. The palette features terracotta, olive, and off-white tones that complement warm beige skin tones and create a harmonious connection with nature.",
    "imagePrompts": [
      "A flowing terracotta linen maxi dress with subtle embroidery details, photographed on a beach at golden hour",
      "An outfit featuring olive wide-leg pants paired with an off-white crochet top, accessorized with natural rattan jewelry",
      "A resort setting with a collection of earth-toned garments hanging on a bamboo rack, including flowing fabrics and natural textures",
      "A flat lay of beach accessories including a straw hat, woven sandals, shell jewelry, and a natural fiber bag against a sand background"
    ],
    "colorPalette": ["Terracotta #CD5F43", "Olive #708238", "Off-white #F5F5DC", "Sand #C2B280", "Warm Brown #8B4513"],
    "keyElements": [
      "Natural, breathable fabrics (linen, cotton, jute)",
      "Relaxed, flowing silhouettes",
      "Artisanal details (embroidery, macramé, crochet)",
      "Earth tone color palette",
      "Nature-inspired accessories"
    ],
    "images": [
      "https://example.com/mood-board-image-1",
      "https://example.com/mood-board-image-2",
      "https://example.com/mood-board-image-3",
      "https://example.com/mood-board-image-4"
    ]
  }
}
```

### POST /visual/outfit-description

Generate a description of how an outfit would look on the user.

#### Request

```json
{
  "products": [
    {
      "product_id": "p789",
      "title": "Short-sleeve Linen Shirt",
      "brand": "BeachVibes",
      "style_type": "shirt",
      "primary_color": "terracotta",
      "fabric": "linen",
      "fit_type": "relaxed"
    },
    {
      "product_id": "p101",
      "title": "Relaxed Linen Shorts",
      "brand": "SummerEssentials",
      "style_type": "shorts",
      "primary_color": "off-white",
      "fabric": "linen",
      "fit_type": "relaxed"
    }
  ],
  "userPersona": {
    "body_shape": "hourglass",
    "skin_tone": "warm beige",
    "loved_colors": ["olive", "off-white", "terracotta"]
  }
}
```

#### Response

```json
{
  "success": true,
  "description": {
    "overallImpression": "This outfit creates a harmonious, relaxed beach look that beautifully complements your hourglass figure while maintaining comfort and ease of movement.",
    "colorAnalysis": "The terracotta shirt brings a warm glow to your complexion, enhancing your warm beige skin tone and creating a sun-kissed effect. The off-white shorts provide a clean contrast that brightens the overall look without washing out your coloring.",
    "fitAnalysis": "The relaxed fit of both pieces works wonderfully with your hourglass shape. The shirt skims over your bust without adding bulk, while the shorts define your waist and flow smoothly over your hips, maintaining the natural balance of your proportions.",
    "silhouetteDescription": "The outfit creates a balanced silhouette that honors your hourglass figure. The slightly structured shoulders of the shirt maintain proportion with your hips, while the defined waistline of the shorts highlights the narrowest part of your torso.",
    "enhancedFeatures": [
      "Defined waistline",
      "Balanced proportions",
      "Harmonious coloring with skin tone",
      "Natural shoulder line"
    ],
    "stylingRecommendations": [
      "A casual front-tuck of the shirt would further emphasize your waist",
      "Adding a thin leather belt to the shorts would enhance the hourglass effect",
      "Gold-toned jewelry would complement both the outfit colors and your warm skin tone",
      "Leather sandals in a natural tan would complete the earth-toned palette"
    ]
  }
}
```

## Error Responses

### Validation Error

```json
{
  "error": true,
  "message": "Validation error",
  "errors": [
    {
      "param": "prompt",
      "msg": "Prompt is required",
      "location": "body"
    }
  ]
}
```

### Server Error

```json
{
  "error": true,
  "message": "Error generating recommendations",
  "errors": [
    {
      "msg": "Database connection error"
    }
  ]
}
```

## Authentication (Future Implementation)

Authentication will be implemented in a future update using JWT tokens.

### Headers

```
Authorization: Bearer <token>
