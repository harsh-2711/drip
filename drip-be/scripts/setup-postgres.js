/**
 * PostgreSQL Setup Script
 * 
 * This script helps set up the PostgreSQL database for the Drip project.
 * It creates the database if it doesn't exist and initializes the schema.
 */

const { Client } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuration
const dbName = 'drip';
const username = process.env.USER || 'postgres'; // Use system username as default
const defaultUri = process.env.POSTGRES_URI || `postgres://${username}@localhost:5432/postgres`;
const targetUri = process.env.POSTGRES_URI || `postgres://${username}@localhost:5432/${dbName}`;

async function main() {
  console.log('Starting PostgreSQL setup...');
  
  try {
    // Try to connect to default PostgreSQL database
    console.log(`Attempting to connect with user: ${username}`);
    
    let client;
    try {
      client = new Client({
        connectionString: defaultUri
      });
      
      await client.connect();
      console.log('Connected to PostgreSQL server.');
    } catch (error) {
      console.error('Failed to connect with default user. Error:', error.message);
      
      // Try with system username if postgres failed
      if (username === 'postgres') {
        const systemUsername = process.env.USER;
        console.log(`Trying with system username: ${systemUsername}`);
        
        try {
          const altUri = `postgres://${systemUsername}@localhost:5432/postgres`;
          client = new Client({
            connectionString: altUri
          });
          
          await client.connect();
          console.log(`Connected to PostgreSQL server with user: ${systemUsername}`);
        } catch (altError) {
          console.error('Failed to connect with system username. Error:', altError.message);
          console.log('\nPlease update your .env file with the correct PostgreSQL connection string:');
          console.log('POSTGRES_URI=postgres://yourusername@localhost:5432/postgres');
          process.exit(1);
        }
      } else {
        console.log('\nPlease update your .env file with the correct PostgreSQL connection string:');
        console.log('POSTGRES_URI=postgres://yourusername@localhost:5432/postgres');
        process.exit(1);
      }
    }
    
    // Check if database exists
    const checkDbResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [dbName]);
    
    if (checkDbResult.rows.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
    
    await client.end();
    
    // Connect to the Drip database and initialize schema
    console.log('Initializing database schema...');
    const sequelize = new Sequelize(targetUri, {
      logging: false
    });
    
    // Test connection
    await sequelize.authenticate();
    console.log('Connection to Drip database established successfully.');
    
    // Import database models
    const postgresDB = require('../src/db/postgres');
    
    // Initialize and sync models
    await postgresDB.init();
    
    console.log('Database schema initialized successfully.');
    console.log('PostgreSQL setup complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up PostgreSQL:', error);
    process.exit(1);
  }
}

main();
