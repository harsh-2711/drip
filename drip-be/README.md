# Drip: Hyper-personalized Fashion Backend

This is the backend implementation for the Drip project, a hyper-personalized fashion recommendation system. The backend is responsible for data ingestion, curation, and serving recommendations to users.

## Project Structure

The project is organized into two main fleets:

- **Fleet A**: Data Ingestion & Curation Architecture
  - Agent A: Trendy Brand Discovery
  - Agent B: Product Scraper
  - Agent C: Parsing & Metadata Enhancement
  - Agent D: Review Parser & Fit Engine
  - Database & Indexing

- **Fleet B**: User Interaction & Recommendation Agents (to be implemented)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- LiteLLM API key from https://rabbithole.cred.club
- PostgreSQL (v12 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your LiteLLM API key to `.env`
   - Add your database configuration to `.env`
   ```
   LITELLM_API_KEY=your_litellm_api_key_here
   OPENAI_API_BASE=https://api.rabbithole.cred.club/v1
   
   # Database Configuration
   POSTGRES_URI=postgres://username:password@localhost:5432/drip
   ```

4. Set up the databases:
   - Install PostgreSQL if not already installed
   - Run the database setup scripts:
   ```
   # Set up both PostgreSQL and in-memory vector database
   npm run setup-db
   
   # Or set up each database individually
   npm run setup-postgres
   npm run setup-memory
   ```
   - These scripts will create the necessary database, tables, and indexes

### Running the Application

To run the entire Fleet A pipeline:

```
npm start
```

To run only the Discovery Agent (Agent A):

```
npm run discovery
```

To run only the Product Scraper (Agent B):

```
npm run scraper
```

To run only the Parser Agent (Agent C):

```
npm run parser
```

To run only the Review Parser Agent (Agent D):

```
npm run review-parser
```

To run only the Database Indexer Agent (Agent E):

```
npm run db-indexer
```

## Implementation Status

- [x] Agent A: Trendy Brand Discovery
- [x] Agent B: Product Scraper
- [x] Agent C: Parsing & Metadata Enhancement
- [x] Agent D: Review Parser & Fit Engine
- [x] Database & Indexing

## Data Flow

1. Agent A discovers fashion brand websites based on criteria
2. Agent B scrapes product listings from these websites
3. Agent C parses and cleans the metadata using GPT
4. Agent D parses reviews and extracts fit/sizing information
5. All data is stored in an in-memory vector database and relational database (PostgreSQL)

## Technologies Used

- LangChain/LangGraph for agent orchestration
- LiteLLM API for accessing AI models
- Playwright for web scraping
- PostgreSQL for structured data storage
- In-memory vector database for semantic search (no external dependencies)
- Sequelize ORM for database operations
