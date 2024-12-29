import { useCallback, useLayoutEffect, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WikiGraph } from '../utils/wiki-types.ts';

// Assuming the components are correctly typed in their own files
import FloatingEdge from './graph/FloatingEdge.tsx';
import FloatingConnectionLine from './graph/FloatingConnectionLine.tsx';
import './graph/graph.css';

interface WikiGraphProps {
  graph: WikiGraph;
  currentPageId: string;
  onNodeClick: (topic: string) => void;
}

const edgeTypes = {
  floating: FloatingEdge,
};

// Create a wrapper component that uses the hooks
const GraphComponent = ({ graph, currentPageId, onNodeClick }: WikiGraphProps) => {
  const { fitView } = useReactFlow();
  
  // Create initial nodes
  const createInitialNodes = useCallback(() => {
    const nodes: Node[] = [];
    
    // Calculate radius based on number of nodes
    const nodeCount = graph.nodeCount;
    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 
      Math.min(window.innerHeight / 4, window.innerWidth / 2) : 
      200;
    
    graph.forEachNode((node, index) => {
      const isActive = node.id === currentPageId;
      const angle = (index / graph.nodeCount) * 2 * Math.PI;

      nodes.push({
        id: node.id,
        data: { 
          label: node.title || node.id,
          isActive: node.id === currentPageId
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
    });
    return nodes;
  }, [graph, currentPageId]);

  // Create initial edges
  const createInitialEdges = useCallback(() => {
    const edges: Edge[] = [];
    graph.forEachNode((node) => {
      node.outlinks.forEach(target => {
        if (graph.hasNode(target)) {
          edges.push({
            id: `${node.id}-${target}`,
            source: node.id,
            target,
            type: 'floating',
            style: { stroke: '#000000' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 30,
              color: '#000000',
              strokeWidth: 2,
            },
          });
        }
      });
    });
    return edges;
  }, [graph]);

  // Initialize states with created nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());

  // Update nodes when currentPage changes
  useEffect(() => {
    setNodes(nodes => nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: node.id === currentPageId
      },
      style: {
        ...node.style,
        background: node.id === currentPageId ? '#5cff3b' : '#e0e0e0',
      },
    })));
  }, [currentPageId, setNodes]);

  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

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
    <div className="w-full h-full wiki-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        nodesConnectable={false}
        connectOnClick={false}
      >
        <Background />
        <Controls 
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
};

// Main component that provides the ReactFlow context
const WikiGraphDisplay = (props: WikiGraphProps) => {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <GraphComponent {...props} />
      </div>
    </ReactFlowProvider>
  );
};

export default WikiGraphDisplay; 