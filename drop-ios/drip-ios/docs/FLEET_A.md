🧩 Fleet A: Data Ingestion & Curation Architecture

Fleet A is responsible for discovering, scraping, parsing, cleaning, and structuring fashion product data into an intelligent fashion product database, which is later queried by Fleet B (user-facing AI). The final output of Fleet A is a semantically rich, searchable, and up-to-date vector database of products, enhanced with labels like category, fit, color, aesthetic, brand trustworthiness, and size accuracy.

🧱 High-Level Architecture

           ┌─────────────┐
           │ Agent A     │  ───► Discovers and ranks trendy brand websites
           │ (Discovery) │
           └────┬────────┘
                ▼
           ┌─────────────┐
           │ Agent B     │  ───► Scrapes product listings (HTML, JSON, media)
           │ (Scraping)  │
           └────┬────────┘
                ▼
           ┌─────────────┐
           │ Agent C     │  ───► Parses & cleans metadata using GPT-4.5
           │ (Parsing)   │
           └────┬────────┘
                ▼
           ┌─────────────┐
           │ Agent D     │  ───► Parses reviews, extracts fit/sizing info
           │ (Reviews)   │
           └────┬────────┘
                ▼
           ┌────────────────────────────────────┐
           │    Vector DB + Metadata DB         │
           │ (e.g., Pinecone + Postgres)        │
           └────────────────────────────────────┘

🧠 Technology Stack

Component	Tech Stack Suggestions
Web scraping	Playwright or Selenium
LLM Parsing	LangGraph + [OpenAI GPT-4.5 API] for orchestration and text-to-structure pipelines
Agents	Multi-step agents using LangChain’s AgentExecutor or LangGraph’s stateful nodes
Vector DB	Pinecone
Relational DB	[PostgreSQL] for structured product metadata (brand, price, category, URL, etc.)
Data labeling	GPT-4.5 for inferring: occasion, fit type, color palette, skin-tone compatibility
Embedding model	Use any standard format for vector encoding
Job Orchestration	[LangGraph] with dynamic agents per task
Scheduler	Temporal or simple CRON jobs for regular data refresh

🔍 Step-by-Step Implementation Plan
✅ Step 1: Agent A – Trendy Brand Discovery
Goal: Auto-discover high-quality Indian + international fashion websites that meet aesthetic & trust criteria.

Input: Seed list of known brands + keywords like "luxury Indian fashion", "minimalist brands India", "best designer kurta stores".
Tooling:
GPT-4.5 prompt-powered crawler agent using LangGraph.
Use search APIs or scrape Google SERPs using SerpAPI or Playwright.
Filtering Criteria (in LangGraph logic):
Domain authority / HTTPS secure
Clean product catalog UI
No dropshipping signs (detect red flags like “AliExpress”, pixelated photos)
Indian-first brand preference flag
✅ Output: List of brand_url, brand_name, country, style_tags, homepage_type, rating_estimate

✅ Step 2: Agent B – Product Scraper
Goal: For each approved brand site, scrape clothing data: product name, description, image, sizes, price.

Tooling:
Playwright for robust headless scraping (supports JS-heavy sites).
Scrape limited product categories: jeans, shirts, kurtas, co-ords, dresses.
Save raw HTML & media content.
Data Captured:
title, description, image_url, price, available_sizes, tags, SKU, product_url
✅ Output: Raw data dump per product per site → passed to Agent C.

✅ Step 3: Agent C – Parsing & Metadata Enhancement
Goal: Clean, normalize, and enrich product data using GPT-4.5 (or LangGraph chain).

Process:
Parse product descriptions into structured schema:
style_type: casual, ethnic, luxury, etc.
aesthetic: minimalist, maximalist, earthy, streetwear
primary_color, fabric, cut, gender, fit_type
skin_tone_match: GPT can label from a few swatches ("best for warm beige and olive tones")
occasion: party, formal, vacation, etc.
Tooling:
GPT-4.5 prompt templates with few-shot examples
Chain structured prompt → response → validation
LangGraph state machine to retry/refine failures
✅ Output: Clean, enriched JSON blobs with labeled metadata

✅ Step 4: Agent D – Review Parser & Fit Engine
Goal: Extract crowd-sourced size/fitting insights from product reviews (if available)

Input: Raw review strings scraped alongside product.
Process:
Summarize review sentiment per size.
Extract statements like “runs small,” “true to size,” “tight at shoulders.”
Create fit_profile:
fit_consensus: tight / true / loose
return_rate_hint: if available
common complaints: material, sizing, color mismatch
Tooling:
GPT-4.5 prompt for extracting structured insights.
Filter low-confidence results (e.g., <10 reviews).
Optional: Save structured review insights in Postgres with FK to product.
✅ Output: Enhanced product entries with fit_score, return_insight, ideal_user_shape fields.

✅ Step 5: Database & Indexing
Goal: Store all structured fashion data for querying by user agents in Fleet B.

Two DBs:
PostgreSQL: for structured fields (brand, color, size range, etc.)
Pinecone: for vector embeddings of image + style text
Embedding Strategy:
For each product:
Generate style embedding from image (CLIP) and/or combined with text description.
Store vector with reference to product metadata in Postgres.
✅ Output: Fully queryable product database with hybrid semantic + filter search.
⏱️ Optional Optimizations

Feature	Approach
Image downloading	Use async image downloader + CDN store (e.g., Cloudinary, Supabase)
Monitoring scrapers	Integrate logs with Sentry or simple Slack bot notifications
Cold-start product base	Load initial curated JSON from known datasets like DeepFashion
Batch ingestion via CRON	Refresh scraping per brand weekly with next_fetch_date logic
Preemptive filtering	Apply GPT filter to skip "basic" or generic fast-fashion products early
📦 Final Data Structure Example

{
  "product_id": "uniqlo-jeans-123",
  "brand": "Uniqlo",
  "category": "jeans",
  "style_tags": ["minimalist", "denim", "streetwear"],
  "fit": "slim",
  "fabric": "stretch cotton",
  "primary_color": "indigo blue",
  "aesthetic": "urban casual",
  "skin_tone_match": ["warm beige", "olive"],
  "ideal_body_types": ["rectangular", "hourglass"],
  "price_inr": 3290,
  "available_sizes": ["28", "30", "32", "34"],
  "image_vector": "pinecone_id:abc123",
  "metadata": {
    "product_url": "https://uniqlo.com/in/jeans-123",
    "fit_score": "true to size",
    "review_summary": "Customers loved the stretch but noted low waistline."
  }
}
✅ Next Steps

Choose 3–5 brand sites as MVP input (e.g. House of Masaba, Uniqlo India, FabIndia, Zara).
Build modular scraping pipeline using Playwright.
Design LangGraph nodes for each agent task (A → B → C → D).
Create prompt templates with 3–5-shot examples per field (aesthetic, fit, etc.).
Set up Postgres + Pinecone schema.
Validate MVP with 30–50 product entries and test Fleet B querying next.