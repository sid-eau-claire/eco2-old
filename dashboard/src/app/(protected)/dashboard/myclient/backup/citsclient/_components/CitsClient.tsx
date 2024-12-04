import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import {motion} from 'framer-motion';

const CitsClientList = ({ records }: { records: any[] }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(0);
  const variants = {
    hidden: { opacity: 0, x: -200, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: -100 },
  };

  const filteredRecords = useMemo(() => {
    return records?.filter(record => {
      // Here, implement the logic for filtering records based on the search term.
      // This example checks if the search term is included in the full name or email.
      // Adjust according to your needs.
      const fullName = `${record.first_name} ${record.last_name}`.toLowerCase();
      return  fullName.includes(search.toLowerCase()) || 
              record.email_address?.toLowerCase().includes(search.toLowerCase()) ||
              record.occupation?.toLowerCase().includes(search.toLowerCase()) ||
              record.city?.toLowerCase().includes(search.toLowerCase());
    });
  }, [records, search]);

  const columns = useMemo(() => [
    {
      accessorFn: (row: any) => `${row.first_name} ${row.last_name}`,
      id: 'fullName',
      header: () => <span>Full Name</span>,
      cell: (info: any) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: 'occupation',
      header: () => <span>Occupation</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'email_address',
      header: () => <span>Email</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'gender',
      header: () => <span>Gender</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'birth_date',
      header: () => <span>Birth Date</span>,
      cell: (info: any) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : '',
    },
    {
      accessorKey: 'city',
      header: () => <span>City</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'state_code',
      header: () => <span>State Code</span>,
      cell: (info: any) => info.getValue(),
    },
    // Add more columns as needed
  ], []);
    
  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  return (
    <motion.div className='container mx-auto p-0 relative'
      initial="opacity: 0"
      animate="opacity: 1"
      transition={{ duration: 0.4 }}
    >
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="absolute right-0 -top-16 shadow appearance-none border rounded py-1 px-3 text-grey-darker"
      />
      {filteredRecords && (
        <div className="overflow-x-auto  sm:rounded-lg mb-3 rounded-lg">
          <table className='min-w-full text-sm divide-y divide-gray-200'>
            <thead className="bg-gray-50 ">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} scope="col" className="px-3 py-2 text-left text-xs font-semibold text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:text-white">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="inline ml-2">
                          {header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaDown />) : ''}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table?.getRowModel().rows.map(row => (
                <tr key={row.id} className="odd:bg-white even:bg-whiter cursor-pointer hover:bg-bodydark2 hover:text-white">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext()) }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center my-4">
            <div className='ml-4'>
              <button onClick={() => setPageIndex(old => Math.max(old - 1, 0))} disabled={pageIndex === 0} className="text-lg p-1 mr-2">
                <MdSkipPrevious size={30} />
              </button>
              <button onClick={() => setPageIndex(old => old < table.getPageCount() - 1 ? old + 1 : old)} disabled={pageIndex === table.getPageCount() - 1} className="text-lg p-1">
                <MdSkipNext size={30} />
              </button>
            </div>
              <span>Page <strong>{pageIndex + 1} of {table.getPageCount()}</strong></span>
            <div className='mr-4'>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="ml-2">
                {[10, 20, 30, 40, 50].map(size => (
                  <option key={size} value={size}>Show {size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CitsClientList;
