# Technical Context: Drip - Hyper-personalized Fashion

## Technology Stack

### Backend Core
- **Runtime**: Node.js
- **Language**: JavaScript/TypeScript
- **Framework**: Express.js (implied)

### Agent Orchestration
- **LangChain/LangGraph**: For agent orchestration and workflow management
- **LiteLLM API**: For accessing AI models (via RabbitHole API)

### Web Scraping
- **Playwright**: For headless browser automation and web scraping

### Databases
- **PostgreSQL**: For structured data storage (products, brands, metadata)
- **In-memory Vector Database**: For semantic search capabilities
  - Uses HuggingFace Transformers for embeddings
  - Fallback mechanism for resilience

### Data Processing
- **Sequelize ORM**: For database operations
- **HuggingFace Transformers**: For text vectorization and embeddings
  - Model: Xenova/all-MiniLM-L6-v2

### AI Integration
- **OpenAI API**: Accessed via RabbitHole API (CRED)
- **GPT-4o**: For intelligent data extraction and processing (used as a substitute for GPT-4.5)
- **ChatOpenAI**: LangChain's chat model interface for interacting with OpenAI's chat models
- **Fashn.ai API**: For virtual try-on functionality in the Visual Generation agent

## Development Setup

### Environment Requirements
- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)
- LiteLLM API key from https://rabbithole.cred.club

### Environment Variables
```
LITELLM_API_KEY=your_litellm_api_key_here
OPENAI_API_BASE=https://api.rabbithole.cred.club/v1

# External APIs
FASHN_API_KEY=your_fashn_api_key_here

# Database Configuration
POSTGRES_URI=postgres://username:password@localhost:5432/drip
```

### Project Structure
```
/
├── data/                  # Data storage directory
├── docs/                  # Documentation
│   ├── API_ACCESS.md
│   ├── FLEET_A.md
│   └── INSTRUCTIONS.md
├── memory-bank/           # Memory bank for Cline
├── scripts/               # Setup and utility scripts
│   ├── setup-memory.js    # Setup for in-memory vector DB
│   ├── setup-postgres.js  # Setup for PostgreSQL
│   └── ...
├── src/
│   ├── agents/            # Agent implementations
│   │   ├── db-indexer/    # Database indexing agent
│   │   ├── discovery/     # Brand discovery agent
│   │   ├── parser/        # Data parsing agent
│   │   ├── review-parser/ # Review parsing agent
│   │   └── scraper/       # Web scraping agent
│   ├── config/            # Configuration files
│   ├── db/                # Database connectors
│   │   ├── memory-vector.js  # In-memory vector database
│   │   ├── postgres.js    # PostgreSQL connector
│   │   └── ...
│   ├── models/            # Data models
│   ├── utils/             # Utility functions
│   │   ├── openai.js      # OpenAI API utilities
│   │   └── scraper.js     # Scraping utilities
│   ├── index.js           # Main application entry
│   └── run-*.js           # Agent runner scripts
└── package.json           # Project dependencies
```

## Technical Constraints

### API Rate Limits
- LiteLLM/OpenAI API has rate limits that must be respected
- Implement retry mechanisms with exponential backoff

### Database Performance
- Vector search can be computationally expensive
- Implement pagination and limit result sets
- Use efficient embedding models (Xenova/all-MiniLM-L6-v2)

### Web Scraping Challenges
- Websites may implement anti-scraping measures
- Respect robots.txt and implement polite scraping
- Use rotating user agents and implement delays

### Embedding Dimensions
- Using 384-dimensional vectors for embeddings
- Balance between accuracy and performance

## Dependencies

### Core Dependencies
- `@langchain/community`: For agent orchestration
- `chromadb`: For vector database operations
- `@xenova/transformers`: For embedding generation
- `playwright`: For web scraping
- `sequelize`: For ORM operations
- `pg`: PostgreSQL client
- `axios`: For HTTP requests
- `dotenv`: For environment variable management

### Development Dependencies
- `nodemon`: For development server
- `jest`: For testing (implied)

## Tool Usage Patterns

### Database Operations
```javascript
// PostgreSQL operations via Sequelize
const { Product } = require('../models');
await Product.create({ /* product data */ });

// Vector database operations
const memoryVectorDB = require('../db/memory-vector');
await memoryVectorDB.storeProductEmbedding(product);
const results = await memoryVectorDB.querySimilarProductsByText('query text');
```

### Agent Execution
```javascript
// Running an agent
const agent = require('./agents/discovery');
const results = await agent.run({ /* input parameters */ });

// Or via command line
// npm run discovery
```

### Web Scraping
```javascript
const { scrapeProductPage } = require('./utils/scraper');
const productData = await scrapeProductPage(url);
```

### AI Processing
```javascript
const { generateEmbedding, parseProductData } = require('./utils/openai');
const embedding = await generateEmbedding(text);
const structuredData = await parseProductData(rawData);
```

## Deployment Considerations

### Local Development
- Run with `npm start` or individual agent scripts
- Use `.env` file for environment variables

### Production (Future)
- Consider containerization with Docker
- Implement proper database backup strategies
- Set up monitoring and logging
- Consider scaling strategies for different components

## Testing Strategy
- Unit tests for individual components
- Integration tests for agent workflows
- End-to-end tests for complete data pipeline
- Mock external APIs for consistent testing

## LangChain Model Usage Standards

### Chat Models vs Text Models
- **Always use ChatOpenAI** for OpenAI's chat models (gpt-3.5-turbo, gpt-4, gpt-4o)
- **Never use OpenAI** class with chat models as it will result in errors
- **Example implementation**:
  ```javascript
  const { ChatOpenAI } = require('@langchain/openai');
  const config = require('../../config');
  
  // Correct implementation
  const llm = new ChatOpenAI({
    modelName: config.openai.model, // 'gpt-4o' as defined in config
    temperature: 0.7,
    openAIApiKey: config.openai.apiKey,
    openAIApiBase: config.openai.apiBase
  });
  ```

### Prompt Templates
- Use `PromptTemplate` from `@langchain/core/prompts` for creating structured prompts
- Format prompts with clear sections using markdown headers for better readability
- Include explicit instructions for output format (especially for JSON responses)
- Use JavaScript template literals (`${variable}`) for dynamic values in templates instead of LangChain template variables (`{variable}`) when the value is known at template creation time
- Example:
  ```javascript
  // Correct approach for dynamic values known at template creation time
  const numImages = 4;
  const promptTemplate = new PromptTemplate({
    template: `
      # Task
      Create ${numImages} image prompts that would represent this style concept
    `,
    inputVariables: ['styleDescription', 'bodyShape', 'skinTone']
  });
  
  // Only use LangChain template variables for values passed at runtime
  const result = await chain.call({
    styleDescription,
    bodyShape: userPersona.body_shape || 'unknown',
    skinTone: userPersona.skin_tone || 'unknown'
  });
  ```

### Chains
- Use `LLMChain` from `langchain/chains` for simple prompt-response chains
- For more complex workflows, consider using LangGraph for agent orchestration
