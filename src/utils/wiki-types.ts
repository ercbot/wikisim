export class WikiNode {

  constructor(
    public id: string,
    public title: string | null = null,
    public content: string | null = null,
    public outlinks: string[] = []
  ) {}

  // We should really check if title and content, or bundle them somehow
  get isGenerated(): boolean {
    return this.content !== null;
  }
}

export class WikiGraph {
  private nodeMap: Map<string, WikiNode> = new Map(); // id -> node

  addNode(node: WikiNode) {
    this.nodeMap.set(node.id, node);
  }

  public getNode(node_id: string): WikiNode {
    const node = this.nodeMap.get(node_id);
    if (!node) throw new Error('Node not found');
    return node;
  }

  public hasNode(node_id: string): boolean {
    return this.nodeMap.has(node_id);
  }

  public get nodeCount(): number {
    return this.nodeMap.size;
  }

  public forEachNode(callback: (node: WikiNode, index: number) => void): void {
    let index = 0;
    this.nodeMap.forEach((node) => callback(node, index++));
  }

  public getAllNodeIds(): string[] {
    return Array.from(this.nodeMap.keys());
  }

  getLinkedNodeIds(node_id: string): string[] {
    const node = this.getNode(node_id);
    if (!node || !node.outlinks) return [];
    return node.outlinks
  }
}