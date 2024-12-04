import React, { useState, useEffect, useMemo } from 'react';
import {TableViewCache} from '@/components/Tables';

import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/lib/format';
import { ColContainer, RowContainer } from '@/components/Containers';
import Link from 'next/link';
import { Table } from '@tremor/react';

type ListPaymentPeriodsProps = {
  selectedPaymentPeriod: any;
};

const ViewPaymentPeriods: React.FC<ListPaymentPeriodsProps> = ({ selectedPaymentPeriod }) => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [refreshData, setRefreshData] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Assuming selectedPaymentPeriod is directly the data structure you showed earlier
    setData(selectedPaymentPeriod?.advisorRevenue);
  }, [selectedPaymentPeriod]);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'accountId.profileId.id',
      header: 'Profile ID',
      // cell: (info) => info.getValue(),
      cell: (info: any) => (
        <Link href={`/dashboard/mybusiness/cashflow/${info.row.original.accountId.profileId.id}`} className='text-primary'>
          {info.row.original?.accountId?.profileId?.firstName} {info.row.original?.accountId?.profileId?.lastName}
        </Link>
      ),  
    },
    {
      // accessorKey: 'settlementAmount',
      header: 'Settled Payment',
      cell: (info: any ) => {
        const settledPaymentTRX = info.row.original.TRXIds.filter((trx: any) => trx.type == 'payroll');
        if (settledPaymentTRX.length == 1) {
          return formatCurrency(settledPaymentTRX[0].amount)
        } else {
          return "N/A"
        }
      }
    },    
    {
      accessorKey: 'fieldRevenue',
      header: 'Field Revenue',
      cell: (info) => formatCurrency(info.getValue()),
    },
    {
      accessorKey: 'teamFieldRevenue',
      header: 'Team Field Revenue',
      cell: (info) => formatCurrency(info.getValue()),
    },
    {
      id: 'FLAgentIds', // Assuming FLAgentIds needs to be derived, not provided directly
      header: 'No of First Level Agents',
      cell: (info) => info.row.original?.FLAgentIds?.length, // Placeholder for actual logic
    },
    // {
    //   id: 'TRXIds',
    //   header: 'Transaction IDs',
    //   cell: (info) => info.row.original.TRXIds.map((trx: any) => trx.id).join(', '),
    // }
  ], []);
  console.log('data', data)
  return (
    <>
      <RowContainer>
        <RowContainer className='flex justify-between items-center mb-4'>
          <div>
            <h3 className='text-lg font-semibold'>Payment Period Details</h3>
            <p>Pay Period Date: {selectedPaymentPeriod?.payPeriodDate}</p>
            <p>Total Settled Payment: {formatCurrency(selectedPaymentPeriod?.totalSettledPayment)}</p>
          </div>
        </RowContainer>
        <RowContainer className='flex flex-col'>
          <TableViewCache
            columns={columns as any}
            data={data}
            // pageIndex={page - 1}
            pageSize={pageSize}
            // pageCount={pageCount}
            // onPreviousPage={() => setPage(old => Math.max(old - 1, 1))}
            // onNextPage={() => setPage(old => (old < pageCount ? old + 1 : old))}
            // onPageSizeChange={(newSize) => setPageSize(newSize)}
            // onRefresh={() => setRefreshData(!refreshData)}
            search={search}
          />
        </RowContainer>
      </RowContainer>
    </>
  );
};

export default ViewPaymentPeriods;
