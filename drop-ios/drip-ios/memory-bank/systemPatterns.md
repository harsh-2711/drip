# System Patterns: Drip - Hyper-personalized Fashion

## System Architecture

The Drip backend is structured around a multi-agent architecture divided into two main fleets:

### Fleet A: Data Ingestion & Curation Architecture
```
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
           │ (e.g., In-memory + Postgres)       │
           └────────────────────────────────────┘
```

### Fleet B: User Interaction & Recommendation Agents (to be implemented)
- Agent E (Real-Time Recommendation Engine)
- Agent F (Conversational Refinement)
- Agent G (Dynamic Size Suggestions)
- Agent H (Visual Generation)

## Key Design Patterns

### 1. Agent-Based Architecture
Each component is designed as a standalone agent with specific responsibilities, allowing for:
- Independent development and testing
- Scalable processing
- Clear separation of concerns
- Flexible deployment options

### 2. Data Pipeline Pattern
The system follows a sequential data pipeline where:
- Each agent processes data and passes it to the next agent
- Data is progressively enriched and structured
- Each stage has clear input/output contracts
- Failures can be isolated and retried

### 3. Vector Database + Relational Database Hybrid
- Structured data (brand, price, category) stored in PostgreSQL
- Semantic data (descriptions, styles, reviews) stored in vector database
- Cross-referencing between databases via product IDs
- Hybrid query capability for both structured and semantic searches

### 4. LLM-Powered Data Processing
- GPT-4.5 used for intelligent data extraction and enrichment
- Prompt engineering patterns for consistent data formatting
- Few-shot examples to guide model outputs
- Validation steps to ensure data quality

### 5. In-Memory Fallback Pattern
- Primary storage in database systems
- In-memory fallback for resilience
- Graceful degradation when external services are unavailable

## Component Relationships

### Agent A (Discovery)
- **Inputs**: Seed list of brands, search keywords
- **Outputs**: Curated list of brand URLs with metadata
- **Dependencies**: Search APIs or web scraping tools
- **Storage**: Writes to brand database table

### Agent B (Scraper)
- **Inputs**: Brand URLs from Agent A
- **Outputs**: Raw product data (HTML, images, JSON)
- **Dependencies**: Playwright for headless browsing
- **Storage**: Writes raw data to temporary storage

### Agent C (Parser)
- **Inputs**: Raw product data from Agent B
- **Outputs**: Structured product metadata
- **Dependencies**: GPT-4.5 API
- **Storage**: Writes to product database tables

### Agent D (Review Parser)
- **Inputs**: Product reviews from Agent B
- **Outputs**: Structured fit insights and sizing recommendations
- **Dependencies**: GPT-4.5 API
- **Storage**: Writes to review insights database tables

### Database Indexer
- **Inputs**: Processed product data
- **Outputs**: Vector embeddings and indexed data
- **Dependencies**: Vector database, embedding models
- **Storage**: Writes to vector database and updates relational database

## Critical Implementation Paths

### Data Ingestion Flow
1. Agent A discovers brand websites
2. Agent B scrapes product listings
3. Agent C parses and structures product data
4. Agent D extracts insights from reviews
5. Database Indexer creates searchable embeddings

### Query Flow (Future Implementation)
1. User query received by Agent E
2. Vector search identifies candidate products
3. Filtering applied based on structured attributes
4. Results ranked by relevance
5. Agent F refines results based on user feedback

## Error Handling Patterns
- Retry mechanisms for transient failures
- Graceful degradation when services are unavailable
- Logging and monitoring at each stage
- In-memory fallbacks for database operations
- Validation steps to ensure data quality

## Scalability Considerations
- Independent scaling of each agent based on workload
- Batch processing for large datasets
- Asynchronous processing where possible
- Database sharding for future growth
- Caching strategies for frequently accessed data
