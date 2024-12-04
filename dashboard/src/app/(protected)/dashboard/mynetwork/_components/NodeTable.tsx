'use client'
import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import Link from 'next/link';
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { getProfileImage } from '@/lib/network';
import Image from 'next/image';

type Node = {
  id: number;
  title: string;
  rankId: number;
  color: string;
  font: {
    color: string;
  };
  profileImage: string;
  relationshipCount?: number;
};

type Edge = {
  from: number;
  to: number;
};

type Rank = {
  id: number;
  attributes: {
    name: string;
  };
};

type NodeTableProps = {
  nodes: Node[];
  edges: Edge[];
  setNetworkView: (view: string) => void;
  ranks: Rank[];
};

// Function to get random user image
const getRandomUserImage = (id: number): string => {
  const imageIndex = (id % 13) + 1; // This will give numbers from 1 to 13
  const paddedIndex = imageIndex.toString().padStart(2, '0'); // Pad with leading zero if needed
  return `/images/user/user-${paddedIndex}.png`;
};

const NodeTable: React.FC<NodeTableProps> = ({ nodes, edges, setNetworkView, ranks }) => {
  const [search, setSearch] = useState('');

  const getRankName = (rankId: number): string => {
    const rank = ranks.find(r => r.id === rankId);
    return rank ? rank.attributes.name : 'Unknown Rank';
  };

  const getRelatedNodes = (nodeId: number): {id: string, name: string, profileImage: string}[] => {
    const relatedEdges = edges.filter(edge => edge.from === nodeId);
    return relatedEdges.map(edge => {
      const node = nodes.find(node => node.id === edge.to);
      return {
        id: node ? node.id.toString() : 'Unknown',
        name: node ? node.title : 'Unknown Node',
        profileImage: node ? getRandomUserImage(node.id) : '/images/user/user-01.png'
      };
    });
  };

  // Add relationship count and random profile images to nodes
  const nodesWithImages = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      profileImage: getRandomUserImage(node.id),
      relationshipCount: edges.filter(edge => edge.from === node.id).length
    }));
  }, [nodes, edges]);

  const sortedFilteredNodes = useMemo(() => {
    return [...nodesWithImages]
      .sort((a, b) => (b.relationshipCount || 0) - (a.relationshipCount || 0))
      .filter(node => node.title.toLowerCase().includes(search.toLowerCase()));
  }, [nodesWithImages, search]);

  const columns = useMemo(() => [
    {
      accessorKey: 'title',
      header: () => <span>Name</span>,
      cell: (info: any) => (
        <Link href={`/dashboard/profile/${info.row.original.id}`} className="flex items-center gap-2">
          <Image 
            src={info.row.original.profileImage} 
            alt="profileImage" 
            width={50} 
            height={50} 
            className='rounded-full'
          />
          <span className="text-primary font-semibold cursor-pointer dark:text-white">
            {info.getValue()}
          </span>
        </Link>
      ),
    },
    {
      id: 'rankName',
      header: () => <span>Rank</span>,
      cell: (info: any) => (
        <div className="whitespace-pre-line text-pretty dark:text-white">
          {getRankName(info.row.original.rankId)}
        </div>
      ),
    },
    {
      id: 'relationships',
      header: () => <span>Relationships</span>,
      cell: (info: any) => {
        const relatedNodes = getRelatedNodes(info.row.original.id);
        return (
          <div className="flex flex-row items-center justify-center mb-10 w-full z-9999">
            <AnimatedTooltip items={relatedNodes.map(node => ({
              id: parseInt(node.id),
              name: node.name,
              designation: '',
              image: node.profileImage
            }))} />
          </div>
        );
      },
    },
  ], [ranks, nodesWithImages, edges]);

  const table = useReactTable({
    data: sortedFilteredNodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='container mx-auto p-0 relative'>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="my-2 shadow appearance-none border rounded py-1 px-3 text-grey-darker dark:bg-gray-700 dark:text-white"
      />
      <button 
        className='absolute top-2 right-2 bg-primary rounded-md text-white px-4 py-2 dark:bg-meta-5'
        onClick={() => setNetworkView('tree')}
      >
        Tree
      </button>
      <div className="overflow-x-auto">
        <table className='min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-white">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-black-2 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2 whitespace-nowrap dark:text-white">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodeTable;