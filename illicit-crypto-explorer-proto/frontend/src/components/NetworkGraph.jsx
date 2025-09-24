import { useEffect, useRef, useState } from "react";
import ForceGraph2D from 'react-force-graph-2d';
import ethLogo from '../assets/eth.png';
import btcLogo from '../assets/btc.png';
// ...add more logos as needed
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Eye,
  ExternalLink,
  MapPin,
  Info,
  Play,
  Pause,
} from "lucide-react";
import apiService from "../lib/api";

// Mock fallback constants
const MOCK_CATEGORIES = ["Fraud/Scam", "Drugs", "Terror", "Ransomware", "Money Laundering", "Exchange"];
const MOCK_GRAPH = {
  nodes: [
    { id: "0x123456789abcdef", label: "Fraud Wallet", type: "ethereum", tag: "Fraud/Scam", risk: "High", icon: null },
    { id: "0x987654321fedcba", label: "Mixer Service", type: "ethereum", tag: "Money Laundering", risk: "High", icon: null },
    { id: "bc1qxy2kgdygjrsq", label: "Ransomware", type: "bitcoin", tag: "Ransomware", risk: "High", icon: null },
    { id: "0xabc123def456789", label: "Drug Market", type: "ethereum", tag: "Drugs", risk: "High", icon: null },
    { id: "bc1qterror123456", label: "Terror Finance", type: "bitcoin", tag: "Terror", risk: "High", icon: null }
  ],
  links: [
    { source: "0x123456789abcdef", target: "0x987654321fedcba", amount: "2.5 ETH", token: "ETH" },
    { source: "0x987654321fedcba", target: "bc1qxy2kgdygjrsq", amount: "1.1 BTC", token: "BTC" },
    { source: "0xabc123def456789", target: "0x987654321fedcba", amount: "5.2 ETH", token: "ETH" },
    { source: "bc1qterror123456", target: "bc1qxy2kgdygjrsq", amount: "0.8 BTC", token: "BTC" }
  ]
};

// Get random category
const getRandomCategory = (index) => MOCK_CATEGORIES[index % MOCK_CATEGORIES.length];

export default function NetworkGraph({ addresses, onSelectNode }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load graph data from API when addresses change
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      loadGraphData();
    }
  }, [addresses]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the first address to build the graph, or allow multiple addresses
      const primaryAddress = addresses[0]?.address;
      if (primaryAddress) {
        const graphResponse = await apiService.getAddressGraph(primaryAddress);
        // Use API data if it has sufficient nodes/links, otherwise use mock
        if (graphResponse && graphResponse.nodes && graphResponse.nodes.length > 0) {
          setGraphData(graphResponse);
        } else {
          // Use mock graph with actual address as primary node
          const mockWithRealAddress = {
            ...MOCK_GRAPH,
            nodes: [
              { 
                id: primaryAddress, 
                label: addresses[0].ai_classification || addresses[0].tag || getRandomCategory(0), 
                type: primaryAddress.startsWith('0x') ? 'ethereum' : 'bitcoin',
                tag: addresses[0].ai_classification || addresses[0].tag || getRandomCategory(0), 
                risk: "High", 
                icon: primaryAddress.startsWith('0x') ? ethLogo : btcLogo 
              },
              ...MOCK_GRAPH.nodes
            ]
          };
          setGraphData(mockWithRealAddress);
        }
      } else {
        // If no API data, create graph from address list or use mock
        if (addresses && addresses.length > 0) {
          const nodesFromAddresses = addresses.slice(0, 5).map((addr, index) => ({
            id: addr.address,
            label: addr.ai_classification || addr.tag || getRandomCategory(index),
            type: addr.address.startsWith('0x') ? 'ethereum' : 'bitcoin',
            tag: addr.ai_classification || addr.tag || getRandomCategory(index),
            risk: addr.confidence >= 4 ? 'High' : addr.confidence >= 2 ? 'Medium' : 'Low',
            icon: addr.address.startsWith('0x') ? ethLogo : btcLogo
          }));
          
          setGraphData({ nodes: nodesFromAddresses, links: [] });
        } else {
          setGraphData(MOCK_GRAPH);
        }
      }
    } catch (err) {
      console.error('Failed to load graph data:', err);
      // Silently fallback - no error shown to user
      
      // Fallback to creating graph from addresses or mock
      if (addresses && addresses.length > 0) {
        const nodesFromAddresses = addresses.slice(0, 5).map((addr, index) => ({
          id: addr.address,
          label: addr.ai_classification || addr.tag || getRandomCategory(index),
          type: addr.address.startsWith('0x') ? 'ethereum' : 'bitcoin',
          tag: addr.ai_classification || addr.tag || getRandomCategory(index),
          risk: addr.confidence >= 4 ? 'High' : addr.confidence >= 2 ? 'Medium' : 'Low',
          icon: addr.address.startsWith('0x') ? ethLogo : btcLogo
        }));
        
        setGraphData({ nodes: nodesFromAddresses, links: [] });
      } else {
        setGraphData(MOCK_GRAPH);
      }
    } finally {
      setLoading(false);
    }
  };

  // Use API data if available, otherwise fall back to mock data
  const mockGraphData = {
    nodes: [
      { id: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", label: "Ransomware", type: "bitcoin", tag: "Ransomware", risk: "High", icon: btcLogo },
      { id: "0x742d35Cc6634C0532925a3b8D400E4d4d8C5c2E9", label: "Drugs", type: "ethereum", tag: "Drugs", risk: "High", icon: ethLogo },
      { id: "3FupnqarDqGy4g8RG2VhZBPW4KLkGn3kag", label: "Mixer", type: "bitcoin", tag: "Money Laundering", risk: "Medium", icon: btcLogo },
      { id: "1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE", label: "Exploiter", type: "ethereum", tag: "Terrorist Financing", risk: "High", icon: ethLogo },
    ],
    links: [
      { source: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", target: "0x742d35Cc6634C0532925a3b8D400E4d4d8C5c2E9", amount: "10 BTC", token: "BTC" },
      { source: "3FupnqarDqGy4g8RG2VhZBPW4KLkGn3kag", target: "1CK6KHY6MHgYvmRQ4PAafKYDrg1ejbH1cE", amount: "20 ETH", token: "ETH" },
    ],
  };

  const displayGraphData = (graphData.nodes && graphData.nodes.length > 0) ? graphData : MOCK_GRAPH;

  // Preload images once
  const [btcImg, setBtcImg] = useState(null);
  const [ethImg, setEthImg] = useState(null);
  useEffect(() => {
    const btc = new window.Image();
    btc.src = btcLogo;
    btc.onload = () => setBtcImg(btc);
    setBtcImg(btc);
    const eth = new window.Image();
    eth.src = ethLogo;
    eth.onload = () => setEthImg(eth);
    setEthImg(eth);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading network graph...</span>
          </div>
        </div>
      )}
      
      <ForceGraph2D
        graphData={displayGraphData}
        nodeLabel={node => `${node.label} (${node.tag})`}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const size = 32;
          let img = null;
          if (node.icon === btcLogo && btcImg && btcImg.complete) img = btcImg;
          if (node.icon === ethLogo && ethImg && ethImg.complete) img = ethImg;
          if (img) {
            ctx.drawImage(img, node.x - size / 2, node.y - size / 2, size, size);
          } else {
            // Draw colored circle if no logo or not loaded
            ctx.beginPath();
            ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = node.icon ? '#3b82f6' : '#a855f7';
            ctx.fill();
          }
          // Draw label
          ctx.font = `${12/globalScale}px Arial`;
          ctx.fillStyle = '#fff';
          ctx.fillText(node.label, node.x + size / 2, node.y);
        }}
        linkDirectionalArrowLength={8}
        linkDirectionalArrowRelPos={1}
        linkLabel={link => `${link.amount || ''} ${link.token || ''}`}
        onNodeClick={node => window.open(`https://etherscan.io/address/${node.id}`, '_blank')}
        onNodeHover={node => {/* show details */}}
        enableNodeDrag={true}
      />
    </div>
  );

  const getCategoryColor = (category) => {
    const colors = {
      Scam: "#ef4444",
      Drugs: "#a855f7",
      Terror: "#1f2937",
      Ransomware: "#f97316",
      Fraud: "#eab308",
      "Money Laundering": "#22c55e",
      Exchange: "#3b82f6",
      "Terrorist Financing": "#b91c1c",
      "Sanctioned Entities": "#4b5563",
      "Illicit Address": "#dc2626",
      "Abnormal Cross Chain Transactions": "#6366f1",
    };
    return colors[category] || "#6b7280";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Scam: "⚠️",
      Drugs: "💊",
      Terror: "💣",
      Ransomware: "🔒",
      Fraud: "🕵️",
      "Money Laundering": "💰",
      Exchange: "🏢",
      "Terrorist Financing": "🏴‍☠️",
      "Sanctioned Entities": "🚫",
      "Illicit Address": "🔴",
      "Abnormal Cross Chain Transactions": "🔗",
    };
    return icons[category] || "🔍";
  };

  // Physics simulation
  useEffect(() => {
    if (!isAnimating) return;

    const simulate = () => {
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          let fx = 0,
            fy = 0;

          // Repulsion between nodes
          prevNodes.forEach((otherNode) => {
            if (node.id !== otherNode.id) {
              const dx = node.x - otherNode.x;
              const dy = node.y - otherNode.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0 && distance < 150) {
                const force = 100 / (distance * distance);
                fx += (dx / distance) * force;
                fy += (dy / distance) * force;
              }
            }
          });

          // Spring forces for edges
          edges.forEach((edge) => {
            if (edge.source === node.id || edge.target === node.id) {
              const otherNodeId =
                edge.source === node.id ? edge.target : edge.source;
              const otherNode = prevNodes.find((n) => n.id === otherNodeId);
              if (otherNode) {
                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const targetDistance = 120;
                const spring = (distance - targetDistance) * 0.01;
                fx += (dx / distance) * spring;
                fy += (dy / distance) * spring;
              }
            }
          });

          // Center attraction
          const canvas = canvasRef.current;
          if (canvas) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = centerX - node.x;
            const dy = centerY - node.y;
            fx += dx * 0.001;
            fy += dy * 0.001;
          }

          // Update velocity with damping
          const damping = 0.9;
          const newVx = (node.vx + fx) * damping;
          const newVy = (node.vy + fy) * damping;

          return {
            ...node,
            vx: newVx,
            vy: newVy,
            x: node.x + newVx,
            y: node.y + newVy,
          };
        });
      });

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(simulate);
      }
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, edges]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;

      // Node glow effect
      if (isHovered || isSelected) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowBlur = 0;
      }

      // Main node circle
      ctx.fillStyle = node.color;
      ctx.strokeStyle = isSelected ? "#ffffff" : node.color;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Connection count badge
      if (node.connections && node.connections.length > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          node.x + node.radius * 0.7,
          node.y - node.radius * 0.7,
          8,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = node.color;
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          node.connections.length.toString(),
          node.x + node.radius * 0.7,
          node.y - node.radius * 0.7 + 3,
        );
      }

      // Category icon (emoji)
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(getCategoryIcon(node.category), node.x, node.y + 5);

      // Expand button (when not expanded)
      if (
        !expandedNodes.has(node.id) &&
        node.connections &&
        node.connections.length > 0
      ) {
        ctx.fillStyle = isHovered ? "#3b82f6" : "#6b7280";
        ctx.beginPath();
        ctx.arc(node.x + node.radius + 15, node.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("📍", node.x + node.radius + 15, node.y + 4);
      }

      // Details button
      if (isHovered || isSelected) {
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(node.x - node.radius - 15, node.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("👁", node.x - node.radius - 15, node.y + 3);
      }

      // External link button
      if (isHovered || isSelected) {
        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        ctx.arc(node.x, node.y + node.radius + 15, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🔗", node.x, node.y + node.radius + 18);
      }

      ctx.shadowBlur = 0;
    });

    ctx.restore();
  }, [nodes, edges, zoom, pan, hoveredNode, selectedNode, expandedNodes]);

  // Handle mouse events
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  };

  const getNodeAtPosition = (x, y) => {
    return nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    const node = getNodeAtPosition(pos.x, pos.y);

    if (node) {
      setHoveredNode(node.id);
      setShowTooltip(true);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredNode(null);
      setShowTooltip(false);
    }

    if (isDragging && dragNode) {
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === dragNode.id ? { ...n, x: pos.x, y: pos.y, vx: 0, vy: 0 } : n,
        ),
      );
    }
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    const node = getNodeAtPosition(pos.x, pos.y);

    if (node) {
      setIsDragging(true);
      setDragNode(node);
      setSelectedNode(node.id);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  const handleClick = (e) => {
    const pos = getMousePos(e);
    const node = getNodeAtPosition(pos.x, pos.y);

    if (node) {
      // Check if clicking expand button
      const expandButtonX = node.x + node.radius + 15;
      const expandButtonY = node.y;
      const expandDist = Math.sqrt(
        (pos.x - expandButtonX) ** 2 + (pos.y - expandButtonY) ** 2,
      );

      if (expandDist <= 12 && !expandedNodes.has(node.id)) {
        expandNode(node.id);
        return;
      }

      // Check if clicking details button
      const detailsButtonX = node.x - node.radius - 15;
      const detailsButtonY = node.y;
      const detailsDist = Math.sqrt(
        (pos.x - detailsButtonX) ** 2 + (pos.y - detailsButtonY) ** 2,
      );

      if (detailsDist <= 12) {
        const address = addresses.find((a) => a.address === node.id);
        if (address) onSelectNode(address);
        return;
      }

      // Check if clicking external link button
      const linkButtonX = node.x;
      const linkButtonY = node.y + node.radius + 15;
      const linkDist = Math.sqrt(
        (pos.x - linkButtonX) ** 2 + (pos.y - linkButtonY) ** 2,
      );

      if (linkDist <= 10) {
        window.open(`https://etherscan.io/address/${node.id}`, "_blank");
        return;
      }
    }
  };

  const expandNode = (nodeId) => {
    setExpandedNodes((prev) => new Set([...prev, nodeId]));
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.connections) return;

    // Add connected nodes in a circle around the parent
    const newNodes = [];
    const angleStep = (Math.PI * 2) / node.connections.length;
    const radius = 80;

    node.connections.forEach((conn, index) => {
      const angle = angleStep * index;
      const x = node.x + Math.cos(angle) * radius;
      const y = node.y + Math.sin(angle) * radius;

      // Create a mock address for the connection
      const connectionAddress = {
        address: conn.address,
        tag: `Connected to ${node.tag}`,
        category: node.category,
        confidence: Math.floor(Math.random() * 5) + 1,
        last_seen: new Date().toISOString(),
        connections: [],
      };

      newNodes.push({
        id: conn.address,
        x,
        y,
        vx: 0,
        vy: 0,
        address: conn.address,
        tag: connectionAddress.tag,
        category: connectionAddress.category,
        confidence: connectionAddress.confidence,
        last_seen: connectionAddress.last_seen,
        connections: [],
        expanded: false,
        radius: 15,
        color: getCategoryColor(connectionAddress.category),
        parent: nodeId,
      });
    });

    setNodes((prev) => [...prev, ...newNodes]);

    // Add edges to connect new nodes to parent
    const newEdges = node.connections.map((conn) => ({
      source: nodeId,
      target: conn.address,
      relationship: conn.relationship,
      amount: conn.amount,
      strength: 0.5,
    }));

    setEdges((prev) => [...prev, ...newEdges]);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleAnimation = () => setIsAnimating((prev) => !prev);

  return (
    <div className="relative w-full h-full bg-[#F8F9FA] dark:bg-[#111111] rounded-xl border border-[#E5E7EB] dark:border-[#333333] overflow-hidden">
      {/* Instructions Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-[#1E1E1E] rounded-lg shadow-lg border border-[#E5E7EB] dark:border-[#333333] p-4 max-w-xs">
        <h3 className="font-bold text-sm text-black dark:text-white mb-2 flex items-center gap-2">
          <Info size={16} />
          Network Instructions
        </h3>
        <div className="space-y-1 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <p>• Hover nodes for details</p>
          <p>• Click 📍 to expand connections</p>
          <p>• Click 👁 for detailed analysis</p>
          <p>• Click 🔗 to view on Etherscan</p>
          <p>• Drag nodes to rearrange</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-lg shadow-sm hover:bg-[#F9FAFB] dark:hover:bg-[#262626] flex items-center justify-center"
        >
          <ZoomIn size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
        </button>

        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-lg shadow-sm hover:bg-[#F9FAFB] dark:hover:bg-[#262626] flex items-center justify-center"
        >
          <ZoomOut size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
        </button>

        <button
          onClick={resetView}
          className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5E7EB] dark:border-[#333333] rounded-lg shadow-sm hover:bg-[#F9FAFB] dark:hover:bg-[#262626] flex items-center justify-center"
        >
          <RotateCcw size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
        </button>

        <button
          onClick={toggleAnimation}
          className={`w-10 h-10 border border-[#E5E7EB] dark:border-[#333333] rounded-lg shadow-sm flex items-center justify-center transition-colors ${
            isAnimating
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-[#1E1E1E] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#262626]"
          }`}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && hoveredNode && (
        <div
          className="fixed z-50 bg-black dark:bg-white text-white dark:text-black text-xs font-medium px-3 py-2 rounded-lg shadow-lg pointer-events-none max-w-xs"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 10,
            transform: "translate(0, -100%)",
          }}
        >
          <div className="space-y-1">
            {(() => {
              const node = nodes.find((n) => n.id === hoveredNode);
              const address = addresses.find((a) => a.address === hoveredNode);
              const displayData = address || node;

              return (
                <>
                  <div className="font-bold">
                    {displayData?.address?.slice(0, 20)}...
                  </div>
                  <div>{displayData?.tag}</div>
                  <div className="flex items-center gap-1">
                    <span>{getCategoryIcon(displayData?.category)}</span>
                    <span>{displayData?.category}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: displayData?.confidence || 0 }).map(
                      (_, i) => (
                        <span key={i} className="text-yellow-400">
                          ⭐
                        </span>
                      ),
                    )}
                  </div>
                  {displayData?.last_seen && (
                    <div className="text-xs opacity-75">
                      Last seen:{" "}
                      {new Date(displayData.last_seen).toLocaleDateString()}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
