import React, { useState, useMemo } from 'react';
import { useReactTable, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaStar } from "react-icons/fa"; // Importing FaStar as the promoted icon for demonstration
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { ProductCode } from '@/types/productCode'; // Ensure this path matches your actual import path
import { CarrierType } from '@/types/carrier'; // Ensure this path matches your actual import path
import { motion } from 'framer-motion';
import { IoMdCloseCircle } from "react-icons/io";
import Compensation from './Compensation';
import {Input, Select, Switch } from '@/components/Input';
import { ColContainer, PanelContainer, RowContainer } from '@/components/Containers';
import { TableViewCache } from '@/components/Tables';

const ProductsTable = ({ productCodes, selectedProduct, setSelectedProduct }: { productCodes: ProductCode[], selectedProduct: ProductCode | null, setSelectedProduct: any  }) => {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<ProductCode | null>(null);
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const uniqueProductTypes: string[] = useMemo(() => {
    const types = productCodes.map(productCode => productCode.productType).filter((type): type is string => typeof type === 'string');
    return Array.from(new Set(types)).sort();
  }, [productCodes]);

  // const filteredProducts = useMemo(() => {
  //   return productCodes.filter(productCode => {
  //     return (productCode.code.toLowerCase().includes(search.toLowerCase()) || 
  //             productCode.description.toLowerCase().includes(search.toLowerCase()) ||
  //             productCode.productType.toLowerCase().includes(search.toLowerCase())) &&
  //             (productTypeFilter ? productCode.productType === productTypeFilter : true);
  //   });
  // }, [productCodes, search, productTypeFilter]);
  const filteredProducts = useMemo(() => {
    return productCodes.filter(productCode => {
      // The basic search filter remains unchanged.
      const matchesSearch = productCode.code.toLowerCase().includes(search.toLowerCase()) || 
                            productCode.description.toLowerCase().includes(search.toLowerCase()) ||
                            productCode.productType.toLowerCase().includes(search.toLowerCase());
  
      // If productTypeFilter is set, only include productCodes that match it.
      const matchesTypeFilter = productTypeFilter ? productCode.productType === productTypeFilter : true;
  
      // If showInactive is false, only include active products. If true, include all.
      const matchesActiveStatus = showInactive ? true : productCode.active;
  
      return matchesSearch && matchesTypeFilter && matchesActiveStatus;
    });
  }, [productCodes, search, productTypeFilter, showInactive]);
  
  const columns = useMemo(() => [
    {
      accessorKey: 'code',
      header: () => <span>Code</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'description',
      header: () => <span>Description</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'productType',
      header: () => <span>Product Type</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'commission',
      header: () => <span>Commission (%)</span>,
      cell: (info: any) => {
        // Assuming 'promoted' is a boolean. Adjust this based on your actual data structure.
        const isPromoted = info.row.original.promoted; 
        return (
          <div className='flex flex-row items-center'>
            {info.getValue()}
            {isPromoted == 'New' && <span className="ml-2 font-semibold text-warning">New!</span>} {/* Display a star icon if the productCode is promoted */}
            {isPromoted == 'Promoted' && <span className="ml-2 font-semibold text-success">Promoted!</span>} {/* Display a star icon if the productCode is promoted */}
          </div>
        );
      },
    },
    // The "Promoted" column definition has been removed and integrated into "Commission (%)"
  ], [productTypeFilter]);

  const table = useReactTable({
    data: filteredProducts,
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
  const handleRowClick = (productCode: ProductCode) => {
    setSelectedDetails(productCode);
    setIsDrawerOpen(true);
  };
  // console.log(filteredProducts)
  return (
    <ColContainer className='container mx-auto p-2' cols="1:1:1:1">
      <motion.div className={`flex flex-col justify-center items-center absolute right-0 top-0 h-fit  bg-bodydark2 text-white shadow-xl z-50`}
        initial={{ x: '100%', opacity: 0}}
        animate={{ x: isDrawerOpen ? 0 : '100%', opacity: isDrawerOpen ? 1 : 0}}
        transition={{ type: 'spring', duration: 1.2 }}
      >
        <div className='p-4 '>
          <IoMdCloseCircle 
            size={46}
            className='absolute top-2 right-2 text-3xl text-white cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out'
            onClick={() => {setIsDrawerOpen(false)}}
          />
          <h2 className='text-xl font-semibold mb-4'>Product Details</h2>
          <Compensation productCodes={productCodes} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct as React.Dispatch<React.SetStateAction<ProductCode | null>>}  />
        </div>
      </motion.div>      
      <RowContainer className='flex flex-row justify-end items-center max-w-[26rem]'>
        <Select
            label=""
            name="ProductType"
            defaultOption="All"
            options={uniqueProductTypes.map(type => ({ id: type, name: type }))}
            // value={productTypeFilter|| ''}
            onChange={(e) => setProductTypeFilter(e.target.value)}
        />        
        <Input
          label=""
          name="search"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search... "
        />
        <Switch
          label='Show Inactive'
          name="showInactive"
          defaultChecked={showInactive}
          isEditable={true}
          // register={null}
          // type='Show Inactive'
          onChange={() => {setShowInactive(!showInactive)}}
          isChecked={showInactive}
        />
      </RowContainer>
      <div className="overflow-x-auto sm:rounded-lg mb-3 rounded-lg">
        <table className='min-w-full text-sm divide-y divide-gray-200'>
          <thead className="bg-gray-50 dark:text-white">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}>
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
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={`hover:bg-bodydark2 hover:text-white ` + (selectedProduct === row.original ? 'bg-bodydark2 text-white' : '')}
                onClick={() => {setSelectedProduct(row.original);console.log(selectedProduct);handleRowClick(row.original)}}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2 whitespace-nowrap ">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
      {/* <TableViewCache
        data={filteredProducts}
        columns={columns}
        // getCoreRowModel={getCoreRowModel}
        // getPaginationRowModel={getPaginationRowModel}
        // getSortedRowModel={getSortedRowModel}
        // getFilteredRowModel={getFilteredRowModel}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageIndex={setPageIndex}
        setPageSize={setPageSize}
        pageCount={Math.ceil(filteredProducts.length / pageSize)}
        initialSorting={{}}
      />         */}
      </div>
    </ColContainer>
  );
};

export default ProductsTable;
