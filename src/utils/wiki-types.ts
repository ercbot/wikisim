export class WikiNode {
  public outlinks: string[];

  constructor(
    public topic: string,
    public content: string | null = null
  ) {
    this.outlinks = this.extractOutlinks();
  }

  get isGenerated(): boolean {
    return this.content !== null;
  }

  setContent(newContent: string) {
    this.content = newContent;
    this.outlinks = this.extractOutlinks();
  }

  private extractOutlinks(): string[] {
    if (!this.content) return [];
    const linkRegex = /<link>(.*?)<\/link>/g;
    const matches = [...this.content.matchAll(linkRegex)];
    return matches.map(match => match[1]);
  }
}

export class WikiGraph {
  private nodeMap: Map<string, WikiNode> = new Map();
  private aliasMap: Map<string, string> = new Map(); // alias -> topic

  addNode(node: WikiNode) {
    this.nodeMap.set(node.topic, node);
    // Just add the topic as its own alias initially
    this.aliasMap.set(node.topic, node.topic);
  }

  addAliasToNode(identifier: string, newAlias: string) {
    // First, find the topic this identifier points to
    const topic = this.aliasMap.get(identifier);
    if (!topic) {
      throw new Error(`No node found for identifier: ${identifier}`);
    }

    // Add the new alias mapping
    this.aliasMap.set(newAlias, topic);
  }

  public getNode(identifier: string): WikiNode | undefined {
    const topic = this.aliasMap.get(identifier);
    return topic ? this.nodeMap.get(topic) : undefined;
  }

  public hasNode(topic: string): boolean {
    return this.nodeMap.has(topic) || this.aliasMap.has(topic);
  }

  public get nodeCount(): number {
    return this.nodeMap.size;
  }

  public forEachNode(callback: (node: WikiNode, index: number) => void): void {
    let index = 0;
    this.nodeMap.forEach((node) => callback(node, index++));
  }

}