# Redis + LangChain (TypeScript CLI)

## Author: Emi Roberti

A TypeScript CLI tool that:

- Accepts user prompts via terminal
- Sends them to a LangChain LLM chain (like OpenAI)
- Stores the prompt + response pair in Redis using a timestamp as the key

---

## 📦 Tech Stack

- [Node.js](https://nodejs.org/) (v18+)
- [TypeScript](https://www.typescriptlang.org/)
- [LangChainJS](https://js.langchain.com/)
- [Redis](https://redis.io/)
- [redis npm package (v4+)](https://www.npmjs.com/package/redis)

---

## 🚀 Getting Started

### 1. Clone & install dependencies

```bash
git clone git@github.com:EmiRoberti77/ts-redis-langchain-chat.git
cd redis-langchain-ts
npm install
```

### 2. Run Redis (if not already running)

```bash
brew services start redis
```

Or:

```bash
redis-server
```

### 3. Create your `.env` (optional for API keys)

```env
OPENAI_API_KEY=sk-...
```

---

## 🧪 Run the CLI

```bash
npx tsx src/index.ts
```

Type your prompt in the terminal:

```
> What is the meaning of life?
```

Type `exit` to quit.

---

## 📚 Redis Storage Format

Each prompt/response is stored as a **Redis hash**, with a timestamp key like:

```text
2025-04-04T05:53:27.956Z
```

And values like:

```json
{
  "prompt": "What is the meaning of life?",
  "response": "42"
}
```

---

## 📁 Project Structure

```
src/
├── index.ts          # Entry point CLI
├── redisClient.ts    # Redis setup
└── langchain.ts      # LangChain chain setup
```

---

## 📄 Example: `src/index.ts`

```ts
import readline from "readline";
import { client } from "./redisClient";
import { chain } from "./langchain";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  while (true) {
    const prompt = await askQuestion("> ");
    if (prompt.toLowerCase() === "exit") break;

    const response = await chain.invoke({ input: prompt });
    console.log(response);

    const timestamp = new Date().toISOString();
    await client.hSet(timestamp, {
      prompt,
      response: response.toString(),
    });
  }

  rl.close();
  await client.quit();
}

main();
```

---

## 📄 Example: `src/redisClient.ts`

```ts
import { createClient } from "redis";

export const client = createClient();

client.on("error", (err) => {
  console.error("Redis Client Error", err);
});

await client.connect();
```

---

## 📄 Example: `src/langchain.ts`

```ts
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

export const chain = new ConversationChain({
  llm: new ChatOpenAI({
    temperature: 0.7,
    modelName: "gpt-4",
  }),
  memory: new BufferMemory(),
});
```

---

## 🛠 Redis Commands

- Show all keys:

  ```bash
  redis-cli keys "*"
  ```

- View type:

  ```bash
  type "2025-04-04T05:53:27.956Z"
  ```

- View stored hash:

  ```bash
  hgetall "2025-04-04T05:53:27.956Z"
  ```

- Delete everything:
  ```bash
  redis-cli FLUSHALL
  ```

---

## 📄 License

MIT
