'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { fetchCommissionLogEntries } from '../_actions/commission';
import {normalize} from '@/lib/format';
import { getCarriers } from '../_actions/retrievedata';
import Link from 'next/link';
import GenericTable from '@/components/Tables/TableView';
import { ColumnDef } from '@tanstack/react-table';
import { CarrierType } from '@/types/carrier';
import { CommissionLogEntry as OriginalCommissionLogEntry } from '@/types/commissionlog';
// import Select from '@/components/Input/Select'; // Adjust path as needed, assume a simple select component
import DateRangePopup from '@/components/Input/DateRangePopup'; // Adjust import path as needed
import { FaRegCalendarAlt } from "react-icons/fa";

interface CommissionLogEntry extends OriginalCommissionLogEntry {
  id: string;
}

// const CommissionLogEntries: React.FC<any> = ({initialPayrollStatus, refreshTab, setRefreshTab}) => {
const CommissionLogEntries: React.FC<any> = ({initialPayrollStatus, refreshTab, setRefreshTab, sharedFilters, setSharedFilters}) => {

// const CommissionLogEntries: React.FC<{  switchTab: (tabIndex: number) => void }> = ({ switchTab }) => {
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
  const [showSplitAgentColumns, setShowSplitAgentColumns] = useState(false);
  const [commissionLogId, setCommissionLogId] = useState('');

  // useEffect(() => {
  //   // switchTab(1);
  //   const callAction = async () => {
  //     const response = await getCarriers();
  //     setCarrierList(response || []);
  //   };
  //   callAction();
  // }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      const formattedStartDate = sharedFilters.startDate ? sharedFilters.startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = sharedFilters.endDate ? sharedFilters.endDate.toISOString().split('T')[0] : '';
      const response = await fetchCommissionLogEntries(
        page, pageSize, commissionLogId, sharedFilters.selectedCarrier, formattedStartDate, formattedEndDate, sharedFilters.searchPolicyAccountNumber);
      if (response && response.data) {
        setEntries(await normalize(response.data));
        setPageCount(response.meta.pagination.pageCount);
      }
    };
    fetchEntries();
  }, [page, pageSize,  sharedFilters.selectedCarrier, sharedFilters.startDate, sharedFilters.endDate, sharedFilters.searchPolicyAccountNumber]);

  // Columns definition remains unchanged
  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => [
    // Base columns that are always shown
    // { accessorKey: 'line', header: () => <span className="font-semibold">Line</span>, cell: (info: any) => info.getValue() },
    { accessorKey: 'carrier', header: () => <span className="font-semibold">Carrier</span>, cell: (info: any)=> info.getValue() },
    // { accessorKey: 'writingAgent', header: () => <span className="font-semibold">Agent</span>, cell: (info: any)=> <Link href={`/dashboard/profile/${info.row.original.writingAgentId.id}`} className="underline">{info.getValue()}</Link> },
    { accessorKey: 'writingAgent', header: () => <span className="font-semibold">Agent</span>, cell: (info: any)=> <Link href={`/dashboard/mybusiness/cashflow/${info.row.original.writingAgentId.id}`} className="underline">{info.getValue()}</Link> },
    { accessorKey: 'postMarkupRevenue', header: 'Post Markup Revenue', cell:  (info: any) => `$${info.getValue().toFixed(2)}` },
  ].concat(
    showSplitAgentColumns ? [
      // Split agent columns shown only if showSplitAgentColumns is true
      { accessorKey: 'splitAgent1', header: () => <span className="font-semibold">Split Agent 1</span>, cell: info => info.getValue() || 'N/A' },
      { accessorKey: 'splitAgent1Percentage', header: () => <span className="font-semibold">Split 1 %</span>, cell: info => `${info.getValue()}%` },
      { accessorKey: 'splitAgent2', header: () => <span className="font-semibold">Split Agent 2</span>, cell: info => info.getValue() || 'N/A' },
      { accessorKey: 'splitAgent2Percentage', header: () => <span className="font-semibold">Split 2 %</span>, cell: info => `${info.getValue()}%` },
      { accessorKey: 'splitAgent3', header: () => <span className="font-semibold">Split Agent 3</span>, cell: info => info.getValue() || 'N/A' },
      { accessorKey: 'splitAgent3Percentage', header: () => <span className="font-semibold">Split 3 %</span>, cell: info => `${info.getValue()}%` },
    ] : []
  ).concat([
    { accessorKey: 'clientName', header: () => <span className="font-semibold">Client</span>, cell: (info: any) => info.getValue() },
    { accessorKey: 'transactionDate', header: () => <span className="font-semibold">Date</span>, cell: (info: any) => new Date(info.getValue() as string).toLocaleDateString() },
    { accessorKey: 'policyAccountFund', header: 'Policy/Account Fund', cell: (info: any)=> info.getValue() },
    { accessorKey: 'productCategory', header: () => <span className="font-semibold">Category</span>, cell: (info: any) => info.getValue() },
    { accessorKey: 'productDetails', header: 'Product Details', cell:  (info: any) => info.getValue() },
    { accessorKey: 'bonus', header: 'Bonus', cell:  (info: any) => info.getValue() ? 'Yes' : 'No' },
    { accessorKey: 'bonusMarkup', header: 'Bonus Markup', cell:  (info: any) => `${info.getValue()}%` },
    { accessorKey: 'receivedRevenue', header: 'Received Revenue', cell:  (info: any)=> `$${info.getValue().toFixed(2)}` },
    // { accessorKey: 'postMarkupRevenue', header: 'Post Markup Revenue', cell:  (info: any) => `$${info.getValue().toFixed(2)}` },
  ]), [showSplitAgentColumns]);

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
  return (
    <>
      <div className="flex flex-col md:flex-row justify-end items-center gap-4">
        {/* <input
          type="text"
          value={search}
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)} // Trigger refresh on search change
          className="border p-1"
        /> */}
          <label className="flex items-center space-x-1 ml-6">
            <input
              type="checkbox"
              checked={showSplitAgentColumns}
              onChange={(e) => setShowSplitAgentColumns(e.target.checked)}
            />
            <span>Show Split Agents</span>
          </label>    
        {/* <select
          name="carrier"
          value={selectedCarrier}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleCarrierChange(e)}
          className="w-[7rem] border border-black rounded ml-2 py-1 px-3 text-grey-darker shadow appearance-none"
        >
          <option value="">All carriers</option>
          {carrierList.map(carrier => (
            <option key={carrier.id} value={carrier.id}>{carrier.carrierName}</option>
          ))}
        </select> */}
        {/* <button
          className="ml-0 p-2 bg-transparent text-black  dark:text-white rounded hover:bg-blue-700"
          onClick={() => setIsDateRangePopupVisible(true)}
        >
          <FaRegCalendarAlt size={30} />
        </button> */}
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
      {isDateRangePopupVisible && (
        <DateRangePopup
          isOpen={isDateRangePopupVisible}
          onClose={() => setIsDateRangePopupVisible(false)}
          onApply={handleDateRangeApply}
          inputStartDate={startDate}
          inputEndDate={endDate}
        />
      )} 
    </>
  );
}

export default CommissionLogEntries;
