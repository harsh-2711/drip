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
  "imageBase64": "base64_encoded_image_data_here"
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
    },
    "preferred_colors": [
        "teal",
        "dusty rose",
        "soft brown"
    ],
    "preferred_fits": [
        "Regular Fit",
        "Tailored Fit",
        "Flowy Fit"
    ],
    "disliked_tags": [],
    "loved_tags": [],
    "occasions": [],
    "style_keywords": [],
    "recent_feedback": {
        "liked": [],
        "disliked": []
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
        "body_shape": "Rectangle",
        "skin_tone": "Medium",
        "undertone": "Neutral",
        "best_fits": [
            "Regular Fit",
            "Tailored Fit",
            "Flowy Fit"
        ],
        "best_colors": [
            "teal",
            "dusty rose",
            "soft brown"
        ],
        "ideal_size": {
            "tops": "M",
            "bottoms": "M"
        },
        "preferred_colors": [
            "teal",
            "dusty rose",
            "soft brown"
        ],
        "preferred_fits": [
            "Regular Fit",
            "Tailored Fit",
            "Flowy Fit"
        ],
        "disliked_tags": [],
        "loved_tags": [],
        "occasions": [],
        "style_keywords": [],
        "recent_feedback": {
            "liked": [],
            "disliked": []
        }
    },
    "category": "tops",
    "dislike_tags": [
        "floral",
        "cami:very deep v-neck"
    ],
    "price_min": 20,
    "price_max": 200,
    "loved_colors": ["terracotta", "beige"],
    "loved_fits": ["Regular Fit", "Relaxed Fit"],
    "dislike_tags": ["shirt:full-sleeves", "tops:crop"],
    "user_prompt": "I need something casual for a weekend brunch",
    "limit": 10
}
```

#### Response

```json
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
        "id": 101,
        "product_id": "shopify-7758730166445",
        "title": "Patricia Maxi Dress - Navy Turquoise Border",
        "description": "Dresses category:Clothing collection:Clothes & Accessories collection:Easter Outfits collection:Summer Shop features:Bump Friendly features:Pockets features:Sleeveless format:Dresses & Jumpsuits group:Dresses item_status:new subgroup:Maxi Dresses swatch:Navy Turquoise Border YCRF_apparel YGroup_patricia_maxi_dress patricia maxi dress navy turquoise border",
        "price": 69,
        "currency": "USD",
        "available_sizes": [],
        "tags": [
            "category:Clothing",
            "collection:Clothes & Accessories",
            "collection:Easter Outfits",
            "collection:Summer Shop",
            "features:Bump Friendly",
            "features:Pockets",
            "features:Sleeveless",
            "format:Dresses & Jumpsuits",
            "group:Dresses",
            "item_status:new",
            "subgroup:Maxi Dresses",
            "swatch:Navy Turquoise Border",
            "YCRF_apparel",
            "YGroup_patricia_maxi_dress"
        ],
        "product_url": null,
        "image_urls": [
            "https://cdn.shopify.com/s/files/1/0409/9656/9251/files/IMG_5633.webp?v=1721916972",
            "https://cdn.shopify.com/s/files/1/0409/9656/9251/files/IMG_5579.webp?v=1721916980",
            "https://cdn.shopify.com/s/files/1/0409/9656/9251/files/IMG_5689.webp?v=1721916983"
        ],
        "style_type": "Resort Wear",
        "aesthetic": "Bohemian (Boho)",
        "primary_color": "navy",
        "fabric": "Cotton",
        "cut": "Maxi Length",
        "gender": "women",
        "fit_type": "Maternity Fit",
        "occasion": [
            "Summer (Hot Weather)",
            "Resort Vacation",
            "Everyday Wear"
        ],
        "pinecone_id": "shopify-7758730166445",
        "created_at": "2025-04-05T10:01:01.324Z",
        "updated_at": "2025-04-05T10:01:07.448Z",
        "createdAt": "2025-04-05T10:01:01.324Z",
        "updatedAt": "2025-04-05T10:01:07.448Z",
        "BrandId": 8,
        "Brand": {
            "id": 8,
            "name": "Natural Life",
            "url": "https://www.naturallife.com/collections/clothing",
            "country": "",
            "style_tags": [],
            "homepage_type": null,
            "rating_estimate": null,
            "created_at": "2025-04-05T10:01:00.930Z",
            "updated_at": "2025-04-05T10:01:00.930Z",
            "createdAt": "2025-04-05T10:01:00.930Z",
            "updatedAt": "2025-04-05T10:01:00.930Z"
        },
        "FitInsight": {
            "id": 101,
            "fit_consensus": "runs large",
            "size_recommendation": "size down",
            "common_complaints": [
                "thin material",
                "tight in waist",
                "loose in length"
            ],
            "body_type_insights": {
                "Hourglass": "consider sizing down",
                "Pear/Triangle": "size down"
            },
            "confidence_score": 0.75,
            "created_at": "2025-04-05T10:01:01.326Z",
            "updated_at": "2025-04-05T10:01:01.326Z",
            "createdAt": "2025-04-05T10:01:01.326Z",
            "updatedAt": "2025-04-05T10:01:01.326Z",
            "ProductId": 101
        },
        "similarity_score": 0.9947971,
        "recommendation_reason": "The Patricia Maxi Dress in navy cotton offers a flowy fit that complements a rectangle body shape, while the navy and turquoise border beautifully enhances medium skin tones, aligning with your preference for similar hues like teal. Its resort wear style provides a comfortable yet chic option for maternity fashion, ideal for embracing both style and ease."
    }
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
  "dislike_tags": ["shirt:full-sleeves", "pants:formal"]
}
```


## Agent G: Fit & Size Personalization

### POST /fit/size-recommendation

Generate a size recommendation for a product.

#### Request

```json
{
  "productId": "shopify-4520939126902",
  "userMeasurements": {
    "tops": "M",
    "bottoms": "M"
  },
  "userPreferences": {
    "fit": "relaxed",
    "length": "standard"
  }
}
```

#### Response

```json
{
  "success": true,
  "sizeRecommendation": {
    "recommended_size": "M",
    "confidence_level": "high",
    "alternative_size": "L",
    "fit_notes": "This brand tends to run slightly small. The medium should provide the relaxed fit you prefer.",
    "sizing_advice": "This product tends to run small, so it is advisable to size up, especially if you prefer a more relaxed fit or have broader shoulders."
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
        "user_id": "user123",
        "gender": "Female",
        "body_shape": "Rectangle",
        "skin_tone": "Medium",
        "undertone": "Neutral",
        "best_fits": [
            "Regular Fit",
            "Tailored Fit",
            "Flowy Fit"
        ],
        "best_colors": [
            "teal",
            "dusty rose",
            "soft brown"
        ],
        "ideal_size": {
            "tops": "M",
            "bottoms": "M"
        },
        "preferred_colors": [
            "teal",
            "dusty rose",
            "soft brown"
        ],
        "preferred_fits": [
            "Regular Fit",
            "Tailored Fit",
            "Flowy Fit"
        ],
        "disliked_tags": [],
        "loved_tags": [],
        "occasions": [],
        "style_keywords": [],
        "recent_feedback": {
            "liked": [],
            "disliked": []
        }
    }
}
```

#### Response

```json
{
  "success": true,
  "recommended_size": "M",
  "fitting_advice": "This shirt will provide a comfortable, slightly relaxed fit in size M. The cut complements your hourglass shape by defining your waist while providing room in the bust and hips."
}
```

## Agent H: Visual Generation

### POST /visual/outfit

Generate a virtual try-on visualization using the user's image and product image.

#### Request

```json
{
  "userImageBase64": "base64_encoded_image_data_here",
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
      "product_id": "prod123",
      "title": "Dark Olive Linen Shirt",
      "brand": "FabIndia",
      "style_type": "shirt",
      "primary_color": "dark olive",
      "fabric": "linen",
      "fit_type": "relaxed"
    },
  ],
        "userPersona": {
        "user_id": "user123",
        "gender": "Female",
        "body_shape": "Rectangle",
        "skin_tone": "Medium",
        "undertone": "Neutral",
        "best_fits": [
            "Regular Fit",
            "Tailored Fit",
            "Flowy Fit"
        ],
        "best_colors": [
            "teal",
            "dusty rose",
            "soft brown"
        ],
        "ideal_size": {
            "tops": "M",
            "bottoms": "M"
        },
        "preferred_colors": [
            "teal",
            "dusty rose",
            "soft brown"
        ],
        "preferred_fits": [
            "Regular Fit",
            "Tailored Fit",
            "Flowy Fit"
        ],
        "disliked_tags": [],
        "loved_tags": [],
        "occasions": [],
        "style_keywords": [],
        "recent_feedback": {
            "liked": [],
            "disliked": []
        }
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
