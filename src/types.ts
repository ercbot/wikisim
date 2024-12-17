export interface WikiNode {
  topic: string;
  content: string;
  outlinks: string[];
}

export interface WikiGraphData {
  [topic: string]: WikiNode;
} 