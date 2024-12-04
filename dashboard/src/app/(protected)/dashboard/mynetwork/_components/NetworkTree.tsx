'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Graph from 'react-graph-vis';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import { motion } from "framer-motion";
import '@/app/styles/vis-network.min.css';
import NodeTable from './NodeTable';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { ImTree } from "react-icons/im";
import { BiNetworkChart } from "react-icons/bi";
import { MdOutlinePersonAdd, MdOutlinePersonOutline } from "react-icons/md";
import { getNetworkGraph } from '../_actions/network';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';

type Rank = {
  id: number;
  attributes: {
    name: string;
  };
};

type Node = {
  id: number;
  label: string;
  fullName: string; // Add fullName property
  title: string;
  rankId: number;
  image: string;
  shape: string;
  size: number;
  font: {
    color: string;
    size: number;
    face: string;
  };
  hidden: boolean;
};

type Edge = {
  from: number;
  to: number;
};

const NetworkGraph: React.FC<{ user: any }> = ({ user }) => {
  const networkRef = useRef(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [networkView, setNetworkView] = useState('tree');
  const [hierarchical, setHierarchical] = useState(false);
  const [network, setNetwork] = useState<any>({ nodes: [], edges: [] });
  const [filteredNetwork, setFilteredNetwork] = useState(network);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserImage = (id: number) => {
    const imageIndex = (id % 13) + 1;
    const paddedIndex = imageIndex.toString().padStart(2, '0');
    return `/images/user/user-${paddedIndex}.png`;
  };

  const getNodeSize = (rankId: number) => {
    const sizes = {
      1: 45,
      2: 40,
      3: 35,
      4: 30,
      5: 25,
    };
    return sizes[rankId as keyof typeof sizes] || 30;
  };

  const getNetwork = useCallback(() => {
    return networkRef.current ? (networkRef.current as any).Network : null;
  }, []);

  const zoomIn = () => {
    const networkInstance = getNetwork();
    if (networkInstance) {
      networkInstance.moveTo({ scale: networkInstance.getScale() * 1.2 });
    }
  };

  const zoomOut = () => {
    const networkInstance = getNetwork();
    if (networkInstance) {
      networkInstance.moveTo({ scale: networkInstance.getScale() / 1.2 });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchRanks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/public?collection=ranks`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setRanks(data);
        }
      } catch (e) {
        console.error("Failed to fetch ranks:", e);
        if (isMounted) {
          setError("Failed to fetch ranks. Please try again later.");
        }
      }
    };

    const fetchNetwork = async () => {
      try {
        await setNetwork({ nodes: [], edges: [] })
        setIsLoading(true);
        const response = await getNetworkGraph(user, showActiveOnly);
        console.log('getNetworkGraph response', response);
        
        if (isMounted && response?.data?.nodes?.length > 0) {
          const uniqueNodes = Array.from(
            new Map(response.data.nodes.map((node: Node) => [
              node.id, 
              {
                ...node,
                shape: 'image',
                image: getUserImage(node.id),
                size: getNodeSize(node.rankId),
                title: node.fullName || node.label, // Use fullName in tooltip if available, fallback to label
                label: undefined // Remove label from node
              }
            ])).values()
          );
          
          const uniqueEdges = Array.from(
            new Map(response.data.edges.map((edge: Edge) => [`${edge.from}-${edge.to}`, edge])).values()
          );

          setNetwork({ nodes: uniqueNodes, edges: uniqueEdges });
        } else if (isMounted) {
          setError("No network data available.");
        }
      } catch (e) {
        console.error("Failed to fetch network:", e);
        if (isMounted) {
          setError("Failed to fetch network data. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRanks();
    fetchNetwork();

    return () => {
      isMounted = false;
    };
  }, [showActiveOnly]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNetwork(network);
      return;
    }
    const nodes = network.nodes.map((node: Node) => ({
      ...node,
      borderWidth: node.title?.toLowerCase().includes(searchTerm.toLowerCase()) ? 3 : 1,
      borderColor: node.title?.toLowerCase().includes(searchTerm.toLowerCase()) ? '#FF0000' : '#2B7CE9',
    }));

    setFilteredNetwork({ ...network, nodes });
  }, [searchTerm, network, showActiveOnly]);

  const setInitialZoom = useCallback(() => {
    const networkInstance = getNetwork();
    if (networkInstance) {
      networkInstance.fit();
    }
  }, [getNetwork]);

  useEffect(() => {
    setInitialZoom();
  }, [setInitialZoom, network]);

  const options = {
    configure: { enabled: false, showButton: false },
    layout: { 
      hierarchical: hierarchical,
      improvedLayout: true,
    },
    edges: { color: '#000000' },
    nodes: {
      shape: 'image',
      borderWidth: 1,
      borderWidthSelected: 2,
      brokenImage: undefined,
      chosen: true,
      shadow: {
        enabled: true,
        color: 'rgba(0,0,0,0.3)',
        size: 10,
        x: 5,
        y: 5
      }
    },
    interaction: {
      hover: true, // Enable hover
      tooltipDelay: 200 // Delay before showing tooltip in milliseconds
    },
    height: '100%',
    width: '100%',
  };

  const events = {
    doubleClick: (event: any) => {
      const { nodes } = event;
      if (nodes.length > 0) {
        const nodeId = nodes[0];
        router.push(`/dashboard/profile/${nodeId}`);
      }
    },
  };

  if (isLoading) {
    return <div>Loading network data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <Breadcrumb pageName="Network" />
      {networkView === 'tree' && (
        <div className="relative flex flex-col gap-9">
          <input
            className="absolute top-2 left-2 z-10 rounded-md border px-2 py-1"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className='absolute top-2 right-2 bg-meta-4 rounded-md text-white px-4 py-2 z-10'
            onClick={() => setNetworkView('table')}
          >
            Table
          </button>
          <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center">
            <button
              className="mb-2 rounded-full bg-meta-4 text-white p-2 hover:bg-meta-5 transition-colors duration-150"
              onClick={zoomIn}
              aria-label="Zoom In"
            >
              <FaSearchPlus size={20} />
            </button>
            <button
              className="rounded-full bg-meta-4 text-white p-2 hover:bg-meta-5 transition-colors duration-150"
              onClick={zoomOut}
              aria-label="Zoom Out"
            >
              <FaSearchMinus size={20} />
            </button>
            <button
              className="rounded-full bg-meta-4 text-white p-2 mt-2 hover:bg-meta-5 transition-colors duration-150"
              onClick={()=>setHierarchical(!hierarchical)}
              aria-label="Toggle Hierarchical"
            >
              {hierarchical ? (
                <BiNetworkChart size={20} />
              ) : (
                <ImTree size={20} />
              )}
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="rounded-full bg-meta-4 text-white p-2 mt-2 hover:bg-meta-5 transition-colors duration-150"
                    onClick={() => setShowActiveOnly(!showActiveOnly)}
                    aria-label="Toggle Active Only"
                  >
                    {showActiveOnly ? (
                      <MdOutlinePersonOutline size={20} />
                    ) : (
                      <MdOutlinePersonAdd size={20} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {showActiveOnly ? "Show active and inactive" : "Show active only" }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {filteredNetwork.nodes.length > 0 && (
            <motion.div
              className="rounded-md shadow-md border border-stroke bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-whiten to-secondary shadow-default dark:border-strokedark dark:bg-boxdark"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="h-[calc(100vh-8.5rem)] w-full">
                <Graph
                  graph={filteredNetwork}
                  options={options}
                  events={events}
                  ref={networkRef}
                />
              </div>
            </motion.div>
          )}
        </div>
      )}
      {networkView === 'table' && (
        <NodeTable nodes={network.nodes} edges={network.edges} setNetworkView={setNetworkView} ranks={ranks} />
      )}
    </>
  );
};

export default NetworkGraph;