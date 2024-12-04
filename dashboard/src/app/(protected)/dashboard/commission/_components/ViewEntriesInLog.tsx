'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { fetchCommissionLogEntries, getCommissionLog } from '../_actions/commission';
import {normalize} from '@/lib/format';
import { getCarriers } from '../_actions/retrievedata';
import {ColContainer,  PanelContainer } from '@/components/Containers';
import Link from 'next/link';
import GenericTable from '@/components/Tables/TableView';
import { ColumnDef } from '@tanstack/react-table';
import { CarrierType } from '@/types/carrier';
import { CommissionLogEntry as OriginalCommissionLogEntry } from '@/types/commissionlog';
// import Select from '@/components/Input/Select'; // Adjust path as needed, assume a simple select component
import DateRangePopup from '@/components/Input/DateRangePopup'; // Adjust import path as needed
import { FaRegCalendarAlt } from "react-icons/fa";
import LoadingButtonNP from '@/components/Button/LoadingButtonNP';


interface CommissionLogEntry extends OriginalCommissionLogEntry {
  id: string;
}

const CommissionLogEntries: React.FC<{ commissionLogId: string,  onClose: ()=> void }> = ({ commissionLogId, onClose}) => {
  const [entries, setEntries] = useState<CommissionLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [carrierList, setCarrierList] = useState<CarrierType[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [isDateRangePopupVisible, setIsDateRangePopupVisible] = useState(false);  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showSplitAgentColumns, setShowSplitAgentColumns] = useState(true);
  const [totalCalculatedPostMarkupRevenue, setTotalCalculatedPostMarkupRevenue] = useState(0);
  const [totalCommissionDeposited, setTotalCommissionDeposited] = useState(0);
  const [originalStatement, setOriginalStatement] = useState<any[] | null>(null);
  useEffect(() => {
    // switchTab(1);
    const callAction = async () => {
      const response = await getCarriers();
      setCarrierList(response || []);
    }
    const getDepositedValues = async () => { 
      const commissionLog = await getCommissionLog(commissionLogId);
      // console.log(commissionLog)
      // await console.log(commissionLog)
      // console.log(commissionLogId)
      setOriginalStatement(normalize(commissionLog?.attributes?.originalStatement));
      setTotalCalculatedPostMarkupRevenue(commissionLog?.attributes?.totalPostMarkupRevenue);
      setTotalCommissionDeposited(commissionLog?.attributes?.statementAmount);
    };
    callAction();
    getDepositedValues();
  }, []);

  useEffect(() => {
    // const fetchTotalCalculatedDeposited = async (data: CommissionLogEntry[]) => {
    //   let total = 0;
    //   data.forEach((entry: CommissionLogEntry) => {
    //     total += entry.postMarkupRevenue;
    //   });
    //   // setTotalCalculatedDeposited(total);
    // }
    const fetchEntries = async () => {
      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';
      const response = await fetchCommissionLogEntries(page, pageSize, commissionLogId, selectedCarrier, formattedStartDate, formattedEndDate, search);
      console.log('response', response)
      if (response && response.data) {
        const data = await normalize(response.data);
        setEntries(data);
        // fetchTotalCalculatedDeposited(data);
        setPageCount(response.meta.pagination.pageCount);
      }
    };
    fetchEntries();

  }, [page, pageSize, commissionLogId, selectedCarrier, startDate, endDate, search]);

  // Columns definition remains unchanged
  const columns = useMemo(() => {
    let baseColumns = [ 
      {
        accessorKey: 'line',
        header: () => <span>Line</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'carrier',
        header: () => <span>Carrier</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'writingAgent',
        header: () => <span>Writing Agent</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'clientName',
        header: () => <span>Client Name</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'policyAccountFund',
        header: () => <span>Policy Account Fund</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'transactionDate',
        header: () => <span>Transaction Date</span>,
        cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'productCategory',
        header: () => <span>Product Category</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'productDetails',
        header: () => <span>Product Details</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'bonus',
        header: () => <span>Bonus</span>,
        cell: (info: any) => info.getValue() ? 'Yes' : 'No',
      },
      {
        accessorKey: 'bonusMarkup',
        header: () => <span>Bonus Markup</span>,
        cell: (info: any) => info.getValue(),
      },
      {
        accessorKey: 'receivedRevenue',
        header: () => <span>Received Revenue</span>,
        cell: (info: any) => `$${info.getValue().toFixed(2)}`,
      },
      {
        accessorKey: 'postMarkupRevenue',
        header: () => <span>Post Markup Revenue</span>,
        cell: (info: any) => `$${info.getValue().toFixed(2)}`,
      },    

    ];
    if (showSplitAgentColumns) {
      baseColumns = baseColumns.concat([
        {
          accessorKey: 'splitAgent1',
          header: () => <span>Split Agent 1</span>,
          cell: (info: any) => info.getValue(),
        },
        {
          accessorKey: 'splitAgent1Percentage',
          header: () => <span>Split Agent 1 %</span>,
          cell: (info: any) => `${info.getValue()}%`,
        },
        {
          accessorKey: 'splitAgent2',
          header: () => <span>Split Agent 2</span>,
          cell: (info: any) => info.getValue(),
        },
        {
          accessorKey: 'splitAgent2Percentage',
          header: () => <span>Split Agent 2 %</span>,
          cell: (info: any) => `${info.getValue()}%`,
        },
        {
          accessorKey: 'splitAgent3',
          header: () => <span>Split Agent 3</span>,
          cell: (info: any) => info.getValue(),
        },
        {
          accessorKey: 'splitAgent3Percentage',
          header: () => <span>Split Agent 3 %</span>,
          cell: (info: any) => `${info.getValue()}%`,
        },
      ]);
    }
  return baseColumns;
  }, [showSplitAgentColumns]);
  


  const handleCarrierChange = (e: any) => {
    if (e.target.value == "All carriers") {
      setSelectedCarrier('');
    } else {
      setSelectedCarrier(e.target.value);
    }
    // Optionally refetch or filter the commission logs based on the selected carrier
  };
  const handleDateRangeApply = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    setIsDateRangePopupVisible(false);
  };
  console.log(entries)
  // console.log(totalCalculatedPostMarkupRevenue)
  // console.log(totalCommissionDeposited)
  // console.log(originalStatement)
  return (
    <ColContainer cols="1:1:1:1">
      <PanelContainer header='Commission Log Entries' className='relative'>
        {/* <LoadingButtonNP
          onClick={onClose}
          className="absolute top-1 left-4  w-[4rem] rounded-lg bg-body/80 mt-4 p-2 text-white  hover:bg-opacity-90 flex justify-center items-center"
          loadingText="Close"
        >
          Close
        </LoadingButtonNP>  */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-4">
          <label className="flex items-center space-x-1 ml-6">
            <input
              type="checkbox"
              checked={showSplitAgentColumns}
              onChange={(e) => setShowSplitAgentColumns(e.target.checked)}
            />
            <span>Show Split Agents</span>
          </label>             
          <input
            type="text"
            value={search}
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)} // Trigger refresh on search change
            className="border p-1"
          />
          <select
            name="carrier"
            value={selectedCarrier}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCarrierChange(e)}
            className="w-[7rem] border border-black rounded py-1 px-3 text-grey-darker shadow appearance-none"
          >
            <option value="">All carriers</option>
            {carrierList.map(carrier => (
              <option key={carrier.id} value={carrier.id}>{carrier.carrierName}</option>
            ))}
          </select>
          <button
            className="ml-0 p-2 bg-transparent text-black  dark:text-white rounded hover:bg-blue-700"
            onClick={() => setIsDateRangePopupVisible(true)}
          >
            <FaRegCalendarAlt size={30} />
          </button>
        </div>
        <GenericTable
          columns={columns}
          data={entries as unknown as Record<string, unknown>[]}
          pageIndex={page - 1}
          pageSize={pageSize}
          pageCount={pageCount}
          onPreviousPage={() => setPage(old => Math.max(old - 1, 1))}
          onNextPage={() => setPage(old => (old < pageCount ? old + 1 : old))}
          onPageSizeChange={setPageSize}
          onRefresh={() => setEntries([])} // Implement logic to refresh data
          searchPlaceholder="Search..."
          search={search}
        />
        <div>
          <p>Total Commission Deposited: $<strong>{totalCommissionDeposited}</strong> vs Total Calculated Post Markup Revenue: $<strong>{Math.round(totalCalculatedPostMarkupRevenue * 100) / 100 }</strong></p>
        </div>
      </PanelContainer>
      {/* <LoadingButtonNP
        onClick={onClose}
        className="w-[12rem] rounded-lg  mt-4 p-2 text-white  hover:bg-opacity-90 flex justify-center items-center"
        loadingText="Processing ..."
      >
        Close
      </LoadingButtonNP>       */}
      {isDateRangePopupVisible && (
        <DateRangePopup
          isOpen={isDateRangePopupVisible}
          onClose={() => setIsDateRangePopupVisible(false)}
          onApply={handleDateRangeApply}
          inputStartDate={startDate}
          inputEndDate={endDate}
        />
      )}
      {originalStatement && originalStatement.length > 0 && originalStatement[0]?.url && (
        <PanelContainer header='Original Statement' className='aspect-video relative'>
          <iframe className={`w-full h-full absolute pt-[2rem] pr-[3rem] `}
            src={originalStatement[0]?.url}
            allowFullScreen
          ></iframe>
        </PanelContainer>
      )}
    </ColContainer>
  );
}

export default CommissionLogEntries;
