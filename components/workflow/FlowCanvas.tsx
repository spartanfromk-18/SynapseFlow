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
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AIDecisionNode } from './AIDecisionNode';
import { CustomNodeType } from '@/types/workflow';
import { Plus, Play, Terminal, CheckCircle2, RefreshCcw } from 'lucide-react';

const nodeTypes: NodeTypes = {
  aiDecision: AIDecisionNode as any,
};

const initialNodes: CustomNodeType[] = [
  {
    id: '1',
    type: 'aiDecision',
    position: { x: 250, y: 100 },
    data: {
      label: 'Initial Classifier',
      prompt: 'Is this incoming customer request an urgent bug report or security issue?',
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
    setLogs([
      '🚀 Initializing SynapseFlow durable execution runner...',
      `📊 Payload compiled: ${nodes.length} nodes, ${edges.length} edges active.`
    ]);

    try {
      const res = await fetch('/api/inngest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'workflow/run',
          data: {
            nodes,
            edges,
            inputData: { query: "Urgent customer support ticket regarding database connection timeout." }
          }
        })
      });

      const textResponse = await res.text();
      const data = textResponse ? JSON.parse(textResponse) : {};

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      setLogs((prev) => [
        ...prev,
        '✅ Workflow event successfully dispatched to Inngest!',
        `📡 Run ID / Event Token: ${data.ids?.[0] || 'Dispatched'}`,
        '👀 Inspect live step executions at http://localhost:8288'
      ]);
    } catch (err: any) {
      console.error(err);
      setLogs((prev) => [...prev, `❌ Execution Failed: ${err.message || 'Check terminal server console.'}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* Top Professional Toolbar */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 rounded-lg shadow-md shadow-indigo-600/20">
            <span className="font-bold text-base tracking-wider">SynapseFlow</span>
          </div>
          <span className="text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-1 rounded-md font-medium">
            Production Graph Engine
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNodes(initialNodes);
              setEdges(initialEdges);
              setLogs([]);
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-lg text-xs font-medium transition border border-slate-700"
            title="Reset Canvas"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={addNode}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs font-medium transition border border-slate-700 shadow-sm"
          >
            <Plus className="w-4 h-4 text-indigo-400" /> Add Decision Node
          </button>
          <button
            onClick={runWorkflowExecution}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-emerald-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> {isExecuting ? 'Executing...' : 'Execute Workflow'}
          </button>
        </div>
      </header>

      {/* Main Workspace + Execution Console Split */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* React Flow Interactive Canvas */}
        <div className="flex-1 h-full bg-slate-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background gap={20} size={1} color="#1e293b" />
            <Controls className="bg-slate-900 border border-slate-800 rounded-lg fill-white shadow-xl !p-1" />
            <MiniMap 
              className="bg-slate-900/90 border border-slate-800 rounded-lg overflow-hidden shadow-xl" 
              zoomable 
              pannable 
              nodeColor="#6366f1"
              maskColor="rgba(15, 23, 42, 0.7)"
            />
          </ReactFlow>
        </div>

        {/* Enterprise Execution Logs Drawer Panel */}
        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Execution Console</h2>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Live Tracer</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2.5 font-mono text-xs text-slate-300 bg-slate-950/40">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-600">
                <Terminal className="w-8 h-8 mb-2 opacity-20 text-indigo-400" />
                <p className="italic text-xs">Click &quot;Execute Workflow&quot; to test your event-driven graph orchestration.</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900/90 border border-slate-800/80 rounded-lg leading-relaxed shadow-sm">
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-400">Inngest Durable Workers</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}