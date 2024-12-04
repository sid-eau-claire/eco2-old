import React, { useState, useMemo, useEffect } from 'react';
import { useReactTable, flexRender, ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { motion } from 'framer-motion';
import { ToolTip } from '@/components/Common/ToolTip'; // Ensure you have this component
import { formatCurrency } from '@/lib/format';

// You might need to adjust the types based on your data structure
type TableDataItem = {
  [key: string]: any;
}

type TableViewCacheProps<T extends object> = {
  data: T[];
  columns: ColumnDef<T>[];
  pageIndex?: number;
  pageSize?: number;
  setPageIndex?: (index: number) => void;
  setPageSize?: (size: number) => void;
  pageCount?: number;
  initialSorting?: any;
  search?: string;
}

const TableViewCache = <T extends object>({
  data,
  columns,
  pageIndex: initialPageIndex = 0,
  pageSize: initialPageSize = 10,
  setPageIndex,
  setPageSize,
  pageCount: initialPageCount,
  initialSorting,
  search,
}: TableViewCacheProps<T>) => {
  const [localPageIndex, setLocalPageIndex] = useState(initialPageIndex);
  const [localPageSize, setLocalPageSize] = useState(initialPageSize);
  const [localPageCount, setLocalPageClaim] = useState(initialPageCount ?? Math.ceil(data.length / initialPageSize));
  const [sorting, setSorting] = useState(initialSorting);

  useEffect(() => {
    setLocalPageClaim(Math.ceil(data.length / localPageSize));
  }, [data.length, localPageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex: localPageIndex,
        pageSize: localPageSize,
      },
      sorting,
    },
    onSortingChange: setSorting,
  });

  const filteredData = useMemo(() => {
    if (!search || !search.trim()) return data;
    return data.filter((row) =>
      Object.values(row).some(
        value => typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  // Handlers for pagination
  const onPreviousPage = () => {
    const newIndex = Math.max(localPageIndex - 1, 0);
    setPageIndex ? setPageIndex(newIndex) : setLocalPageIndex(newIndex);
  };
  const onNextPage = () => {
    const newIndex = localPageIndex < localPageCount - 1 ? localPageIndex + 1 : localPageIndex;
    setPageIndex ? setPageIndex(newIndex) : setLocalPageIndex(newIndex);
  };
  const onPageSizeChange = (newSize: number) => {
    setPageSize ? setPageSize(newSize) : setLocalPageSize(newSize);
  };
  const columnTotals = useMemo(() => {
    const totals: any = {};
    columns.forEach((column: any) => {
      if (column.aggregate) {
        totals[column.accessor] = data.reduce((sum, item: any) => {
          const value = parseFloat(item[column.accessor]);
          return sum + (isNaN(value) ? 0 : value);
        }, 0).toFixed(2); 
      }
    });
    return totals;
  }, [data, columns]);
  

  return (
    <motion.div className="overflow-x-auto sm:rounded-lg mb-2 rounded-lg min-h-[calc(100vh-32rem)]"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{delay: 0, duration: 0.6 }}
    >
      <table className='min-w-full text-sm divide-y divide-gray-200 mb-4'>
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} >
              {headerGroup.headers.map(header => (
                <th
                key={header.id}
                className="px-3 py-2 text-left text-xs font-semibold text-black uppercase tracking-wider dark:text-white cursor-pointer"
                onClick={(event) => {
                  const toggleSorting = header.column.getToggleSortingHandler();
                  if (toggleSorting) {
                    toggleSorting(event);
                  }
                }}
              >
                <div className='flex flex-row'>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanSort() && (
                  <span className="inline ml-2">
                    {header.column.getIsSorted() 
                      ? header.column.getIsSorted() === 'desc' 
                        ? <FaSortAlphaDownAlt /> 
                        : <FaSortAlphaDown />
                      : ''
                    }
                  </span>
                )}
                </div>
              </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          { filteredData && filteredData?.length > 0 && table?.getRowModel()?.rows?.length > 0 ? (
            table.getRowModel().rows.map((row, index) => (
              <motion.tr key={row.id} className="odd:bg-white even:bg-whiter  dark:bg-bodydark hover:bg-bodydark1 animate-fadeIn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 , duration: 0.2 }}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-1 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-lg text-center py-16">
                No record found!
              </td>
            </tr>
          )}
        </tbody>
        {Object.keys(columnTotals).length > 0 && (
          <tfoot>
            <tr className="bg-gray-100">
              {columns.map((column: any, index: number) => (
                <td key={column.accessor} className="px-3 py-2 font-semibold">
                  {index === 0 ? 'Total' : column.aggregate ? formatCurrency(columnTotals[column.accessor]) : ''}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
      <div className="flex justify-between items-center my-4">
        <div>
          <button onClick={onPreviousPage} disabled={localPageIndex === 0} className="text-lg p-1 mr-2 hover:scale-110">
            <ToolTip message='Previous' hintVPos='-2rem'>
              <MdSkipPrevious size={30} />
            </ToolTip>
          </button>
          <button onClick={onNextPage} disabled={localPageIndex >= localPageCount - 1} className="text-lg p-1 hover:scale-110">
            <ToolTip message='Next' hintVPos='-2rem'>
              <MdSkipNext size={30} />
            </ToolTip>
          </button>
        </div>
        <span>Page <strong>{localPageIndex + 1} of {localPageCount}</strong></span>
        <ToolTip message='Rows' hintVPos='-2rem' hintHPos='-6rem'>
          <select value={localPageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="border rounded ml-2">
            {[10, 20, 30, 40, 50, 100, 1000].map(size => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </ToolTip>
      </div>
    </motion.div>
  );
};

export default TableViewCache;
