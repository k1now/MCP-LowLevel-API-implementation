require('dotenv').config();
const express = require('express');
const app = express();
const calculatorService = require('./services/calculator');
const jokeService = require('./services/jokeGenerator');
const { callTool } = require('./mcp');
const axios = require('axios');

const apiKey = process.env.ANTHROPIC_API_KEY;

const headers = {
  'x-api-key': apiKey,
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json',
};

const toolSchemas = [
  {
    name: 'calculator',
    description: 'Performs math calculations.',
    input_schema: {
      type: 'object',
      properties: { expression: { type: 'string' } },
      required: ['expression']
    }
  },
  { 
    name: 'joke',
    description: 'Tells a joke.',
    input_schema: { type: 'object', properties: {} }
  }
];

// Add tools registry
const toolsRegistry = {
  calculator: async (input) => {
    try {
      const response = await axios.post('http://localhost:4000/calculator', input);
      return response.data.result;
    } catch (error) {
      console.error('Calculator error:', error.message);
      return 'Error calculating result';
    }
  },
  joke: async () => {
    try {
      const response = await axios.post('http://localhost:4000/joke');
      return response.data.result;
    } catch (error) {
      console.error('Joke error:', error.message);
      return 'Error getting joke';
    }
  }
};

const conversation = {
  model: 'claude-3-opus-20240229',
  max_tokens: 1000,
  messages: [],
};

function addUserMessage(text) {
  conversation.messages.push({
    role: 'user',
    content: [{ type: 'text', text }]
  });
}

function addAssistantToolUse(toolBlock) {
  conversation.messages.push({
    role: 'assistant',
    content: [toolBlock]
  });
}

function addToolResult(toolId, result) {
  conversation.messages.push({
    role: 'user',
    content: [{
      type: 'tool_result',
      tool_use_id: toolId,
      content: result
    }]
  });
}

function buildRequestPayload() {
  const payload = {
    model: conversation.model,
    max_tokens: conversation.max_tokens,
    messages: conversation.messages
  };
  if (conversation.messages.length === 1) payload.tools = toolSchemas;
  return payload;
}

async function callClaudeAPI() {
  try {
    console.log('📤 Sending request to Claude API...');
    const payload = buildRequestPayload();
    console.log('📦 Request payload:', JSON.stringify(payload, null, 2));
    
    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      payload,
      { headers }
    );
    
    console.log('📥 Received response from Claude API');
    return res.data;
  } catch (error) {
    console.error('❌ API call failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

async function runConversation() {
  try {
    const response = await callClaudeAPI();
    
    if (!response || !response.content) {
      throw new Error('Invalid response format from Claude API');
    }

    const contentBlocks = response.content;
    console.log('📝 Content blocks:', JSON.stringify(contentBlocks, null, 2));
    
    const toolBlock = contentBlocks.find(block => block.type === 'tool_use');

    if (toolBlock) {
      console.log('🔧 Tool use detected:', toolBlock.name);
      addAssistantToolUse(toolBlock);
      const { name: toolName, input, id: toolId } = toolBlock;

      if (toolsRegistry[toolName]) {
        console.log('⚙️ Executing tool:', toolName);
        const toolOutput = await callTool(toolName, input);
        console.log('✅ Tool output:', toolOutput);
        addToolResult(toolId, toolOutput);

        // Recursive Call to Continue the Conversation
        await runConversation();
      } else {
        console.error(`❌ Unknown tool: ${toolName}`);
      }
    } else {
      const finalText = contentBlocks.find(block => block.type === 'text');
      if (finalText) {
        console.log('\n💬 Final Response:\n', finalText.text);
      } else {
        console.log('⚠️ No final text response found.');
      }
    }
  } catch (error) {
    console.error('❌ Error in conversation:', error.message);
    process.exit(1);
  }
}

// Start the MCP API Server for tools
app.use(express.json());
app.use(calculatorService);
app.use(jokeService);

const port = process.env.MCP_SERVER_PORT || 4000;

// Wrap server start in a promise
const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🚀 MCP Tool Server running on port ${port}`);
      resolve(server);
    });
  });
};

// Main function to run everything
async function main() {
  try {
    if (!apiKey) {
      throw new Error('❌ API key is missing. Please set ANTHROPIC_API_KEY in .env file');
    }

    // Start the server and wait for it to be ready
    const server = await startServer();
    
    // Add a small delay to ensure server is fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🤖 Starting conversation...');
    addUserMessage('What is 10% of 500?');
    await runConversation();
    
    // Keep the server running
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Start everything
main();
