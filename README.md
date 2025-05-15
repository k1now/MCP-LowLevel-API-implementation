# MCP Low-Level API Implementation

This project demonstrates a low-level implementation of the Model Control Protocol (MCP) using vanilla JavaScript, without relying on any SDKs or high-level abstractions. It serves as an educational example of how to implement core MCP concepts from scratch.

## Core MCP Concepts Demonstrated

### 1. Tool Calling Protocol
- Implementation of the tool calling mechanism using raw HTTP requests
- Custom tool registry system for managing available tools
- Tool schema definition and validation
- Asynchronous tool execution and response handling

### 2. Message Management
- Structured message format implementation
- Role-based message handling (user, assistant, tool)
- Message history management
- Content block type handling (text, tool_use)

### 3. API Integration
- Direct integration with Claude API using raw HTTP requests
- Custom header management
- Request/response payload construction
- Error handling and response parsing

### 4. Tool Execution Flow
- Tool discovery and registration
- Input validation and processing
- Result handling and error management
- Recursive conversation flow with tool results

## Technical Implementation Details

### Low-Level Components
- Raw HTTP client implementation using `axios`
- Custom tool execution pipeline
- Manual payload construction and parsing
- Direct API endpoint management

### Architecture
- Service-based architecture for tool implementation
- Event-driven conversation flow
- Asynchronous operation handling
- Error boundary implementation

### Security Considerations
- Environment variable management
- API key handling
- Request validation
- Error boundary implementation

## Why Low-Level Implementation?

This project intentionally avoids using SDKs or high-level abstractions to:
1. Demonstrate deep understanding of MCP protocol internals
2. Showcase ability to work with raw API endpoints
3. Provide complete control over the implementation details
4. Enable custom modifications and extensions
5. Better understand the underlying mechanisms

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your API keys
4. Run the server: `node index.js`

## Project Structure
```
.
├── index.js          # Main application entry
├── mcp.js           # MCP protocol implementation
├── services/        # Tool implementations
│   ├── calculator.js
│   └── jokeGenerator.js
└── package.json     # Project configuration
```

## Note
This is a demonstration project focusing on MCP implementation concepts. The actual tools (calculator and joke generator) are trivial examples used to showcase the MCP protocol implementation. 