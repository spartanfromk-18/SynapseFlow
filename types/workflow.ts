import { Node } from '@xyflow/react';

export type NodeType = 'aiDecision';

export interface AIDecisionNodeData {
  label: string;
  prompt: string;
  [key: string]: unknown;
}

export type CustomNodeType = Node<AIDecisionNodeData, NodeType>;