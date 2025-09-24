import { useState, useEffect, useRef } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Plus, Eye, ExternalLink, Expand, Minimize2 } from 'lucide-react';
import apiService from '../../../lib/api';

// Enhanced mock data for the crypto investigation network
const mockNodes = [
  {
    id: 'scam-1',
    label: 'KyberSwap Exploiter',
    address: '0x5027...a3b2',
    category: 'Scam',
    riskLevel: 'High',
    balance: '2,847.32 ETH',
    usdValue: '$4,521,892',
    chains: ['Ethereum', 'BSC'],
    lastActivity: '2024-09-20 14:23',
    position: { x: 150, y: 200 },
    connectedNodes: ['scam-1-child-1', 'scam-1-child-2', 'scam-1-child-3']
  },
  {
    id: 'bridge-1',
    label: 'Arbitrum Bridge',
    address: '0x8315...c4d9',
    category: 'Bridge',
    riskLevel: 'Low',
    balance: '125,432.1 ETH',
    usdValue: '$199,123,456',
    chains: ['Ethereum', 'Arbitrum'],
    lastActivity: '2024-09-22 09:15',
    position: { x: 400, y: 200 },
    connectedNodes: ['bridge-1-child-1', 'bridge-1-child-2', 'bridge-1-child-3']
  },
  {
    id: 'exchange-1',
    label: 'Binance Hot Wallet',
    address: '0x3f5c...e7a1',
    category: 'Exchange',
    riskLevel: 'Low',
    balance: '45,123.89 ETH',
    usdValue: '$71,598,234',
    chains: ['Ethereum', 'BSC', 'Polygon'],
    lastActivity: '2024-09-22 11:45',
    position: { x: 650, y: 200 },
    connectedNodes: ['exchange-1-child-1', 'exchange-1-child-2']
  },
  {
    id: 'wallet-1',
    label: 'Unknown Wallet',
    address: '0x1a2b...f8c3',
    category: 'Wallet',
    riskLevel: 'Medium',
    balance: '12.5 ETH',
    usdValue: '$19,850',
    chains: ['Ethereum'],
    lastActivity: '2024-09-21 16:30',
    position: { x: 400, y: 400 },
    connectedNodes: ['wallet-1-child-1', 'wallet-1-child-2']
  },
  {
    id: 'drugs-1',
    label: 'Silk Road Remnant',
    address: '0x9d8e...b4f2',
    category: 'Drugs',
    riskLevel: 'High',
    balance: '0.23 BTC',
    usdValue: '$14,720',
    chains: ['Bitcoin', 'Ethereum'],
    lastActivity: '2024-09-18 23:11',
    position: { x: 150, y: 400 },
    connectedNodes: ['drugs-1-child-1', 'drugs-1-child-2']
  },
  {
    id: 'terror-1',
    label: 'Suspicious Entity',
    address: '0x7c6a...d3e8',
    category: 'Terror',
    riskLevel: 'High',
    balance: '892.1 USDT',
    usdValue: '$892',
    chains: ['Ethereum', 'Tron'],
    lastActivity: '2024-09-19 08:42',
    position: { x: 650, y: 400 },
    connectedNodes: ['terror-1-child-1']
  }
];

// Enhanced child nodes that appear when expanding
const childNodes = {
  'scam-1-child-1': {
    id: 'scam-1-child-1',
    label: 'Tornado Cash',
    address: '0x4e89...b7c1',
    category: 'Mixer',
    riskLevel: 'High',
    balance: '15.2 ETH',
    usdValue: '$24,134',
    chains: ['Ethereum'],
    lastActivity: '2024-09-20 14:30',
    parentId: 'scam-1'
  },
  'scam-1-child-2': {
    id: 'scam-1-child-2',
    label: 'Privacy Wallet',
    address: '0x7f2a...d4e6',
    category: 'Wallet',
    riskLevel: 'Medium',
    balance: '3.8 ETH',
    usdValue: '$6,032',
    chains: ['Ethereum'],
    lastActivity: '2024-09-20 15:12',
    parentId: 'scam-1'
  },
  'scam-1-child-3': {
    id: 'scam-1-child-3',
    label: 'Binance Deposit',
    address: '0x9c3a...h5k7',
    category: 'Exchange',
    riskLevel: 'Medium',
    balance: '125.7 ETH',
    usdValue: '$199,612',
    chains: ['Ethereum'],
    lastActivity: '2024-09-20 16:45',
    parentId: 'scam-1'
  },
  'bridge-1-child-1': {
    id: 'bridge-1-child-1',
    label: 'Layer 2 Pool',
    address: '0xa1b2...c3d4',
    category: 'DeFi',
    riskLevel: 'Low',
    balance: '1,234.5 ETH',
    usdValue: '$1,958,320',
    chains: ['Arbitrum'],
    lastActivity: '2024-09-22 09:20',
    parentId: 'bridge-1'
  },
  'bridge-1-child-2': {
    id: 'bridge-1-child-2',
    label: 'Cross-chain Router',
    address: '0xe5f6...g7h8',
    category: 'Bridge',
    riskLevel: 'Low',
    balance: '567.8 ETH',
    usdValue: '$901,248',
    chains: ['Ethereum', 'Polygon'],
    lastActivity: '2024-09-22 09:25',
    parentId: 'bridge-1'
  },
  'bridge-1-child-3': {
    id: 'bridge-1-child-3',
    label: 'Yield Farm',
    address: '0xz9y8...x7w6',
    category: 'DeFi',
    riskLevel: 'Medium',
    balance: '890.1 ETH',
    usdValue: '$1,413,159',
    chains: ['Arbitrum'],
    lastActivity: '2024-09-22 08:45',
    parentId: 'bridge-1'
  },
  'exchange-1-child-1': {
    id: 'exchange-1-child-1',
    label: 'Cold Storage',
    address: '0xc1d2...e3f4',
    category: 'Storage',
    riskLevel: 'Low',
    balance: '12,345.6 ETH',
    usdValue: '$19,609,952',
    chains: ['Ethereum'],
    lastActivity: '2024-09-21 18:30',
    parentId: 'exchange-1'
  },
  'exchange-1-child-2': {
    id: 'exchange-1-child-2',
    label: 'Trading Bot',
    address: '0xg5h6...i7j8',
    category: 'Bot',
    riskLevel: 'Low',
    balance: '789.2 ETH',
    usdValue: '$1,253,824',
    chains: ['Ethereum', 'BSC'],
    lastActivity: '2024-09-22 11:50',
    parentId: 'exchange-1'
  },
  'wallet-1-child-1': {
    id: 'wallet-1-child-1',
    label: 'Secondary Wallet',
    address: '0xk9l0...m1n2',
    category: 'Wallet',
    riskLevel: 'Medium',
    balance: '25.7 ETH',
    usdValue: '$40,812',
    chains: ['Ethereum'],
    lastActivity: '2024-09-21 17:15',
    parentId: 'wallet-1'
  },
  'wallet-1-child-2': {
    id: 'wallet-1-child-2',
    label: 'DeFi Position',
    address: '0xp7q8...r9s0',
    category: 'DeFi',
    riskLevel: 'Low',
    balance: '45.2 ETH',
    usdValue: '$71,768',
    chains: ['Ethereum'],
    lastActivity: '2024-09-21 19:22',
    parentId: 'wallet-1'
  },
  'drugs-1-child-1': {
    id: 'drugs-1-child-1',
    label: 'Dark Market',
    address: '0xo3p4...q5r6',
    category: 'Drugs',
    riskLevel: 'High',
    balance: '0.15 BTC',
    usdValue: '$9,600',
    chains: ['Bitcoin'],
    lastActivity: '2024-09-18 23:45',
    parentId: 'drugs-1'
  },
  'drugs-1-child-2': {
    id: 'drugs-1-child-2',
    label: 'Conversion Service',
    address: '0xs7t8...u9v0',
    category: 'Mixer',
    riskLevel: 'High',
    balance: '2.1 ETH',
    usdValue: '$3,332',
    chains: ['Ethereum'],
    lastActivity: '2024-09-19 01:22',
    parentId: 'drugs-1'
  },
  'terror-1-child-1': {
    id: 'terror-1-child-1',
    label: 'Funding Source',
    address: '0xw1x2...y3z4',
    category: 'Terror',
    riskLevel: 'High',
    balance: '1,250 USDT',
    usdValue: '$1,250',
    chains: ['Tron'],
    lastActivity: '2024-09-19 09:15',
    parentId: 'terror-1'
  }
};

const mockEdges = [
  {
    id: 'edge-1',
    source: 'scam-1',
    target: 'bridge-1',
    amount: '2.5 ETH',
    timestamp: '2024-09-20 14:25',
    direction: 'out'
  },
  {
    id: 'edge-2',
    source: 'bridge-1',
    target: 'exchange-1',
    amount: '2.4 ETH',
    timestamp: '2024-09-20 14:27',
    direction: 'out'
  },
  {
    id: 'edge-3',
    source: 'wallet-1',
    target: 'bridge-1',
    amount: '1,200 USDT',
    timestamp: '2024-09-21 16:32',
    direction: 'out'
  },
  {
    id: 'edge-4',
    source: 'drugs-1',
    target: 'wallet-1',
    amount: '0.05 BTC',
    timestamp: '2024-09-18 23:15',
    direction: 'out'
  },
  {
    id: 'edge-5',
    source: 'terror-1',
    target: 'exchange-1',
    amount: '500 USDC',
    timestamp: '2024-09-19 08:45',
    direction: 'out'
  },
  {
    id: 'edge-6',
    source: 'scam-1',
    target: 'wallet-1',
    amount: '15.2 ETH',
    timestamp: '2024-09-20 15:10',
    direction: 'out'
  }
];

const getCategoryColor = (category) => {
  switch (category) {
    case 'Scam': return '#EF4444';
    case 'Exchange': return '#22C55E';
    case 'Wallet': return '#EAB308';
    case 'Drugs': return '#A855F7';
    case 'Terror': return '#1F2937';
    case 'Bridge': return '#3B82F6';
    case 'Mixer': return '#EC4899';
    case 'DeFi': return '#10B981';
    case 'Storage': return '#6366F1';
    case 'Bot': return '#F59E0B';
    default: return '#6B7280';
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Scam': return '⚠️';
    case 'Exchange': return '🏦';
    case 'Wallet': return '👛';
    case 'Drugs': return '💊';
    case 'Terror': return '💣';
    case 'Bridge': return '🌉';
    case 'Mixer': return '🌀';
    case 'DeFi': return '💰';
    case 'Storage': return '🔐';
    case 'Bot': return '🤖';
    default: return '⚪';
  }
};

export default function NetworkGraph({ selectedNode, onNodeClick, onNodeDoubleClick, filters, searchQuery }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(mockNodes);
  const [edges, setEdges] = useState(mockEdges);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);
  const [pulseAnimation, setPulseAnimation] = useState(new Set());
  const [loadingGraph, setLoadingGraph] = useState(false);

  // Load backend graph around selected node/address (if available)
  useEffect(() => {
    const loadGraph = async () => {
      const addr = typeof selectedNode === 'string' ? selectedNode : selectedNode?.address || selectedNode?.id;
      if (!addr) return;
      try {
        setLoadingGraph(true);
        const graph = await apiService.getAddressGraph(addr);
        if (graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges)) {
          const mappedNodes = graph.nodes.map((n, i) => ({
            id: n.id || n.address,
            label: n.label || (n.address ? `${n.address.slice(0,6)}…${n.address.slice(-4)}` : 'Node'),
            address: n.address || n.id,
            category: n.category || 'Wallet',
            riskLevel: (n.confidence || 3) >= 4 ? 'High' : (n.confidence || 3) >= 2 ? 'Medium' : 'Low',
            balance: n.balance || undefined,
            usdValue: n.usdValue || undefined,
            chains: n.chains || ['Ethereum'],
            lastActivity: n.last_seen || n.lastActivity || undefined,
            position: { x: 400 + Math.cos(i) * 220, y: 300 + Math.sin(i) * 180 },
            connectedNodes: [],
          }));

          const mappedEdges = graph.edges.map((e, idx) => ({
            id: e.id || `${e.source}-${e.target}-${idx}`,
            source: e.source,
            target: e.target,
            amount: e.amount || '',
            asset: e.asset || undefined,
            timestamp: e.timestamp || undefined,
          }));

          setNodes(mappedNodes);
          setEdges(mappedEdges);
          setExpandedNodes(new Set());
        }
      } catch (err) {
        console.warn('Graph API failed, using mock graph:', err);
        setNodes(mockNodes);
        setEdges(mockEdges);
      } finally {
        setLoadingGraph(false);
      }
    };
    loadGraph();
  }, [selectedNode]);

  // Get all visible nodes (original + expanded children)
  const allNodes = [...nodes];
  expandedNodes.forEach(nodeId => {
    const parentNode = nodes.find(n => n.id === nodeId);
    if (parentNode && parentNode.connectedNodes) {
      parentNode.connectedNodes.forEach((childId, index) => {
        if (childNodes[childId] && !allNodes.find(n => n.id === childId)) {
          const childNode = { ...childNodes[childId] };
          // Position child nodes in a circle around parent
          const angle = (index * (2 * Math.PI)) / parentNode.connectedNodes.length;
          const radius = 180;
          childNode.position = {
            x: parentNode.position.x + Math.cos(angle) * radius,
            y: parentNode.position.y + Math.sin(angle) * radius
          };
          allNodes.push(childNode);
        }
      });
    }
  });

  // Filter nodes based on filters and search
  const filteredNodes = allNodes.filter(node => {
    if (filters.category && filters.category !== 'All' && node.category !== filters.category) {
      return false;
    }
    if (filters.riskLevel && filters.riskLevel !== 'All' && node.riskLevel !== filters.riskLevel) {
      return false;
    }
    if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !node.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Create edges for expanded children
  const allEdges = [...edges];
  expandedNodes.forEach(parentId => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (parentNode && parentNode.connectedNodes) {
      parentNode.connectedNodes.forEach(childId => {
        if (childNodes[childId] && !allEdges.find(e => e.id === `${parentId}-${childId}`)) {
          allEdges.push({
            id: `${parentId}-${childId}`,
            source: parentId,
            target: childId,
            amount: Math.random() > 0.5 ? `${(Math.random() * 10).toFixed(1)} ETH` : `${(Math.random() * 1000).toFixed(0)} USDT`,
            timestamp: '2024-09-22 12:00',
            direction: 'out'
          });
        }
      });
    }
  });

  // Filter edges to only show those between visible nodes
  const filteredEdges = allEdges.filter(edge => 
    filteredNodes.some(node => node.id === edge.source) && 
    filteredNodes.some(node => node.id === edge.target)
  );

  const handleExpandNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
        // Add pulse animation
        setPulseAnimation(prev => new Set([...prev, nodeId]));
        setTimeout(() => {
          setPulseAnimation(prev => {
            const newPulse = new Set(prev);
            newPulse.delete(nodeId);
            return newPulse;
          });
        }, 1000);
      }
      return newSet;
    });
  };

  const handleMouseDown = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedNode(node);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - (node.position.x * zoom + pan.x),
      y: e.clientY - rect.top - (node.position.y * zoom + pan.y)
    });
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - pan.x - dragOffset.x) / zoom;
      const newY = (e.clientY - rect.top - pan.y - dragOffset.y) / zoom;
      
      setNodes(prev => prev.map(node => 
        node.id === draggedNode.id 
          ? { ...node, position: { x: newX, y: newY } }
          : node
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleNodeClick = (node) => {
    onNodeClick(node);
  };

  const handleNodeDoubleClick = (node) => {
    onNodeDoubleClick(node);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNodes(mockNodes);
    setEdges(mockEdges);
    setExpandedNodes(new Set());
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (draggedNode) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedNode, dragOffset, zoom, pan]);

  return (
    <div className="relative w-full h-full bg-[#0A0A0A] rounded-xl border border-[#262626] overflow-hidden">
      {/* Enhanced Graph Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 bg-[#1A1A1A] border border-[#404040] rounded-xl flex items-center justify-center hover:bg-[#262626] transition-colors shadow-lg hover:shadow-xl"
        >
          <ZoomIn size={18} className="text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 bg-[#1A1A1A] border border-[#404040] rounded-xl flex items-center justify-center hover:bg-[#262626] transition-colors shadow-lg hover:shadow-xl"
        >
          <ZoomOut size={18} className="text-white" />
        </button>
        <button
          onClick={handleReset}
          className="w-12 h-12 bg-[#1A1A1A] border border-[#404040] rounded-xl flex items-center justify-center hover:bg-[#262626] transition-colors shadow-lg hover:shadow-xl"
        >
          <RotateCcw size={18} className="text-white" />
        </button>
      </div>

      {/* Interactive Instructions */}
  <div className="absolute top-4 left-4 z-20 bg-[#1A1A1A]/90 backdrop-blur-sm border border-[#404040] rounded-xl p-4 shadow-lg max-w-xs">
  <h3 className="font-semibold text-sm text-white mb-2">Interactive Controls</h3>
  <div className="text-xs text-gray-300 space-y-1">
          <div className="flex items-center gap-2">
            <Plus size={12} className="text-blue-500" />
            <span>Click + to expand connections</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-green-500" />
            <span>Click eye for details</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink size={12} className="text-purple-500" />
            <span>Click link for blockchain explorer</span>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative cursor-grab"
        style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
      >
        {/* Render Enhanced Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {filteredEdges.map(edge => {
            const sourceNode = filteredNodes.find(n => n.id === edge.source);
            const targetNode = filteredNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);
            const isChildEdge = edge.source.includes('child') || edge.target.includes('child');

            return (
              <g key={edge.id}>
                {/* Enhanced Edge line with gradient */}
                <defs>
                  <linearGradient id={`gradient-${edge.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isHighlighted ? '#3B82F6' : '#CBD5E1'} />
                    <stop offset="100%" stopColor={isHighlighted ? '#1D4ED8' : '#9CA3AF'} />
                  </linearGradient>
                </defs>
                <line
                  x1={sourceNode.position.x + 70}
                  y1={sourceNode.position.y + 70}
                  x2={targetNode.position.x + 70}
                  y2={targetNode.position.y + 70}
                  stroke={`url(#gradient-${edge.id})`}
                  strokeWidth={isHighlighted ? 4 : isChildEdge ? 2 : 3}
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-300"
                  strokeDasharray={isChildEdge ? '8,4' : 'none'}
                  opacity={isChildEdge ? 0.7 : 1}
                />
                
                {/* Enhanced Edge label with background */}
                <g>
                  <rect
                    x={(sourceNode.position.x + targetNode.position.x) / 2 + 45}
                    y={(sourceNode.position.y + targetNode.position.y) / 2 + 45}
                    width={edge.amount.length * 8 + 16}
                    height={20}
                    fill="#262626"
                    stroke="#404040"
                    strokeWidth="1"
                    rx="10"
                    opacity="0.95"
                  />
                  <text
                    x={(sourceNode.position.x + targetNode.position.x) / 2 + 53}
                    y={(sourceNode.position.y + targetNode.position.y) / 2 + 58}
                    fill="#F3F3F3"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor="start"
                    className="font-inter"
                  >
                    {edge.amount}
                  </text>
                </g>
              </g>
            );
          })}
          
          {/* Enhanced Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="9"
              refX="11"
              refY="4.5"
              orient="auto"
            >
              <polygon points="0 0, 12 4.5, 0 9" fill="#6B7280" />
  <polygon points="0 0, 12 4.5, 0 9" fill="#F3F3F3" />
            </marker>
          </defs>
        </svg>

        {/* Render Enhanced Nodes */}
        {filteredNodes.map(node => {
          const isSelected = selectedNode && selectedNode.id === node.id;
          const isHovered = hoveredNode === node.id;
          const isExpanded = expandedNodes.has(node.id);
          const isPulsing = pulseAnimation.has(node.id);
          const hasChildren = node.connectedNodes && node.connectedNodes.length > 0;
          const color = getCategoryColor(node.category);
          const icon = getCategoryIcon(node.category);
          const isChildNode = !!node.parentId;

          return (
            <div
              key={node.id}
              className={`absolute transition-all duration-300 select-none ${
                isSelected ? 'ring-4 ring-blue-400 ring-offset-4 ring-offset-white' : ''
              } ${isHovered ? 'scale-110 z-10' : ''} ${
                isChildNode ? 'opacity-90' : ''
              } ${isPulsing ? 'animate-pulse' : ''}`}
              style={{
                left: node.position.x,
                top: node.position.y,
                transform: 'translate(0, 0)'
              }}
              onMouseEnter={() => {
                setHoveredNode(node.id);
                setTooltip({
                  node,
                  x: node.position.x + 160,
                  y: node.position.y + 70
                });
              }}
              onMouseLeave={() => {
                setHoveredNode(null);
                setTooltip(null);
              }}
            >
              {/* Enhanced Main Node Circle */}
              <div
                className="relative cursor-pointer"
                onMouseDown={(e) => handleMouseDown(e, node)}
                onClick={() => handleNodeClick(node)}
                onDoubleClick={() => handleNodeDoubleClick(node)}
              >
                {/* Outer glow effect */}
                {(isSelected || isHovered) && (
                  <div 
                    className={`absolute inset-0 ${isChildNode ? 'w-24 h-24' : 'w-36 h-36'} rounded-full blur-xl opacity-30`}
                    style={{ backgroundColor: color }}
                  />
                )}
                
                <div 
                  className={`${isChildNode ? 'w-24 h-24 border-3' : 'w-36 h-36 border-4'} rounded-full bg-white shadow-xl flex flex-col items-center justify-center relative transition-all duration-300 hover:shadow-2xl`}
                  style={{ borderColor: color }}
                >
                  {/* Enhanced Icon */}
                  <div 
                    className={`${isChildNode ? 'w-8 h-8 text-xl mb-1' : 'w-12 h-12 text-3xl mb-2'} rounded-full flex items-center justify-center text-white shadow-lg`}
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </div>
                  
                  {/* Enhanced Label */}
                  <div className={`${isChildNode ? 'text-xs px-2' : 'text-sm px-3'} font-bold text-gray-900 text-center leading-tight font-inter`}>
                    {node.label.length > (isChildNode ? 10 : 14) ? node.label.substring(0, isChildNode ? 10 : 14) + '...' : node.label}
                  </div>
                  
                  {/* Enhanced Address */}
                  <div className={`${isChildNode ? 'text-xs' : 'text-xs'} font-mono text-gray-500 mt-1`}>
                    {node.address.substring(0, 8)}...
                  </div>
                  
                  {/* Enhanced Risk indicator */}
                  <div className={`absolute -top-2 -right-2 ${isChildNode ? 'w-4 h-4' : 'w-6 h-6'} rounded-full border-3 border-white shadow-lg ${
                    node.riskLevel === 'High' ? 'bg-red-500' :
                    node.riskLevel === 'Medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  
                  {/* Connection count indicator */}
                  {hasChildren && !isChildNode && (
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold">
                      {node.connectedNodes.length}
                    </div>
                  )}
                </div>

                {/* Enhanced Interactive Buttons */}
                {!isChildNode && (
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {/* Enhanced Expand Button */}
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandNode(node.id);
                        }}
                        className={`w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                          isExpanded ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
                        }`}
                        title={isExpanded ? 'Collapse Connections' : `Expand ${node.connectedNodes.length} Connections`}
                      >
                        {isExpanded ? <Minimize2 size={14} /> : <Expand size={14} />}
                      </button>
                    )}
                    
                    {/* Enhanced View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(node);
                      }}
                      className="w-8 h-8 bg-white rounded-full border-2 border-white shadow-xl flex items-center justify-center text-green-600 hover:bg-green-50 transition-all duration-300 hover:scale-110"
                      title="View Detailed Analysis"
                    >
                      <Eye size={14} />
                    </button>
                    
                    {/* Enhanced External Link Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://etherscan.io/address/${node.address}`, '_blank');
                      }}
                      className="w-8 h-8 bg-white rounded-full border-2 border-white shadow-xl flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-110"
                      title="View on Blockchain Explorer"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Enhanced Tooltip */}
        {tooltip && (
          <div
            className="absolute z-40 bg-[#1A1A1A] text-white p-5 rounded-xl shadow-2xl min-w-72 pointer-events-none border border-[#404040]"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg shadow-lg"
                style={{ backgroundColor: getCategoryColor(tooltip.node.category) }}
              >
                {getCategoryIcon(tooltip.node.category)}
              </div>
              <div>
                <div className="font-bold text-lg">{tooltip.node.label}</div>
                <div className="text-sm text-gray-300">{tooltip.node.category}</div>
              </div>
            </div>
            <div className="text-sm font-mono mb-4 text-blue-300 bg-gray-800 p-2 rounded border">
              {tooltip.node.address}
            </div>
            <div className="text-sm space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Risk Level:</span>
                  <div className={`font-bold text-lg ${
                    tooltip.node.riskLevel === 'High' ? 'text-red-400' :
                    tooltip.node.riskLevel === 'Medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{tooltip.node.riskLevel}</div>
                </div>
                <div>
                  <span className="text-gray-400">Balance:</span>
                  <div className="font-bold text-lg">{tooltip.node.balance}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-400">USD Value:</span>
                <div className="font-bold text-xl text-green-400">{tooltip.node.usdValue}</div>
              </div>
              <div>
                <span className="text-gray-400">Chains:</span>
                <div className="flex gap-1 mt-1">
                  {tooltip.node.chains.map(chain => (
                    <span key={chain} className="px-2 py-1 bg-blue-600 rounded text-xs font-medium">
                      {chain}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-400">Last Activity:</span>
                <div className="font-medium">{tooltip.node.lastActivity}</div>
              </div>
              {tooltip.node.connectedNodes && tooltip.node.connectedNodes.length > 0 && (
                <div className="pt-3 border-t border-gray-700">
                  <span className="text-gray-400">Connected Addresses:</span>
                  <div className="font-bold text-lg text-blue-400">{tooltip.node.connectedNodes.length} addresses</div>
                  <div className="text-xs text-gray-400 mt-1">Click + to explore connections</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}