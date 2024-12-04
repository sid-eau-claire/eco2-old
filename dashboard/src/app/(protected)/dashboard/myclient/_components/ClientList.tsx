import React, { useMemo, useState, useEffect } from 'react'
import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { User, Mail, MapPin, Phone, Search, ChevronLeft, ChevronRight, ArrowUpDown, Calendar, UserCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { differenceInYears, parseISO } from 'date-fns'
import MergeRecords from './MergeRecords'
import AIMatch from './AIMatch'
import AddClient from './AddClient'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'

import {Client, ClientListProps} from './types' 

export default function ClientList({ clients, setSelectedPerson, setRefresh, profileId }: ClientListProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [showMergeRecords, setShowMergeRecords] = useState(false)
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false)

  const handleCheckboxChange = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) ? prev.filter(record => record !== id) : [...prev, id]
    )
  }

  const handleMergeClick = () => {
    setShowMergeRecords(true)
  }

  const handleAIMerge = (aiSelectedRecords: string[]) => {
    setSelectedRecords(aiSelectedRecords);
    setShowMergeRecords(true);
  };

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            onChange={(e) => {
              const filteredRows = table.getFilteredRowModel().rows
              const allIds = filteredRows.map(row => row.original.id)
              setSelectedRecords(e.target.checked ? allIds : [])
            }}
            checked={
              table.getFilteredRowModel().rows.length > 0 &&
              selectedRecords.length === table.getFilteredRowModel().rows.length
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRecords.includes(row.original.id)}
            onChange={() => handleCheckboxChange(row.original.id)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        ),
      },
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 text-left">
            <User className="mr-2" size={16} />
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => (
          <span onClick={() => setSelectedPerson(info.row.original.id)} className="pl-0 text-left cursor-pointer hover:text-blue-600">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 text-left">
            <Mail className="mr-2" size={16} />
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'dateOfBirth',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="pl-0 text-left"
          >
            <Calendar className="mr-2" size={16} />
            Age
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => {
          if (!info || !info.getValue()) {
            return '';
          }
      
          const date = parseISO(info.getValue());
          if (!date) {
            return '';
          }
      
          return differenceInYears(new Date(), date) + ' years old';
        },
      },
      {
        accessorKey: 'address',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 text-left">
            <MapPin className="mr-2" size={16} />
            Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => {
          const address: any = info.getValue()
          return address && address.address && address.city
            ? `${address.address}, ${address.city}`
            : ''
        },
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0 text-left">
            <Phone className="mr-2" size={16} />
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info: any) => {
          const { mobilePhone, homePhone } = info.row.original
          const phones = []
          if (mobilePhone) phones.push(`${mobilePhone} (mobile)`)
          if (homePhone) phones.push(`${homePhone} (home)`)
          return phones.join(', ')
        },
      },
    ],
    [selectedRecords]
  )

  const table = useReactTable({
    data: clients,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  
  useEffect(() => {
    const filteredIds = table.getFilteredRowModel().rows.map(row => row.original.id)
    setSelectedRecords(prev => prev.filter(id => filteredIds.includes(id)))
  }, [table.getFilteredRowModel().rows])

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-row justify-end items-center mb-4 space-x-4">
          <div className='flex flex-row justify-start items-center'>
            <div className='flex items-center space-x-2'>
              <Search className="text-gray-400 " />
              <Input
                placeholder="Search all columns..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(String(e.target.value))}
                className="max-w-sm"
              />
            </div>
          </div>
          <div className='flex flex-row justify-end items-center space-x-4'>
            {selectedRecords.length >= 2 && ( 
              <>
                {selectedRecords.length == clients.length ? (
                  <AIMatch clients={clients} onMerge={handleAIMerge} />
                ): (
                  <Button 
                    onClick={handleMergeClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Merge Selected
                  </Button>
                )}
              </>
            )}
            <Sheet open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
              <SheetTrigger asChild>
                <Button>Add Client</Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[1400px] py-16">
                <SheetTitle>Add New Client</SheetTitle>
                <SheetDescription>Fill out the form below to add client.</SheetDescription>
                <AddClient 
                  onClose={() => {
                    setSelectedPerson('');
                    setIsAddPersonOpen(false);
                  }} 
                  profileId={profileId}
                  setRefresh={setRefresh}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50 text-gray-700 py-3 px-4 text-left">
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-4">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}
            </span>{' '}
            of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> clients
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <MergeRecords 
          selectedRecords={selectedRecords} 
          clients={clients} 
          isOpen={showMergeRecords}
          onClose={() => {setRefresh(Math.random()); setShowMergeRecords(false)}}
          profileId={profileId}
        />
      </div>
    </>
  )
}