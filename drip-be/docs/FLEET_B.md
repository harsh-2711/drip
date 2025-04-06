🎯 Fleet B: Real-Time User Interaction & Personalization Engine

Fleet B handles the conversational, personalized shopping experience, powered by LangGraph/GPT agents, embeddings, and dynamic memory. This fleet transforms user style input, preferences, and feedback into evolving wardrobe recommendations with high aesthetic and fitting accuracy.

🧱 High-Level Architecture

                      ┌─────────────────────────────┐
                      │     User Input Layer        │
                      │ (Chat, Uploads, Prompts)    │
                      └─────────────┬───────────────┘
                                    ▼
                       ┌────────────────────────┐
                       │  Agent E – Stylist AI  │
                       │  (GPT + LangGraph)     │
                       └─────────────┬──────────┘
                                     ▼
                  ┌────────────────────────────┐
                  │ Vector DB Query Engine     │◄─── Product Embeddings from Fleet A
                  │ (Pinecone/Qdrant + Filters)│
                  └─────────────┬──────────────┘
                                ▼
              ┌──────────────────────────────────────┐
              │ Agent F – Feedback & Refinement Loop │
              └─────────────┬────────────────────────┘
                            ▼
           ┌─────────────────────────────────────────────┐
           │ Agent G – Fit & Size Personalization Agent  │
           │ (MediaPipe Pose + GPT Size Translation)     │
           └─────────────────────────────────────────────┘

🧠 Tech Stack Summary

Component	Tools/Technologies
LLM Brain	GPT-4.5 via LangGraph for context-aware reasoning and natural language interaction
Memory / Personalization	LangGraph StateStore or Redis for session & persona tracking
Image Processing	MediaPipe Pose for body detection and measurement ratio extraction
Vector Search	Pinecone or Qdrant for semantic recommendation queries
Frontend (optional)	Streamlit, Next.js, or Flutter (for mobile preview)
Fit Prediction Logic	GPT-4.5 with structured prompts + review data from Fleet A
🔍 Step-by-Step Implementation Plan

✅ Step 1: User Input Capture
Goal: Collect user’s fashion intent and reference material

Inputs:
Image Uploads: Style preferences and body photo.
Prompt Input: e.g., “I need a vacation outfit”, “Avoid black, prefer linen shirts”.
Live feedback: “This is too flashy,” “Love the pants, show more like that.”
Frontend UX:
Swipe cards (like Tinder) → upvote/downvote for preference collection.
Instagram-style stories → show celebs or curated mood boards with “inspired by” prompts.
✅ Result: Initial user style + fit context captured.

✅ Step 2: Agent E – Style DNA Builder & Query Agent
Goal: Turn user inputs into a fashion persona and actionable product search.

Functionality:
Uses GPT-4.5 to:
Parse uploaded style images via CLIP embeddings
Interpret prompt (“earth tones”, “smart casual”) into style_tags
Construct a UserPersona with:
preferred_colors, fit_styles, tone_mood, avoid_tags, occasion_types
Query Vector DB:
Convert style/persona intent into an embedding.
Perform hybrid search:
Vector match → style similarity
Metadata filter → size range, category, color, etc.
LangGraph Flow:
Step 1: Get user image/prompt → parse with GPT → generate vector
Step 2: Search Pinecone → top 10 recommendations
Step 3: Return JSON of products + reasons for selection
✅ Output: First pass of recommendations matched to user taste

✅ Step 3: Agent F – Feedback & Conversational Refinement
Goal: Let user edit their wardrobe in natural language.

Features:
Natural language re-query: “I want a lighter material,” “avoid crop tops,” etc.
Highlight per-item feedback: “I like this jacket, but can I get it in black?”
Emotional cues detection: “too flashy,” “this looks outdated”
LangGraph Logic:
GPT-4.5 acts as a reasoning agent with access to memory of past picks + user persona.
Maps feedback → update persona profile + reruns query on vector DB.
Memory Handling:
Store evolving UserPersona in Redis or LangGraph stateful store (tag updates, disliked fits, preferred fabrics).
✅ Output: Continuously improving recommendation loop.

✅ Step 4: Agent G – Fit & Size Recommendation
Goal: Recommend correct size per brand, per product.

Inputs:
Optional: user body image (for MediaPipe analysis)
Parsed review-fit metadata from Fleet A
Past fit feedback (if user already tried similar brand/product)
Logic:
Use MediaPipe to extract body ratio vector: shoulder, chest, waist.
GPT-4.5 evaluates fit against product’s sizing table and review context.
GPT-4.5 Prompting:
Given: brand name, size chart, review summary, user body type/ratios.
Output: recommended_size + confidence_level + fit_notes.
Optional:
Display fitting badge: “Runs small, we recommend size L” or “Ideal for broad shoulders”.
✅ Output: Personalized size recommendation with human-like reasoning.

✅ Step 5: UI Integration (Optional for Hackathon)
Clean product card UI:
Product image
Style tags: “Earthy, minimalist”
Fit indicator: “True to size – ideal for lean/rectangle body shapes”
CTA buttons: “Save”, “Try Similar”, “Not for me”
Real-time feedback prompts:
“Why this pick?” → GPT explains
“Show me similar fits in lighter fabrics”
🧠 Memory & Personalization

Store the evolving UserPersona:

{
  "user_id": "shivai93",
  "body_shape": "rectangle",
  "skin_tone": "warm beige",
  "preferred_fits": ["relaxed", "tapered"],
  "disliked_tags": ["crop", "glossy", "tight"],
  "loved_colors": ["olive", "off-white", "terracotta"],
  "occasions": ["semi-formal", "resort", "ethnic"],
  "recent_feedback": {
    "liked": ["khadi kurta with mandarin collar"],
    "disliked": ["shiny fabric shirt"]
  }
}

Stored in:

Redis or Postgres JSONB
Updated after each interaction by Agent F