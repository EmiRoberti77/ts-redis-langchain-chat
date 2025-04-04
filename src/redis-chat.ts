import { ChatOpenAI } from "@langchain/openai";
import { RedisChatMessageHistory } from "@langchain/redis";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

// Create Redis-backed memory for chat history
const memory = new BufferMemory({
  chatHistory: new RedisChatMessageHistory({
    sessionId: new Date().toISOString(), // unique session ID
    sessionTTL: 300, // optional: expire after 5 minutes
  }),
});

// Setup OpenAI chat model
const model = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

// Combine model and memory into a conversation chain
const chain = new ConversationChain({
  llm: model,
  memory,
});

// Setup terminal input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Main interactive loop
async function main() {
  while (true) {
    const prompt = await askQuestion(">");
    if (prompt.trim().toLowerCase() === "exit") {
      rl.close();
      break;
    }

    const response = await chain.invoke({ input: prompt });
    console.log(response);
  }
}

main();
