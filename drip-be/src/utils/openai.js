const { ChatOpenAI } = require('@langchain/openai');
const config = require('../config');

// Initialize ChatOpenAI client with LiteLLM API
const chatModel = new ChatOpenAI({
  apiKey: config.litellm.apiKey,
  modelName: config.litellm.model,
  temperature: 0.2, // Lower temperature for more deterministic outputs
  configuration: {
    baseURL: config.litellm.apiBase,
  }
});

module.exports = {
  chatModel,
};
