require('dotenv').config();

const config = {
  litellm: {
    apiKey: process.env.LITELLM_API_KEY,
    apiBase: process.env.OPENAI_API_BASE,
    model: 'gpt-4o', // Using the latest available model as a substitute for GPT-4.5
  },
  openai: {
    apiKey: process.env.LITELLM_API_KEY,
    apiBase: process.env.OPENAI_API_BASE,
    model: 'gpt-4o', // Using the latest available model as a substitute for GPT-4.5
  },
  actual_openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o', // Using the latest available model as a substitute for GPT-4.5
  },
  fashn: {
    apiKey: process.env.FASHN_API_KEY,
  },
  postgres: {
    uri: process.env.POSTGRES_URI || 'postgres://postgres:postgres@localhost:5432/drip',
    logging: process.env.POSTGRES_LOGGING === 'true',
    ssl: process.env.POSTGRES_SSL === 'true',
    sync: true,
    alter: true
  },
  // Vector database configuration
  // Use either Pinecone (cloud), Chroma (local), or Memory (in-memory)
  vectorDb: 'memory', // 'pinecone', 'chroma', or 'memory'
  
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: 'drip-products'
  },
  
  chroma: {
    url: process.env.CHROMA_URL, // Optional, for remote Chroma server
    collectionName: 'drip-products'
  },
  
  memory: {
    collectionName: 'drip-products'
  },
  scraping: {
    maxBrandsToDiscover: parseInt(process.env.MAX_BRANDS_TO_DISCOVER || '10', 10),
    maxProductsPerBrand: parseInt(process.env.MAX_PRODUCTS_PER_BRAND || '100', 10),
  },
  // Seed list of known brands for Agent A
  seedBrands: [
    { name: 'House of Masaba', url: 'https://houseofmasaba.com', country: 'India', style: ['ethnic', 'fusion'] },
    { name: 'FabIndia', url: 'https://www.fabindia.com', country: 'India', style: ['ethnic', 'traditional'] },
    { name: 'Uniqlo India', url: 'https://www.uniqlo.com/in', country: 'Japan/India', style: ['minimalist', 'casual'] },
    { name: 'Zara India', url: 'https://www.zara.com/in', country: 'Spain/India', style: ['fast-fashion', 'trendy'] },
    { name: 'Anita Dongre', url: 'https://www.anitadongre.com', country: 'India', style: ['luxury', 'ethnic'] },
  ],
  // Search keywords for discovering new brands
  searchKeywords: [
    'luxury Indian fashion',
    'minimalist brands India',
    'best designer kurta stores',
    'premium Indian clothing brands',
    'sustainable fashion India',
    'designer ethnic wear India',
    'premium western wear India',
  ],
  // Filtering criteria for brand discovery
  brandFilteringCriteria: {
    mustHaveHttps: true,
    minDomainAuthority: 20,
    dropshippingRedFlags: ['aliexpress', 'dropshipping', 'wholesale', 'alibaba'],
    preferIndianBrands: true,
  },
};

module.exports = config;
