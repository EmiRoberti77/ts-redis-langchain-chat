# Integrating LangGraph with Redis in TypeScript

## Author: Emi Roberti

## Overview

This guide demonstrates how to integrate [LangGraph](https://github.com/langchain-ai/langgraphjs) with Redis using TypeScript and LangChain.js. Redis is used here to persist memory for conversational agents, which is especially helpful in stateless environments like serverless functions or distributed applications.

## Why Use Redis for Memory?

Using Redis as a memory backend offers several advantages:

- **Persistence**: Maintains conversational history even across application restarts or failures.
- **Scalability**: Works well with distributed systems, allowing multiple nodes to share memory state.
- **Performance**: Redis is an in-memory store with low latency and high throughput.
- **Session Management**: Easily manage user-specific sessions via unique keys.

## Prerequisites

Ensure you have the following installed:

```bash
npm install langchain @langchain/langgraph @redis/client ioredis openai
npm install -D typescript @types/node
```

## Project Structure

```bash
project-root/
├── src/
│   └── index.ts
├── tsconfig.json
└── package.json
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## Integration Code (src/index.ts)

```ts
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { RedisChatMessageHistory } from "langchain/stores/message/redis";
import { createClient } from "redis";

async function main() {
  const redisClient = createClient({ url: "redis://localhost:6379" });
  await redisClient.connect();

  const memory = new BufferMemory({
    chatHistory: new RedisChatMessageHistory({
      sessionId: "test-session-123",
      client: redisClient,
    }),
    returnMessages: true,
    memoryKey: "chat_history",
  });

  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0.7,
  });

  const chain = new ConversationChain({
    llm,
    memory,
  });

  const res1 = await chain.call({ input: "Hello!" });
  console.log("Bot:", res1.response);

  const res2 = await chain.call({ input: "What's my name?" });
  console.log("Bot:", res2.response);

  await redisClient.quit();
}

main().catch(console.error);
```

## Conclusion

Integrating Redis with LangGraph via LangChain.js provides a robust solution for managing conversational memory at scale. With minimal setup, developers can build AI agents that remember context, personalize responses, and operate efficiently in cloud-native environments.

---
