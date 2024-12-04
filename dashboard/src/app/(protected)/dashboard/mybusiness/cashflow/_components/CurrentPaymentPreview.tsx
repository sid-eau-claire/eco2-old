'use client'
import React, { useMemo, useState } from 'react';
import TableViewCache from '@/components/Tables/TableViewCache';
import { formatCurrency } from '@/lib/format';
import { ColContainer, RowContainer } from '@/components/Containers';

const CurrentPaymentPreview = ({ currentCashflow }: { currentCashflow: any }) => {
  const [search, setSearch] = useState('');
  const [showSplitAgentColumns, setShowSplitAgentColumns] = useState(false);

  const consolidatedLogs = useMemo(() => {
    if (!currentCashflow || !currentCashflow.relatedTransactions) return [];
    return currentCashflow.relatedTransactions.flatMap((transaction: any) => 
      transaction.statementLog.map((log: any, index: number) => ({
        ...log,
        tableIndex: index + 1,
        SOURCE: log.source,
        // CARRIER: log.logId?.carrier,
        // CLIENT_NAME: log.logId?.clientName,
        // POLICY_ACCOUNT_NUMBER: log.logId?.policyAccountFund,
        // TRANS_DATE: log.logId?.transactionDate,
        // WRITING_ADVISOR: log.logId?.writingAgent,
        // ADV_PERCENTAGE: `${log.logId?.writingAgentPercentage}%`,
        // SPLIT_ADVISOR: log.logId?.splitAgent1 || '',
        // SPLIT_ADV_PERCENTAGE: log.logId?.splitAgent1Percentage > 0 ? `${log.logId?.splitAgent1Percentage}%` : '',
        // TRANS_TYPE: log.logId?.productCategory,
        // TRANS_DETAILS: log.logId?.productDetails,
        FIELD_REV: log.fieldRevenue,
        GENERATION: log.generation,
        LVL: log.level,
        LVL_PERCENTAGE: `${log.levelPercentage}%`,
        COMMISSION: log.commission
      }))
    );
  }, [currentCashflow]);

  const filteredLogs = useMemo(() => {
    return consolidatedLogs.filter((log: any) =>
      Object.entries(log).some(([key, value]) => 
        key !== 'tableIndex' && value?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, consolidatedLogs]);

  const columns = useMemo(() => {
    let baseColumns = [
      { accessorKey: 'tableIndex', header: '#', size: 50 },
      { accessorKey: 'SOURCE', header: 'Source' },
      // { accessorKey: 'CARRIER', header: 'Carrier' },
      // { accessorKey: 'CLIENT_NAME', header: 'Client Name' },
      // { accessorKey: 'POLICY_ACCOUNT_NUMBER', header: 'Policy / Account Number' },
      // { accessorKey: 'TRANS_DATE', header: 'Transaction Date' },
      // { accessorKey: 'WRITING_ADVISOR', header: 'Writing Advisor' },
      // { accessorKey: 'ADV_PERCENTAGE', header: 'Adv. %' },
      // { accessorKey: 'TRANS_TYPE', header: 'Transaction Type' },
      // { accessorKey: 'TRANS_DETAILS', header: 'Transaction Details' },
      { accessorKey: 'FIELD_REV', header: 'Field Rev.', cell: (info: any) => formatCurrency(info.getValue()) },
      { accessorKey: 'GENERATION', header: 'Generation' },
      { accessorKey: 'LVL', header: 'Level' },
      { accessorKey: 'LVL_PERCENTAGE', header: 'Level %' },
      { accessorKey: 'COMMISSION', header: 'Commission', cell: (info: any) => formatCurrency(info.getValue()), accessor: 'commission', aggregate: true }
    ];
    if (showSplitAgentColumns) {
      baseColumns.push(
        { accessorKey: 'SPLIT_ADVISOR', header: 'Split Advisor' },
        { accessorKey: 'SPLIT_ADV_PERCENTAGE', header: 'Split Adv. %' }
      );
    }
    return baseColumns;
  }, [showSplitAgentColumns]);

  return (
    <ColContainer cols="1:1:1:1">
      <RowContainer className='mt-4'>
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-xl font-semibold mb-4">Current Payment Preview</h3>
          <div className="flex justify-end items-center mb-3 px-3">
            {/* <label className="flex items-center space-x-1 ml-6">
              <input
                type="checkbox"
                checked={showSplitAgentColumns}
                onChange={(e) => setShowSplitAgentColumns(e.target.checked)}
              />
              <span>Show Split Agents</span>
            </label>    
            <input
              type="text"
              className="ml-4 shadow appearance-none border rounded py-1 px-3 text-grey-darker"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            /> */}
          </div>
        </div>
      </RowContainer>
      <RowContainer>
        <TableViewCache
          data={filteredLogs}
          columns={columns}
          pageSize={10}
          initialSorting={[]}
        />
      </RowContainer>
    </ColContainer>
  );
};

export default CurrentPaymentPreview;