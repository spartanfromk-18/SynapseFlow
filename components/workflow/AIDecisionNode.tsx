import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AIDecisionNodeData } from '@/types/workflow';
import { BrainCircuit } from 'lucide-react';

export const AIDecisionNode = memo(({ id, data }: NodeProps<AIDecisionNodeData>) => {
  return (
    <div className="bg-slate-900 border border-slate-700 text-white rounded-xl shadow-xl p-4 w-80">
      {/* Input Handle */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500 rounded-full" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
        <BrainCircuit className="w-5 h-5 text-indigo-400" />
        <span className="font-semibold text-sm tracking-wide">{data.label || 'AI Decision Node'}</span>
      </div>

      {/* Prompt Configuration */}
      <div className="space-y-1">
        <label className="text-xs text-slate-400 font-medium">AI Prompt / Question</label>
        <textarea
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none h-20"
          value={data.prompt}
          onChange={(e) => {
            // Update node data logic will go here
            data.prompt = e.target.value;
          }}
          placeholder="e.g., Is this customer inquiry urgent?"
        />
      </div>

      {/* Branching Output Handles (YES / NO) */}
      <div className="flex justify-between mt-4 pt-2 border-t border-slate-800 text-xs font-semibold">
        <div className="relative flex items-center">
          <span className="text-emerald-400">YES</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: '20%' }}
            className="w-3 h-3 bg-emerald-500 rounded-full !top-6"
          />
        </div>
        <div className="relative flex items-center">
          <span className="text-rose-400">NO</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: '80%' }}
            className="w-3 h-3 bg-rose-500 rounded-full !top-6"
          />
        </div>
      </div>
    </div>
  );
});

AIDecisionNode.displayName = 'AIDecisionNode';