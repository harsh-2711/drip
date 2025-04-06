# Problem title
Drip: Hyper-personalized Fashion

# Problem overview*
Online shoppers frequently struggle with uncertainty about clothing fit, style compatibility, and quality, causing returns and dissatisfaction. Traditional online shopping platforms fail to personalize product discovery effectively—particularly for localized markets like India, where skin tones, body shapes, and style preferences vary dramatically. Solving this will boost consumer confidence, elevate local brands, and drastically reduce returns.

# Proposed AI approach
## 1. Skin Color Detection:
OpenAI's GPT-4.5 along with Monk Skin Tone Scale

## 2. AI Agent Fleet Architecture (powered by GPT-4.5):
### Fleet A: Data Preparation Agents
- Agent A (Discovery): Uses GPT-4.5-driven web-crawling agents (powered by tools like LangChain + Playwright) to fetch trendy, premium clothing brands and products from selected verified Indian and international luxury websites.
- Agent B (Parsing & Cleaning): Intelligently parse raw HTML product data (images, prices, descriptions, sizing guides) into structured formats.
- Agent C (Quality Filtering): Filters items strictly by predefined luxury and aesthetic standards (trained by current trends on clothing aesthetics).

### Data Storage Layer:
Structured embedding of products into a vector database for fast semantic search and retrieval based on user prompts.

### Fleet B: User Interaction & Recommendation Agents
- Agent E (Real-Time Recommendation Engine): Dynamically matching user preferences (styles, colors, fits) against vector database entries.

- Agent F (Conversational Refinement): Interact conversationally, refining results continuously based on real-time user feedback ("show linen pants instead," "avoid skinny jeans").

### Aspirational component:
- Agent D (Review Parsing & Size Estimation): Uses GPT-4.5-powered review analysis to simulate crowd-sourced sizing suggestions, normalizing fit accuracy across different brands.

- Agent G (Dynamic Size Suggestions): GPT-4.5 accurately predicts personalized size recommendations using user's body analysis and previously parsed sizing information from reviews.

- Agent H (Visual Generation): GPT-4.5 (with OpenAI Image Generation) to visualize alternative clothing combinations and styling suggestions dynamically.

## Why this approach?
- Modular & Scalable: AI agents ensure clean, maintainable, and scalable separation of concerns.

- Fast Prototyping: Using GPT-4.5 and agent frameworks (LangGraph/LangChain) allows rapid building and iteration within hackathon timelines.

- High Accuracy: GPT-4.5 outperforms traditional ML models in nuanced tasks such as review parsing, complex conversational interactions, and size estimations.

# Success metrics
- Fit accuracy: User-reported satisfaction with recommended size and fit (target: 90%+ satisfaction).

- Engagement: Percentage of recommendations positively engaged with (liked, swiped right, or purchased).

- Return-rate reduction: Aiming for 30-50% reduction compared to industry-standard returns.

- User Retention: Number of users consistently returning for recommendations (weekly/monthly active users).

- Seller Impact: Number of niche/local brands discovered by users and increase in their sales volume post-integration.

# Scope & boundaries
## Assumptions:
1. Users will upload clear, well-lit photos suitable for AI analysis.
2. The app starts with a limited, curated database of premium Indian and international luxury products for demo purposes.
3. Size suggestions initially rely on approximations from simulated review analysis, not real-time parsing (due to demo constraints).

## Out-of-Scope (Hackathon Timeline Constraints):
1. Real-time scraping of live retailer reviews at scale.
2. End-to-end Virtual AR try-on integration (considered aspirational for now).
3. Direct, fully-integrated payment and shipping functionalities.
4. Full production-scale database with thousands of products (only a curated set demoed initially).