# 🧠 SynapseFlow: Visual AI Decision Workflow System

> A production-grade full-stack system combining an interactive React Flow node canvas with durable background orchestration (Inngest) and AI-driven binary decision branching (OpenAI).

---

## 🛠️ Tech Architecture & Stack

- **Frontend:** Next.js (App Router), React Flow (`@xyflow/react`), Tailwind CSS, Lucide Icons
- **Backend Orchestration:** Inngest (Durable event-driven background functions, reliable step retries, state tracking)
- **AI Engine:** OpenAI SDK (`gpt-4o-mini`, strict binary classification `YES`/`NO` prompts)

---

## 📂 Project Structure

```text
SynapseFlow/
├── app/
│   ├── api/inngest/route.ts   # Inngest serving endpoint for Next.js
│   └── page.tsx               # Main entry point rendering the workflow canvas
├── components/
│   └── workflow/
│       ├── AIDecisionNode.tsx # Custom React Flow node with prompt editor & handles
│       └── FlowCanvas.tsx     # Interactive canvas, toolbar, & execution console
├── lib/
│   └── inngest/
│       ├── client.ts          # Inngest client initialization
│       └── functions.ts       # Durable workflow graph traversal & AI execution logic
└── types/
    └── workflow.ts            # TypeScript interfaces for nodes and graph data
