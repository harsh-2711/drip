# Fleet B: User Interaction & Recommendation Agents

Fleet B is the personalization and recommendation engine for the Drip fashion platform. It provides a set of AI-powered agents that work together to deliver hyper-personalized fashion recommendations, conversational refinement, and size/fit guidance.

## Architecture

Fleet B consists of four main agents:

1. **Agent E (Stylist AI)**: Real-time recommendation engine that turns user inputs into a fashion persona and generates product recommendations.
2. **Agent F (Feedback & Refinement)**: Conversational refinement agent that processes user feedback and refines recommendations.
3. **Agent G (Fit & Size Personalization)**: Dynamic size suggestions agent that recommends the correct size for products based on user body measurements.
4. **Agent H (Visual Generation)**: Visualization agent that generates outfit visualizations, styling suggestions, mood boards, and outfit descriptions.

These agents are exposed through a RESTful API that can be consumed by the iOS app.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL database (with Fleet A data)
- Vector database (in-memory, Chroma, or Pinecone)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/drip-backend.git
cd drip-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Set up the databases:
```bash
npm run setup-db
```

### Running Fleet B API Server

To start the Fleet B API server:

```bash
npm run api-server
```

This will start the API server on port 3000 (or the port specified in the `PORT` environment variable).

Alternatively, you can run both Fleet A and Fleet B together:

```bash
npm start
```

To run only Fleet B:

```bash
npm start -- --fleet-b
```

## API Documentation

The Fleet B API provides endpoints for:

- Generating user personas based on text input
- Generating product recommendations based on user personas
- Processing user feedback and refining recommendations
- Generating size recommendations for products
- Extracting body measurements from images
- Generating fit advice for products

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Agent Details

### Agent E: Stylist AI

The Stylist AI agent is responsible for:

- Generating a user persona based on text input and preferences
- Creating a vector representation of the user's style preferences
- Querying the vector database for similar products
- Generating personalized recommendation reasons

#### Key Features

- Style extraction from natural language
- Personalized recommendations based on user preferences
- Integration with vector database for semantic search
- Recommendation reasons that explain why a product matches the user's preferences

### Agent F: Feedback & Refinement

The Feedback & Refinement agent is responsible for:

- Processing user feedback on recommendations
- Extracting insights from feedback
- Updating the user persona based on feedback
- Refining recommendations based on the updated persona
- Generating conversational responses to feedback

#### Key Features

- Natural language feedback processing
- Continuous learning from user preferences
- Personalized refinement of recommendations
- Conversational responses that acknowledge user feedback

### Agent G: Fit & Size Personalization

The Fit & Size Personalization agent is responsible for:

- Recommending the correct size for products based on user measurements
- Extracting body measurements from images (using MediaPipe)
- Generating personalized fit advice for products
- Providing size charts for products

#### Key Features

- Personalized size recommendations
- Body measurement extraction from images
- Fit advice tailored to the user's body shape
- Size charts for products

### Agent H: Visual Generation

The Visual Generation agent is responsible for:

- Generating visualizations of outfits based on product combinations
- Creating styling tips for product combinations
- Generating mood boards for style concepts
- Providing detailed descriptions of how outfits would look on the user

#### Key Features

- AI-generated outfit visualizations
- Personalized styling suggestions
- Custom mood boards for style inspiration
- Detailed outfit descriptions tailored to user's body shape and skin tone

## iOS App Integration

The Fleet B API is designed to be consumed by the iOS app. The app can:

1. Send user input to the API to generate a persona
2. Request recommendations based on the persona
3. Send feedback on recommendations to refine future recommendations
4. Request size recommendations for products
5. Upload body images for measurement extraction
6. Request fit advice for products
7. Generate outfit visualizations for selected products
8. Get styling tips for product combinations
9. Create mood boards for style concepts
10. Receive detailed outfit descriptions tailored to the user

## Development

### Adding New Features

To add new features to Fleet B:

1. Implement the feature in the appropriate agent
2. Add any necessary API endpoints in `src/api/index.js`
3. Update the API documentation in `docs/API_DOCUMENTATION.md`
4. Test the feature with the API server

### Testing

To test the API endpoints:

1. Start the API server:
```bash
npm run api-server
```

2. Use a tool like Postman or curl to send requests to the API endpoints
3. Check the responses to ensure they match the expected format

## Troubleshooting

### Common Issues

- **API server won't start**: Check that the required environment variables are set and the databases are properly configured.
- **Vector database connection issues**: Ensure that the vector database is running and accessible. The system will fall back to the in-memory vector database if the primary database is unavailable.
- **Size recommendations not working**: Make sure that the product data includes available sizes and that the user measurements are provided in the correct format.

### Logs

The API server logs can be found in the console output. For more detailed logging, set the `DEBUG` environment variable:

```bash
DEBUG=drip:* npm run api-server
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request
