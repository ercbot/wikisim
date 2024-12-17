import { useCallback, useLayoutEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WikiGraphData } from '../types';

interface WikiGraphProps {
  pages: WikiGraphData;
  currentPage: string;
  onNodeClick: (topic: string) => void;
}

// Create a wrapper component that uses the hooks
const GraphComponent = ({ pages, currentPage, onNodeClick }: WikiGraphProps) => {
  const { fitView } = useReactFlow();

  // Create nodes and edges from pages
  const createNodesAndEdges = useCallback(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Calculate radius based on number of nodes
    const nodeCount = Object.keys(pages).length;
    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 
      Math.min(window.innerHeight / 4, window.innerWidth / 2) : 
      200;

    // Create nodes in a circle
    Object.values(pages).forEach((page, index) => {
      const angle = (index * (2 * Math.PI / nodeCount));
      const isActive = page.topic === currentPage;
      
      nodes.push({
        id: page.topic,
        data: { 
          label: page.topic,
          isActive: isActive
        },
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },
        style: {
          background: isActive ? '#5cff3b' : '#e0e0e0',
          color: '#000000',
          border: '1px solid #000000',
          padding: 4,
          fontSize: isMobile ? '12px' : '14px',
          width: 'auto',
          maxWidth: isMobile ? '120px' : '200px',
          transition: 'background-color 0.3s ease',
        },
      });

      // Create edges from outlinks
      page.outlinks.forEach(target => {
        if (pages[target]) {
          edges.push({
            id: `${page.topic}-${target}`,
            source: page.topic,
            target,
            style: { stroke: '#000000' },
            type: 'straight', // straight edge style
            markerEnd: {
              type: MarkerType.Arrow,
              width: 10,
              height: 10,
              color: '#000000',
            },
          });
        }
      });
    });

    return { nodes, edges };
  }, [pages, currentPage]);

  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges();
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  // Update nodes when currentPage changes
  useLayoutEffect(() => {
    const { nodes: newNodes } = createNodesAndEdges();
    setNodes(newNodes);
  }, [currentPage, createNodesAndEdges, setNodes]);

  // Refit view on resize and initial load
  useLayoutEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 0);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [fitView]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background />
        <Controls 
          position="bottom-right"
          style={{ bottom: 100 }} // Move above the action buttons
        />
      </ReactFlow>
    </div>
  );
};

// Main component that provides the ReactFlow context
const WikiGraph = (props: WikiGraphProps) => {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <GraphComponent {...props} />
      </div>
    </ReactFlowProvider>
  );
};

export default WikiGraph; 