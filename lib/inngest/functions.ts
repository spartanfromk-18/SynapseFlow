import { inngest } from "./client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key",
});

export const runWorkflow = inngest.createFunction(
  { id: "run-ai-workflow" },
  { event: "workflow/run" },
  async ({ event, step }) => {
    const { nodes, edges, inputData } = event.data;
    
    let currentNodeId = nodes[0]?.id;
    const executionLog: string[] = [];

    while (currentNodeId) {
      const currentNode = nodes.find((n: { id: string }) => n.id === currentNodeId);
      if (!currentNode) break;

      executionLog.push(`🔍 Evaluating Node: "${currentNode.data.label}"`);

      // 1. Execute AI Decision Step via OpenAI
      const decision = await step.run(`ai-node-${currentNodeId}`, async () => {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
          return Math.random() > 0.5 ? "YES" : "NO";
        }

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a binary decision engine. Read the prompt and input data. You must respond with EXACTLY one word: either 'YES' or 'NO' and nothing else.",
            },
            {
              role: "user",
              content: `Prompt: ${currentNode.data.prompt}\n\nInput Data: ${JSON.stringify(inputData)}`,
            },
          ],
          temperature: 0.0,
        });

        const text = response.choices[0].message.content?.trim().toUpperCase() || "NO";
        return text.includes("YES") ? "YES" : "NO";
      });

      executionLog.push(`👉 Result for "${currentNode.data.label}": ${decision}`);

      // 2. Find outgoing edge matching the decision handle ('yes' or 'no')
      const outgoingEdge = edges.find(
        (edge: { source: string; sourceHandle?: string; target: string }) => 
          edge.source === currentNodeId && 
          edge.sourceHandle?.toLowerCase() === decision.toLowerCase()
      );

      if (!outgoingEdge) {
        executionLog.push(`🛑 Workflow terminated: No outgoing '${decision}' path found.`);
        break;
      }

      currentNodeId = outgoingEdge.target;
    }

    return { success: true, executionLog };
  }
);