'use client'
import React, { useMemo, useState } from 'react';
import TableViewCache from '@/components/Tables/TableViewCache'; // Adjust the import path as needed
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Payment as OriginalPayment , PaymentPeriod } from '@/types/payment'; // Assuming this is the correct path
import Link from 'next/link';
import { BiDetail } from 'react-icons/bi';
import { ToolTip } from '@/components/Common/ToolTip';

interface Payment extends OriginalPayment {
  profileId: {
    firstName: string;
    lastName: string;
  };
}

const PaymentTable = ({ payments, paymentPeriod }: { payments: Payment[], paymentPeriod: PaymentPeriod }) => {
  // Define the structure of your columns
  const [search, setSearch] = useState('');
  const columns = useMemo(() => [
    {
      id: 'detail',
      header: () => <span className="font-semibold w-[1rem]"></span>,
      cell: (info: any) => (
        <ToolTip message='View detail statement log'>
          <button
            onClick={() =>console.log('hello')} // Assuming each row has a unique 'id'
            className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
            >
            <BiDetail className='cursor-pointer' size={30}/>
          </button>
        </ToolTip>
      ),
    },      
    {
      // Combine first name and last name into one column
      id: 'fullName', // Custom ID for the combined column
      header: 'Full Name',
      // Custom cell renderer that concatenates firstName and lastName
      cell: (info: any) =>
        <Link href={`/dashboard/profile/${info.row.original.profileId.id}`} className="underline">
          {info.row.original.profileId.firstName} {info.row.original.profileId.lastName}
        </Link>
    },
    {
      accessorKey: 'totalPersonalAmount',
      // accessorFn: (row: Payment) => row.totalPersonalAmount,  // Ensure sorting uses the raw number
      header: 'Commission Paid (Personal)',
      cell: (info: any) => {
        const value = info.getValue();
        return value !== null && value !== undefined ? `$${value.toFixed(2)}` : 'N/A';
      },
      enableSorting: true, // Ensure this is enabled
    },
    {
      accessorKey: 'totalAgencyAmount',
      header: 'Commission Paid (Agency)',
      cell: (info: any) => {
        const value = info.getValue();
        return value !== null && value !== undefined ? `$${value.toFixed(2)}` : 'N/A';
      },
    },
    {
      accessorKey: 'totalGenerationAmount',
      header: 'Commission Paid (Generation)',
      cell: (info: any) => {
        const value = info.getValue();
        return value !== null && value !== undefined ? `$${value.toFixed(2)}` : 'N/A';
      },
    },
    {
      id: 'totalCommission',
      header: 'Total Commission',
      cell: (info: any) => {
        const { totalPersonalAmount, totalAgencyAmount, totalGenerationAmount } = info.row.original;
    
        // Ensure values are numbers and sum them up, treating null or undefined as 0
        const sum = [totalPersonalAmount, totalAgencyAmount, totalGenerationAmount].reduce((acc, value) => {
          return acc + (Number.isFinite(value) ? value : 0);
        }, 0);
    
        return `$${sum.toFixed(2)}`;
      },
      enableSorting: true, // Disable sorting for this column
    },    
    // Add more columns as needed
  ], []);

  // Define initial state values for pagination
  interface Payment {
    // Add the missing property
    profileId: {
      firstName: string;
      lastName: string;
    };
    // Add other properties as needed
  }

  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);

  const filteredPayments = useMemo(() => {
    if (!search) return payments;
    return payments.filter((payment: Payment) => {
      // Adjust the properties you want to search by
      return `${payment.profileId.firstName} ${payment.profileId.lastName}`.toLowerCase().includes(search.toLowerCase());
    });
  }, [payments, search]);

  return (
    <motion.div
      className='container mx-auto py-3 bg-white my-3 dark:to-black-2 relative rounded-sm shadown-md'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-3 px-3">
        <div> {/* Other potential header content can go here */}</div>
        <input
          type="text"
          className="ml-6 shadow appearance-none border rounded py-1 px-3 text-grey-darker"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ alignSelf: 'flex-end' }}
        />
      </div>      
      <TableViewCache
        data={filteredPayments}
        columns={columns}
        // getCoreRowModel={getCoreRowModel}
        // getPaginationRowModel={getPaginationRowModel}
        // getSortedRowModel={getSortedRowModel}
        // getFilteredRowModel={getFilteredRowModel}
        // pageIndex={pageIndex}
        pageSize={pageSize}
        // setPageIndex={setPageIndex}
        // setPageSize={setPageSize}
        // pageCount={Math.ceil(payments.length / pageSize)} // Calculate the total page count
        initialSorting={[
          {
            id: 'totalPersonalAmount',
            desc: true,
          }
        ]}        
      />
    </motion.div>
  );
};

export default PaymentTable;
