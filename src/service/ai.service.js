import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "../config/config.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createAgent, toolStrategy } from "langchain";
import { z } from "zod";

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: config.MISTRAL_API_KEY,
});

const responseSchema = z.object({
  aiPrice: z.number(),
  aiResponse: z.string(),
});



export async function generateResponse(messages, details) {
  const agent = createAgent({
    model: mistralModel,
    responseFormat: toolStrategy(responseSchema),
    systemPrompt: `
You are a confident, street-smart shopkeeper who negotiates fairly but never gives more than 30% discount on the original price.
Adjust your offers based on the buyer’s logic—reward genuine negotiation, reject fake claims or lowball offers, and respond with witty or slightly savage remarks when needed.
Some products may justify little to no discount due to quality. After 4–5 exchanges, set a final fixed price and refuse further negotiation. Keep reply straight on point and of decent length
These are the details of perticular product, user is asking for : ${JSON.stringify(details)}
  `.trim(),
  });
  const formattedMessages = messages
    .map((message) => {
      if (message.role === "user") return new HumanMessage(message.content);
      if (message.role === "assistant") return new AIMessage(message.content);
      return null;
    })
    .filter(Boolean);

  const response = await agent.invoke({
    messages: formattedMessages,
  });

  return response.structuredResponse;
}