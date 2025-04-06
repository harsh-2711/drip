# Project Brief: Drip - Hyper-personalized Fashion

## Project Overview
Drip is a hyper-personalized fashion recommendation system designed to solve the common problems online shoppers face with clothing fit, style compatibility, and quality. The system uses AI to provide personalized fashion recommendations based on user preferences, body type, skin tone, and other factors.

## Core Requirements

### Fleet A: Data Ingestion & Curation Architecture
- Agent A (Discovery): Discover and rank trendy brand websites
- Agent B (Scraping): Scrape product listings from websites
- Agent C (Parsing): Parse and clean metadata using GPT-4.5
- Agent D (Reviews): Parse reviews and extract fit/sizing information
- Database & Indexing: Store structured data in PostgreSQL and vector database

### Fleet B: User Interaction & Recommendation Agents
- Agent E (Real-Time Recommendation Engine): Match user preferences against vector database
- Agent F (Conversational Refinement): Interact conversationally to refine results
- Agent G (Dynamic Size Suggestions): Predict personalized size recommendations
- Agent H (Visual Generation): Visualize clothing combinations and styling suggestions

## Project Goals
1. Reduce uncertainty about clothing fit, style compatibility, and quality
2. Personalize product discovery effectively for localized markets like India
3. Boost consumer confidence in online fashion purchases
4. Elevate local brands and reduce returns
5. Accommodate diverse skin tones, body shapes, and style preferences

## Success Metrics
- Fit accuracy: 90%+ user satisfaction with recommended size and fit
- Engagement: High percentage of recommendations positively engaged with
- Return-rate reduction: 30-50% reduction compared to industry standard
- User retention: High number of weekly/monthly active users
- Seller impact: Increased discovery and sales for niche/local brands

## Current Focus
The current focus is on implementing Fleet A, specifically starting with the backend components for data ingestion, processing, and storage. This includes setting up the database structure, implementing the agent architecture, and creating a vector database for semantic search.
