'use client'
import React, {HTMLAttributes, HTMLProps, useEffect} from 'react';

import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender, FilterFn } from '@tanstack/react-table';
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { FaSortAlphaDown, FaSortAlphaDownAlt, FaSort, FaPlusCircle } from "react-icons/fa";
import {useRouter, usePathname} from "next/navigation";
import AddContact from './AddContact';
import { clientInfo} from '@/types/clientInfo';
import { getClient  } from '../_actions/contact';
import { PopupComponent } from '@/components/Popup';
// import {createContact} from './../_actions/contact';

function IndeterminateCheckbox({indeterminate, className = '', ...rest}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)
  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])
  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

const ConsolidatedClientList = ({profileId}: { profileId: string }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [showAddContact, setShowAddContact] = React.useState(false)
  const [clients, setClients] = React.useState([])

  useEffect(() => {
    const fetchClients = async () => {
      const response: any = await getClient(profileId);
      setClients(response)
    };
    fetchClients();
  }, [])  
  
  const columns = React.useMemo(() => [
    {
      id: 'select',
      header: ({ table }: { table: any }) => (
        <div className='w-fit'>
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        </div>
      ),
      cell: ({ row }: {row: any}) => (
        <div className="w-fit">
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        </div>
      )
    },
    {
      accessorKey: 'clientId', // Accessor is the "key" in the data
      header: 'ID',
      isVisible: false, // This will hide the column
    },
    {
      id: 'fullName',
      // accessorFn: (row: any) => `${row.firstName} ${row.lastName}`,
      accessorFn: (row: any) => row.firstName + ' ' + row.lastName,
      header: 'Full Name',
      enableSorting: true,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }: { row: any }) => {
        const addresses = row.original.address;
        if (addresses.length > 0) {
          return addresses.map((address: any, index: number) => (
            <div key={index}>
              {address.address}, {address.city}, {address.postalCode}
            </div>
          ));
        } else {
          return 'No Address';
        }
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'Birth Date',
    },
    {
      id: 'homePhone',
      accessorKey: 'homePhone',
      header: 'Telephone Number',
    },
    {
      accessorKey: 'title',
      header: 'Occupation',
    },
  ], []);
  

  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  const getSortIndicator = (column: any) => {
    const sortingState = column.getIsSorted();
    if (sortingState === 'asc') {
      return <FaSortAlphaDown/>;
    } else if (sortingState === 'desc') {
      return <FaSortAlphaDownAlt />;
    }
  };

  const globalFilterFn: FilterFn<clientInfo> = (row: any, columnIds, filterValue) => {
    return row.values[columnIds as keyof clientInfo].toLowerCase().includes(filterValue.toLowerCase());
  };

  console.log('Clients', clients);  
  return (
    <div className='relative'>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h2 className="text-md text-black dark:text-white">Contact type</h2>
          <select
            className="rounded border  text-md bg-white border-stroke bg-transparent ml-4 py-1 px-3  transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            <option value="all" selected>All</option>
            <option value="household">Household</option>
            <option value="company">Company</option>
          </select>
        </div>
        <div>
          <input
            className="min-w-[15rem] rounded border text-md bg-white border-stroke bg-transparent ml-4 py-2 px-3  transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search name, phone or email"
            style={{ padding: '5px' }}
          />
        </div>
        <button className="bg-primary hover:bg-primary text-white font-bold py-1 px-4 rounded flex flex-row items-center"
          onClick={()=>setShowAddContact(true)}
        >
          <FaPlusCircle className="mr-2"/>Add Contact
        </button>
      </div>
      <section className="data-table-common rounded-md border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark pb-2 text-black dark:text-white relative">
        <table className="datatable-table datatable-one border-collapse w-full break-words table-auto overflow-hidden md:overflow-auto">
          <thead className="px-4 bg-black/5 dark:bg-bodydark2">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-t border-stroke">
                {headerGroup.headers.map(header => {
                  if (header.column.id != "clientId") {
                    return (
                      <th key={header.id} className="py-1 px-2">
                        <div onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }} className='flex flex-row items-center'>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span>
                            {getSortIndicator(header.column)}
                          </span>
                        </div>
                      </th>
                    );
                  }
                  return null;
                })}
              </tr>
            ))}
          </thead>
          <tbody className='text-sm'>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t border-stroke"
                onClick={() => {
                  const clientId = row.getVisibleCells().filter((cell) => cell.column.id == 'clientId')[0].getContext().cell.getValue();
                  router.push(`${pathname}/${clientId}`);
                }}
              >
                {row.getVisibleCells().map(cell => {
                  if (cell.column.id != 'clientId') {
                    return (
                      <td key={cell.id} className="py-1 px-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className='flex flex-row justify-between items-center py-2 px-2 text-sm'>
          <button onClick={() => setPageIndex(old => Math.max(old - 1, 0))} disabled={!table.getCanPreviousPage()}>
            <MdSkipPrevious size={28} className="hover:scale-125"/>
          </button>
          <span>
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          <button onClick={() => setPageIndex(old => (!table.getCanNextPage() ? old : old + 1))} disabled={!table.getCanNextPage()}>
            <MdSkipNext size={28} className="hover:scale-125"/>
          </button>
        </div>
      </section>
      <div className="flex justify-between items-center bg-transparent font-medium mt-4 dark:bg-boxdark dark:text-white">
        <div>
          <p>You have {clients.length} clients.</p>
        </div>
        <div className="flex flex-row justify-end item-center">
          <label>Show</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="ml-2 py-1 px-2  shadow-default rounded-md border border-stroke dark:border-strokedark"
          >
            {[5, 10, 20, 50].map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <p className="pl-2">entries per page</p>
        </div>
      </div>
      {showAddContact && (
        <PopupComponent isVisible={true} onClose={() => {setShowAddContact(false)}}>
          <AddContact popupOpen={showAddContact} setPopupOpen={setShowAddContact} profileId={profileId}/>
        </PopupComponent>
      )}
    </div>
  );
};

export default ConsolidatedClientList;
