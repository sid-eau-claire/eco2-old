'use client'
import React, { useState, useEffect, useMemo } from 'react';
import GenericTable from '@/components/Tables/TableView';
import { fetchCommissionLogs, deleteCommissionLog } from '../_actions/commission';
import { getCarriers, getAdvisorNameList } from '../_actions/retrievedata';
import { ColumnDef } from '@tanstack/react-table';
import { CommissionLog as OriginalCommissionLog } from '@/types/commissionlog';
import { normalize } from '@/lib/format';
import ConfirmPopup from '@/components/Popup/ConfirmPopup';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import { FaRegCalendarAlt, FaPlusCircle } from "react-icons/fa";
import { BiDetail } from "react-icons/bi";
import { CarrierType } from '@/types/carrier';
// import AddCommissionLog from './AddCommissionLog';
import DateRangePopup from '@/components/Input/DateRangePopup';
import ViewEntriesInLog from './ViewEntriesInLog';
import commission from '../page';
import {ToolTip} from '@/components/Common/ToolTip';
import Link from 'next/link';
import { PopupComponent } from '@/components/Popup';

type ListCommissionProps = {
  initialPayrollStatus?: string;
  refreshTab: number;
  setRefreshTab: any;
  sharedFilters?: any;
  setSharedFilters?:any;
};

type CommissionLog = OriginalCommissionLog & { id: string };

const ListCommission: React.FC<ListCommissionProps> = ({initialPayrollStatus, refreshTab, setRefreshTab, sharedFilters, setSharedFilters}) => {
  const [data, setData] = useState<CommissionLog[]>([]);
  const [carrierList, setCarrierList] = useState<CarrierType[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [pageCount, setPageCount] = useState(0);
  const [refreshData, setRefreshData] = useState(0);
  const [search, setSearch] = useState('');
  const [confirmSearch, setConfirmSearch] = useState('');
  const [isConfirmPopupVisible, setIsConfirmPopupVisible] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  // const [startDate, setStartDate] = useState<Date | null>(null);
  // const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateRangePopupVisible, setIsDateRangePopupVisible] = useState(false);
  const [isAddCommissionLogVisible, setIsAddCommissionLogVisible] = useState(false);
  const [isViewEntriesInLog, setIsViewEntriesInLog] = useState(false);
  const [advisorList, setAdvisorList] = useState<any[]>([]);
  const [commissionLogId, setCommissionLogId] = useState<string>('');
  const [originalStatement, setOriginalStatement] = useState<string>('');
  const [totalCommissionDeposited, setTotalCommissionDeposited] = useState<number>(0);
  const [totalPostMarkupRevenue, setTotalCalculatedPostMarkUpRevenue] = useState<number>(0);
  const [payrollStatus, setPayrollStatus] = useState<string>(initialPayrollStatus || '');
  const showUnpaidLogOnly = false

  // useEffect(() => {
  //   const prepareCarrierAndAdvisorList = async () => {
  //     const response = await getCarriers();
  //     setCarrierList(response || []);
  //     const response2  = await getAdvisorNameList();
  //     setAdvisorList(response2 || []);
  //   };
  //   prepareCarrierAndAdvisorList();
  // }, []);

  useEffect(() => {
    const callAction = async () => {
      // Adjust the API call to include date range filtering based on selected startDate and endDate
      const formattedStartDate = sharedFilters.startDate ? sharedFilters.startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = sharedFilters.endDate ? sharedFilters.endDate.toISOString().split('T')[0] : '';
      // Example API endpoint adjustment, ensure your API supports these query params
      const response = await fetchCommissionLogs(page, pageSize, showUnpaidLogOnly, sharedFilters.selectedCarrier, formattedStartDate, formattedEndDate, payrollStatus);
      // console.log('response', response)
      // console.log('called')
      setData(await normalize(response?.data));
      setPageCount(response?.meta?.pagination.pageCount);
    };
    callAction();
  }, [page, pageSize, showUnpaidLogOnly, refreshData, sharedFilters.selectedCarrier, sharedFilters.startDate, sharedFilters.endDate, sharedFilters.searchPolicyAccountNumber, refreshTab ]);

  const columns: ColumnDef<CommissionLog>[] = useMemo(() => [
    // {
    //   accessorKey: 'id',
    //   header: () => <span className="font-semibold">ID</span>,
    //   cell: (info: any) => info.getValue(),
    // },
    {
      id: 'detail',
      header: () => <span className="font-semibold"></span>,
      cell: (info: any) => (
        <ToolTip message='View commission log entries'>
          <button
            onClick={() => handleDetailClick(info.row.original.id, info.row.original.originalStatement)} // Assuming each row has a unique 'id'
            className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
            >
            <BiDetail className='cursor-pointer' size={20}/>
          </button>
        </ToolTip>
      ),
    },     
    {
      accessorFn: (row: CommissionLog) => row.carrier ?? '',
      id: 'carrier',
      header: () => <span className="font-semibold">Carrier</span>,
        cell: (info: any) => 
        <Link href={`/dashboard/carriers/${info.row.original.carrierId.id}`}>
          <span className="underline" onClick={()=>console.log('h')}>
            {info.getValue()}
          </span>
        </Link>,
    },
    {
      accessorKey: 'statementDate',
      header: () => <span className="font-semibold">Statement Date</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'statementPeriodStartDate',
      header: () => <span className="font-semibold">Start Date</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'statementPeriodEndDate',
      header: () => <span className="font-semibold">End Date</span>,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'statementAmount',
      header: () => <span className="font-semibold">Statement Amount</span>,
      cell: (info: any) => `$${info.getValue()?.toFixed(2)}`,
    },
    // {
    //   accessorKey: 'statementDate',
    //   header: () => <span className="font-semibold">Statement Date</span>,
    //   cell: (info: any) => info.getValue(),
    // },
    // {
    //   id: 'delete',
    //   header: () => <span className="font-semibold">Actions</span>,
    //   cell: (info: any) => (
    //     <>
    //       {info.row.original.paymentPeriodId?.id ? (
    //         <ToolTip message='No allowed!' hintHPos="-5rem">
    //           <button
    //           disabled
    //           className="flex flex-row justify-center items-center  text-black hover:scale-110 transition duration-150 ease-in-out"
    //           >
    //             <IoMdCloseCircle className='text-black' size={30}/>
    //           </button>
    //         </ToolTip>
    //       ):(
    //         <ToolTip message='Delete commission log' hintHPos="-5rem">
    //           <button
    //           onClick={() => handleDeleteClick(info.row.original.id)} // Assuming each row has a unique 'id'
    //           className="flex flex-row justify-center items-center  text-danger hover:scale-110 transition duration-150 ease-in-out"
    //           >
    //             <IoMdCloseCircle className='text-danger' size={30}/>
    //           </button>
    //         </ToolTip>
    //       )}
    //     </>
    //   ),
    // },    
    // Add more columns as necessary
  ], []);

  const handleCarrierChange = (e: any) => {
    if (e.target.value == "All carriers") {
      setSelectedCarrier('');
    } else {
      setSelectedCarrier(e.target.value);
    }
    // Optionally refetch or filter the commission logs based on the selected carrier
  };

  const confirmDelete = async (id: string) => {
    if (id) {
      // console.log(id)
      const response = await deleteCommissionLog(id);
      // Refresh the data or remove the item from the local state to update UI
      if (response == true) {
        // setData(data.filter(log => log.id != id));
        setRefreshData(refreshData + 1);
      }
    }
    // Close popup
    setIsConfirmPopupVisible(false);
    setSelectedIdToDelete(null);
  };
  const handleDeleteClick = (id: string) => {
    setSelectedIdToDelete(id);
    setIsConfirmPopupVisible(true);
  };
  const handleDetailClick = async (id: string, originalStatement: string) => {
    // console.log('Detail clicked:', id);
    setCommissionLogId(id);
    setOriginalStatement(originalStatement);

    await setTotalCommissionDeposited(data.find(log => log.id == id)?.totalCommissionDeposited || 0)
    await setTotalCalculatedPostMarkUpRevenue(data.find(log => log.id == id)?.totalPostMarkupRevenue || 0)
    
    await setTimeout(() => {setIsViewEntriesInLog(true)}, 500);
    // await setIsViewEntriesInLog(true);
    // switchTab(1);
    // await setTimeout(() => {switchTab(2)}, 500);
  }

  // const handleDateRangeApply = (start: Date | null, end: Date | null) => {
  //   setStartDate(start);
  //   setEndDate(end);
  //   setIsDateRangePopupVisible(false);
  // };

  const toggleAddCommissionLogPopup = () => {
    setIsAddCommissionLogVisible(!isAddCommissionLogVisible);
  };

  // console.log(data);
  // console.log(carrierList);
  // console.log(advisorList)
  // console.log('search', search)
  return (
    <>
      <div className='flex flex-row justify-end items-center absolute top-[0.2rem] right-[3rem] '>
        {/* <div className='flex flex-row justify-end items-center mb-1'>
          <ToolTip message='Filter by carrier'>
            <select
              name="carrier"
              value={selectedCarrier}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCarrierChange(e)}
              className="w-[7rem] ml-[2rem] border border-black rounded py-1 px-3 text-grey-darker shadow appearance-none"
            >
              <option value="">All carriers</option>
              {carrierList.map(carrier => (
                <option key={carrier.id} value={carrier.id}>{carrier.carrierName}</option>
              ))}
            </select>
          </ToolTip>
          <ToolTip message="Search Policy/Account Number or Writing Advisor name. Press Enter to start search" hintHPos="-5rem" hintVPos="2.5rem">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="ml-4 shadow appearance-none border border-black rounded py-1 px-3 text-grey-darker"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('Enter key pressed! Initiating search...');
                  // Trigger your search or action function here
                  setConfirmSearch(search);
                }
              }}              
            />
          </ToolTip>
          <ToolTip message='Calender'>
            <button
              className="ml-4 p-2 bg-transparent text-black  dark:text-white rounded hover:bg-blue-700"
              onClick={() => setIsDateRangePopupVisible(true)}
            >
              <FaRegCalendarAlt size={30} />
            </button>
          </ToolTip>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="ml-3 mb-4 shadow appearance-none border border-black rounded py-1 px-3 text-grey-darker"
          />
        </div> */}
      </div>
      <GenericTable
        columns={columns}
        data={data}
        pageIndex={page - 1}
        pageSize={pageSize}
        pageCount={pageCount}
        onPreviousPage={() => setPage(old => Math.max(old - 1, 1))}
        onNextPage={() => setPage(old => (old < pageCount ? old + 1 : old))}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        onRefresh={() => {}}
        searchPlaceholder="Search..."
        search=""
      />
      {isConfirmPopupVisible && selectedIdToDelete && (
        <ConfirmPopup
          heading="Confirm Deletion"
          message="Are you sure you want to delete this commission log?"
          onConfirm={() => confirmDelete(selectedIdToDelete)}
          onCancel={() => setIsConfirmPopupVisible(false)}
        />
      )}
      {/* {isDateRangePopupVisible && (
        <DateRangePopup
          isOpen={isDateRangePopupVisible}
          onClose={() => setIsDateRangePopupVisible(false)}
          onApply={handleDateRangeApply}
          inputStartDate={startDate}
          inputEndDate={endDate}
        />
      )} */}
      {isAddCommissionLogVisible && 
        <div className='fixed top-0 left-0 right-0 bottom-0 bg-black/60 z-9999 flex flex-col justify-center items-center'>
          {/* <AddCommissionLog advisorList={advisorList}
            onClose={() => setIsAddCommissionLogVisible(false)} 
          /> */}
        </div>
      }
      {isViewEntriesInLog && 
        <PopupComponent isVisible={isViewEntriesInLog} onClose={() => setIsViewEntriesInLog(false)}>
          <ViewEntriesInLog commissionLogId={commissionLogId}
            onClose={() => setIsViewEntriesInLog(false)} 
          />
        </PopupComponent>
      }      
    </>
  );
};

export default ListCommission;
