// ListPaymentPeriods.tsx
import React, { useState, useEffect, useMemo } from 'react';
import GenericTable from '@/components/Tables/TableView';
import { fetchPaymentPeriod } from '../_actions/payment';
import { ColumnDef } from '@tanstack/react-table';
import { PaymentPeriod as OriginalPaymentPeriod } from '@/types/payment';
import ConfirmPopup from '@/components/Popup/ConfirmPopup';
import { IoMdCloseCircle } from 'react-icons/io';
import { BiDetail } from "react-icons/bi";
import { ToolTip } from '@/components/Common/ToolTip';
import {normalize} from '@/lib/format';
import Link from 'next/link';
import { formatCurrency } from '@/lib/format';
import ViewPaymentPeriod  from './ViewPaymentPeriod';
import { PopupComponent } from '@/components/Popup';
import { set } from 'react-hook-form';

type ListPaymentPeriodsProps = {
  switchTab?: (tabIndex: number) => void;
};

type PaymentPeriod = OriginalPaymentPeriod & { id: string };

// const ListPaymentPeriods: React.FC<ListPaymentPeriodsProps> = ({ switchTab }) => {
  const ListPaymentPeriods: React.FC<any> = ({initialPayrollStatus, refreshTab, setRefreshTab, sharedFilters, setSharedFilters}) => {

  const [data, setData] = useState<PaymentPeriod[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  // const [startDate, setStartDate] = useState<Date | null>(null);
  // const [endDate, setEndDate] = useState<Date | null>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [selectedPaymentPeriod, setSelectedPaymentPeriod] = useState<PaymentPeriod | null>(null); 
  const [isConfirmPopupVisible, setIsConfirmPopupVisible] = useState(false);
  // const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const callAction = async () => {
      const formattedStartDate = sharedFilters.startDate ? sharedFilters.startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = sharedFilters.endDate ? sharedFilters.endDate.toISOString().split('T')[0] : '';
      const response = await fetchPaymentPeriod(page, pageSize, formattedStartDate, formattedEndDate);
      setData(normalize(response?.data) || []);
      setPageCount(response?.meta.pagination.pageCount || 0);
    };
    callAction();
    // console.log('called again')
  }, [page, pageSize, refreshData, sharedFilters.startDate, sharedFilters.endDate, refreshTab]);
  const handleSelectedPaymentPeriod = (id: string) => {
    // console.log('id', id);
    setData(currentData => {
      // console.log('data', currentData);  // Log the current data when accessing it
      const selectedPeriod = currentData.find(period => period.id === id);
      setSelectedPaymentPeriod(selectedPeriod || null); // Provide a default value of null
      setIsConfirmPopupVisible(true);
      return currentData;  // Return current data to ensure no state mutation
    });
  };
  const columns: ColumnDef<PaymentPeriod>[] = useMemo(() => [
    {
      id: 'id',
      header: () => <span className="font-semibold"></span>,
      cell: (info: any) => (
        // <Link href={`/dashboard/commission/paymentperiod/${info.row.original.id}`}>
          <ToolTip message="View payroll detail">
            <button
              onClick={() => 
                {handleSelectedPaymentPeriod(info.row.original.id)}
              }
              className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
            >
              <BiDetail size={20} />
            </button>
          </ToolTip>
        // </Link>
      ),
    },
    {
      accessorKey: 'payPeriodDate',
      header: () => <span className="font-semibold">Pay Period Date</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'totalSettledPayment',
      header: () => <span className="font-semibold">Total Settled Payment</span>,
      cell: (info) => formatCurrency(info.getValue()),
    },
    {
      id: 'noOfAdvisors',
      header: () => <span className="font-semibold">No of Advisors</span>,
      cell: (info: any) => info.row.original.accountIds.length,
    },

  ], []);
  


  // console.log('listPyamentPeriod', data)
  return (
    <>
      {/* <div className='flex flex-col'> */}
        {/* Table and other UI elements */}
        <GenericTable
          columns={columns}
          data={data}
          pageIndex={page - 1}
          pageSize={pageSize}
          pageCount={pageCount}
          onPreviousPage={() => setPage(old => Math.max(old - 1, 1))}
          onNextPage={() => setPage(old => (old < pageCount ? old + 1 : old))}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          onRefresh={() => setRefreshData(!refreshData)}
          search={search}
        />
        {isConfirmPopupVisible  &&  (
          <PopupComponent
            isVisible={isConfirmPopupVisible}
            onClose={() => setIsConfirmPopupVisible(false)}
          >
            <ViewPaymentPeriod
              selectedPaymentPeriod={selectedPaymentPeriod}
              // onClose={() => setIsConfirmPopupVisible(false)}
            /> 
          </PopupComponent>

        )}
      {/* </div> */}
    </>
  );
};

export default ListPaymentPeriods;
