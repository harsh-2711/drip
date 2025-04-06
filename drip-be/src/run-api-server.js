const { startServer } = require('./api');
const postgresDB = require('./db/postgres');
const memoryVectorDB = require('./db/memory-vector');
const pineconeDB = require('./db/pinecone');
const chromaDB = require('./db/chroma');
const config = require('./config');

async function main() {
  try {
    console.log('Starting Fleet B API Server...');
    
    // Initialize databases
    console.log('Initializing databases...');
    
    // Initialize PostgreSQL
    console.log('Connecting to PostgreSQL...');
    await postgresDB.init();
    console.log('PostgreSQL connection established.');
    
    // Initialize vector database based on configuration
    console.log(`Connecting to ${config.vectorDb} vector database...`);
    let vectorDb;
    
    if (config.vectorDb === 'pinecone') {
      vectorDb = pineconeDB;
    } else if (config.vectorDb === 'chroma') {
      vectorDb = chromaDB;
    } else {
      vectorDb = memoryVectorDB;
    }
    
    await vectorDb.init();
    console.log(`${config.vectorDb} vector database connection established.`);
    
    // Start the API server
    console.log('Starting API server...');
    const server = await startServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down API server...');
      server.close();
      
      // Close database connections
      console.log('Closing database connections...');
      await postgresDB.close();
      
      console.log('Shutdown complete.');
      process.exit(0);
    });
    
    console.log('Fleet B API Server is ready to accept requests.');
    console.log('Press Ctrl+C to stop the server.');
  } catch (error) {
    console.error('Error starting API server:', error);
    process.exit(1);
  }
}

main();
