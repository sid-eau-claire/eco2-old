'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { normalize } from '@/lib/format';
import { ColContainer, PanelContainer } from '@/components/Containers';
import GenericTable from '@/components/Tables/TableView';
import { FaRegCalendarAlt } from "react-icons/fa";
import DateRangePopup from '@/components/Input/DateRangePopup'; // Adjust import path as needed

// interface CommissionLogEntry {
//   id: number;
//   line: number;
//   carrier: string;
//   writingAgent: string;
//   writingAgentPercentage: number;
//   splitAgent1: string;
//   splitAgent1Percentage: number;
//   splitAgent2: string;
//   splitAgent2Percentage: number;
//   splitAgent3: string;
//   splitAgent3Percentage: number;
//   clientName: string;
//   policyAccountFund: string;
//   transactionDate: string;
//   productCategory: string;
//   productDetails: string;
//   bonus: boolean;
//   bonusMarkup: number;
//   receivedRevenue: number;
//   postMarkupRevenue: number;
//   createdAt: string;
//   updatedAt: string;
// }

// const commissionLogEntriesIds: CommissionLogEntry[] = [
//   {
//     id: 27292,
//     line: 129,
//     carrier: "Canada Protection Plan",
//     writingAgent: "Iana Antonova",
//     writingAgentPercentage: 100,
//     splitAgent1: "",
//     splitAgent1Percentage: 0,
//     splitAgent2: "",
//     splitAgent2Percentage: 0,
//     splitAgent3: "",
//     splitAgent3Percentage: 0,
//     clientName: "Ivanova",
//     policyAccountFund: "MH00344690",
//     transactionDate: "2024-04-09",
//     productCategory: "Bonus",
//     productDetails: "2016 CPP Deferred Life",
//     bonus: false,
//     bonusMarkup: 0,
//     receivedRevenue: 800.57,
//     postMarkupRevenue: 800.57,
//     createdAt: "2024-06-14T19:18:55.913Z",
//     updatedAt: "2024-06-14T19:18:55.913Z"
//   }
// ];

const ViewCommissionLogEntries: React.FC<{ entries:  any , onClose: () => void }> = ({ entries, onClose }) => {
  // const [entries, setEntries] = useState<CommissionLogEntry[]>(commissionLogEntriesIds);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [isDateRangePopupVisible, setIsDateRangePopupVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showSplitAgentColumns, setShowSplitAgentColumns] = useState(true);

  useEffect(() => {
    // Setting page count based on entries and page size
    setPageCount(Math.ceil(entries.length / pageSize));
  }, [entries.length, pageSize]);

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

  const handleDateRangeApply = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    setIsDateRangePopupVisible(false);
  };

  return (
    <ColContainer cols="1:1:1:1">
      <PanelContainer header='Commission Log Entries' className='relative'>
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
            onChange={(e) => setSearch(e.target.value)}
            className="border p-1"
          />
          <button
            className="ml-0 p-2 bg-transparent text-black dark:text-white rounded hover:bg-blue-700"
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
          onRefresh={() => console.log('test')} // Refresh data to original array
          searchPlaceholder="Search..."
          search={search}
        />
      </PanelContainer>
      {isDateRangePopupVisible && (
        <DateRangePopup
          isOpen={isDateRangePopupVisible}
          onClose={() => setIsDateRangePopupVisible(false)}
          onApply={handleDateRangeApply}
          inputStartDate={startDate}
          inputEndDate={endDate}
        />
      )}
    </ColContainer>
  );
}

export default ViewCommissionLogEntries;
