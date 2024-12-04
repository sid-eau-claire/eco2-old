import React, {useMemo} from 'react';
import { useReactTable, flexRender, ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel  } from '@tanstack/react-table';

import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { motion } from 'framer-motion';
import {ToolTip} from '@/components/Common/ToolTip';
import { twMerge } from 'tailwind-merge';

// Updated props to include onRefresh
type GenericTableProps<T extends Record<string, unknown>> = {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  search: string;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (newSize: number) => void;
  onRefresh: () => void; // New callback for refresh
  className?: string;
};

function GenericTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  search,
  pageIndex,
  pageSize,
  pageCount,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  onRefresh, // Using the new refresh callback
  className,
}: GenericTableProps<T>) {

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((row) =>
      Object.values(row).some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, pageSize, pageIndex]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount,
  });
  // console.log('data', data)
  
  return (
    <div className="mx-auto py-1 relative">
      <div className="overflow-x-auto sm:rounded-lg rounded-lg">
        {/* <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={() => onRefresh()} // Trigger refresh on search change
          className="border p-2 mb-4"
        /> */}
        <table className='min-w-full text-sm divide-y divide-gray-200 mb-4'>
          <thead className="bg-gray-50">
          {data && table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} >
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-3 py-2 text-left text-xs font-semibold text-black uppercase tracking-wider dark:text-white">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
              table.getRowModel().rows.map((row, index) => (
                <motion.tr key={row.id} className="odd:bg-white even:bg-whiter  dark:bg-bodydark hover:bg-bodydark1 animate-fadeIn"
                  initial={{ opacity: 0}}
                  animate={{ opacity: 1}}
                  transition={{ delay: index * 0.01 , duration: 0.2}}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr className=''>
                <td colSpan={columns.length} className="text-lg text-center py-16">
                  No record found!!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center my-0">
        <div>
            <button onClick={onPreviousPage} disabled={pageIndex === 0} className="text-lg p-1 mr-2 hover:scale-110">
              <ToolTip message='Previous'>
                <MdSkipPrevious size={28} />
              </ToolTip>
            </button>
            <button onClick={onNextPage} disabled={pageIndex >= pageCount - 1} className="text-lg p-1 hover:scale-110">
              <ToolTip message='Next'>
                <MdSkipNext size={28} />
              </ToolTip>
            </button>
        </div>
        <span>Page <strong>{pageIndex + 1} of {pageCount}</strong></span>
        <ToolTip message='No of records per pages' hintHPos='-5rem'>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="border rounded ml-2 px-3 py-1">
            {[10, 20, 30, 40, 50, 100, 1000].map(size => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </ToolTip>
      </div>
    </div>
  );
}

export default GenericTable;
