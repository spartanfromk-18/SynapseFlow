'use client';

import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AIDecisionNode } from './AIDecisionNode';
import { CustomNodeType } from '@/types/workflow';
import { Plus, Play, Terminal, CheckCircle2 } from 'lucide-react';

const nodeTypes = {
  aiDecision: AIDecisionNode,
};

const initialNodes: CustomNodeType[] = [
  {
    id: '1',
    type: 'aiDecision',
    position: { x: 250, y: 100 },
    data: {
      label: 'Initial Classifier',
      prompt: 'Is this incoming customer request an urgent bug report?',
    },
  },
];

const initialEdges: Edge[] = [];

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [logs, setLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = () => {
    const newNode: CustomNodeType = {
      id: `${nodes.length + 1}`,
      type: 'aiDecision',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 150 },
      data: {
        label: `Decision Node ${nodes.length + 1}`,
        prompt: 'Evaluate whether...',
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const runWorkflowExecution = async () => {
    setIsExecuting(true);
    setLogs(['🚀 Dispatching workflow event to Inngest engine...']);

    try {
      const res = await fetch('/api/inngest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'workflow/run',
          data: {
            nodes,
            edges,
            inputData: { query: "User inquiry regarding billing error and login failure." }
          }
        })
      });

      const data = await res.json();
      setLogs((prev) => [
        ...prev,
        '✅ Workflow triggered successfully!',
        `📡 Event ID: ${data.ids?.[0] || 'Dispatched'}`,
        '👀 Check your Inngest local dev dashboard (http://localhost:8288) for live step traces!'
      ]);
    } catch (err) {
      console.error(err);
      setLogs((prev) => [...prev, '❌ Failed to execute workflow. Check server console.']);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 px-3 py-1.5 rounded-lg shadow-lg shadow-indigo-600/30">
            <span className="font-bold text-lg tracking-wider">SynapseFlow</span>
          </div>
          <span className="text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2.5 py-1 rounded-md font-medium">
            Phase 4: Polished Execution Engine
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addNode}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            <Plus className="w-4 h-4" /> Add Node
          </button>
          <button
            onClick={runWorkflowExecution}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-emerald-600/20"
          >
            <Play className="w-4 h-4 fill-white" /> {isExecuting ? 'Running...' : 'Execute Workflow'}
          </button>
        </div>
      </header>

      {/* Main Workspace + Execution Console */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* React Flow Canvas */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={16} size={1} color="#334155" />
            <Controls className="bg-slate-900 border border-slate-800 rounded-lg fill-white shadow-xl" />
            <MiniMap className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl" zoomable pannable />
          </ReactFlow>
        </div>

        {/* Execution Logs Drawer Panel */}
        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-10">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/50">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Execution Console</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-xs text-slate-300 bg-slate-950/30">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Click &quot;Execute Workflow&quot; to test your AI branching graph...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="p-2 bg-slate-900/80 border border-slate-800/80 rounded-md leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
            <span>Inngest Durable Engine</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}