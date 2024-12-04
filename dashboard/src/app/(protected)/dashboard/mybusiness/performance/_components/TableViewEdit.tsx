import React, { useMemo } from 'react';
import { useReactTable, flexRender, ColumnDef } from '@tanstack/react-table';
import { FaSortAlphaDown, FaSortAlphaDownAlt } from 'react-icons/fa';
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md';
import { motion } from 'framer-motion';
import { ToolTip } from '@/components/Common/ToolTip';

type TableDataItem = {
  [key: string]: any;
}

type TableViewEditProps<T extends object> = {
  data: TableDataItem[];
  columns: ColumnDef<TableDataItem>[];
  getCoreRowModel: any;
  getPaginationRowModel: any;
  getSortedRowModel: any;
  getFilteredRowModel: any;
  pageIndex: number;
  pageSize: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  pageCount: number;
  initialSorting: any;
  search?: string;
}

const TableViewEdit = <T extends object>({
  data,
  columns,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  pageCount,
  initialSorting,
  search,
}: TableViewEditProps<T>) => {
  const [sorting, setSorting] = React.useState(initialSorting);
  const table = useReactTable({
    data: data,
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
      sorting,
    },
    onSortingChange: setSorting,
  });

  const filteredData = useMemo(() => {
    if (!search || !search.trim()) return data;
    if (search) {
      return data.filter((row) =>
        Object.values(row).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [data, search, pageSize, pageIndex]);

  const onPreviousPage = () => setPageIndex((old) => Math.max(old - 1, 0));
  const onNextPage = () => setPageIndex((old) => (old < pageCount - 1 ? old + 1 : old));
  const onPageSizeChange = (newSize: number) => setPageSize(newSize);

  return (
    <>
      <motion.div
        className="overflow-x-auto sm:rounded-lg mb-4 rounded-lg min-h-[calc(100vh-32rem)]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0, duration: 0.6 }}
      >
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                    <div className="flex flex-row">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="inline ml-2">
                          {header.column.getIsSorted()
                            ? header.column.getIsSorted() === 'desc'
                              ? <FaSortAlphaDownAlt />
                              : <FaSortAlphaDown />
                            : ''}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData && filteredData.length > 0 && table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  className="odd:bg-white even:bg-whiter dark:bg-bodydark hover:bg-bodydark1 animate-fadeIn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01, duration: 0.2 }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-0 whitespace-nowrap">
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
        </table>
      </motion.div>

      <div className="flex justify-between items-center my-4">
        <div>
          <button onClick={onPreviousPage} disabled={pageIndex === 0} className="text-lg p-1 mr-2 hover:scale-110">
            <ToolTip message="Previous">
              <MdSkipPrevious size={30} />
            </ToolTip>
          </button>
          <button onClick={onNextPage} disabled={pageIndex >= pageCount - 1} className="text-lg p-1 hover:scale-110">
            <ToolTip message="Next">
              <MdSkipNext size={30} />
            </ToolTip>
          </button>
        </div>
        <span>
          Page <strong>{pageIndex + 1} of {pageCount}</strong>
        </span>
        <ToolTip message="Rows">
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="border rounded ml-2">
            {[10, 20, 30, 40, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </ToolTip>
      </div>
    </>
  );
};

export default TableViewEdit;
