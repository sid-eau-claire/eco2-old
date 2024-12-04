import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import {motion} from 'framer-motion';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import MessageBox from '@/components/Popup/MessageBox';
import LoadingButton from '@/components/Button/LoadingButton';
import LoadingButtonNP from '@/components/Button/LoadingButtonNP';
import { CommissionLog } from '@/types/commissionlog';
import { createCommissionLog, createCommissionLogEntry, modifyCommissionLog, revalidating } from '../_actions/commission';
import CircularProgressBar from '@/components/Common/CircularProgressBar';
import { useRouter} from 'next/navigation';
import { generatePaymentPeriodPreview} from './../_actions/payment'
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { set } from 'zod';
import {redirect} from 'next/navigation';

// const TableView = ({ commissionLog, newRecords, recordValidation, totalCommissionDeposited, totalCalculatedDeposited }: {commissionLog: CommissionLog, newRecords: any[], recordValidation: any[], totalCommissionDeposited: number, totalCalculatedDeposited: number }) => {
const TableView = ({ commissionLog, newRecords, recordValidation, onClose }: {commissionLog: CommissionLog, newRecords: any[], recordValidation: any[], onClose: any}) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [showInvalidOnly, setShowInvalidOnly] = useState(false); // State to manage the checkbox for showing invalid records only
  const [showSplitAgentColumns, setShowSplitAgentColumns] = useState(true); // New state for showing split agent columns
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0); // Example total


  const variants = {
    hidden: { opacity: 0, x: -200, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 0, y: -100 },
  };

  const filteredRecords = useMemo(() => {
    if (showInvalidOnly) {
      // When showInvalidOnly is true, filter records to include only those marked as invalid
      return newRecords.filter((_, index) => !recordValidation[index]?.valid);
    }    
    return newRecords.filter(record => {
      const searchLower = search.toLowerCase();
      return Object.keys(record).some(key => {
        if (typeof record[key] === 'string') {
          return record[key].toLowerCase().includes(searchLower);
        }
        if (typeof record[key] === 'number') {
          return record[key].toString().includes(searchLower);
        }
        if (key === 'transactionDate') {
          return new Date(record[key]).toLocaleDateString().includes(searchLower);
        }
        return false;
      });
    });
  }, [newRecords, search, showInvalidOnly, recordValidation]); // Added showInvalidOnly and recordValidation to the dependency array
  
  const columns = useMemo(() => {
    let baseColumns = [ 
      {
        accessorKey: 'line',
        header: () => <span>Line</span>,
        cell: (info: any) => {
          // Assuming 'id' can be used to match records and their validation status
          const recordId = info.getValue(); // Access the unique identifier from the original data
          const isValid = recordValidation.find((validation) => validation.line == recordId)?.valid;
          return (
            <div className='flex flex-row justify-start items-center space-x-2'>
              {isValid 
                ? <IoMdCheckmarkCircle className='text-success mr-1' size={20} /> 
                : <IoMdCloseCircle className='text-danger mr-1' size={20} />
              } {info.getValue()}
            </div>
          );
        },
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
    baseColumns = baseColumns.concat([
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
    ])
  return baseColumns;
  }, [showSplitAgentColumns]);
  
  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  const handleCommission = async () => {
    let message = '';
    try {
      // Add commissionLog
      const newFormData = new FormData();
      newFormData.append('data', JSON.stringify({...commissionLog, bankDepositStatus: 'Statement Only'}
      ));
      let result = null
      console.log('commissionLogId', commissionLog?.id)
      if (commissionLog?.id) {
        result = await modifyCommissionLog(commissionLog?.id, newFormData); // Assuming `commissionLog` is defined elsewhere
      } else {
        result = await createCommissionLog(newFormData); // Assuming `commissionLog` is defined elsewhere
      }

      // Add entries under this commission log
      console.log('sucess result', result )
      if (result.success) {
        const commissionLogId = Number(result?.data?.id);
        console.log('commissionLogId', commissionLogId)
        if (commissionLogId === undefined) {
          message = 'An error occurred while creating the commission log.';
          throw new Error('Commission log ID is undefined');
        }
        setTotalItems(newRecords.length); // Set total items for progress bar
        setProgress(0); // Reset progress
        // Await completion of all createCommissionLogEntry calls
        await Promise.all(newRecords.map(async (record: any) => {
          const commissionLogEntry = { ...record, commissionLogId: commissionLogId};
          try {
            await createCommissionLogEntry(commissionLogEntry);
            setProgress(previous => previous + 1); // Increment progress
          } catch (error) {
            message = 'An error occurred while creating the commission log entry.';
            console.error(error);
          }
        }));
        message = "Commission log created successfully.";
        await revalidating();
        generatePaymentPeriodPreview();
        // Redirect to the commission log page
        // Show message about how many commission log entries were created
        // setPopupMessage(`Successfully created ${newRecords.length} commission log entries.`);
        // setIsPopupVisible(true);
        setTimeout(() => {
          onClose()
          setProgress(0)
          setTotalItems(0)
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      message = 'An error occurred while creating the commission log.';
    }
    // setProgress(0)
    // setTotalItems(0)
    // setPopupMessage(message); // Assuming setPopupMessage updates some state to display the message
    
  };
  // console.log(commissionLog)
  return (
    <motion.div className='container mx-auto p-0 relative'
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.2 }}
    >
      <motion.div className='flex flex-row justify-between items-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{delay: 0.2, duration: 0.4 }}
      >
        <div className="flex justify-end mb-4 space-x-8">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={showInvalidOnly}
              onChange={(e) => setShowInvalidOnly(e.target.checked)}
            />
            <span>Show Invalid Entries Only</span>
          </label>
          {/* New checkbox for toggling split agent columns */}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="ml-6 shadow appearance-none border rounded py-1 px-3 text-grey-darker"
          />
        </div>      
      </motion.div>
      {filteredRecords && (
        <motion.div className="overflow-x-auto sm:rounded-lg mb-3 rounded-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{delay: 0.6, duration: 0.6 }}
        >
          <table className='min-w-full text-sm divide-y divide-gray-200'>
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} scope="col" className="px-3 py-2 text-left text-xs font-semibold text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:text-white">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="inline ml-2">
                          {header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? <FaSortAlphaDownAlt /> : <FaSortAlphaDown />) : ''}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="odd:bg-white even:bg-whiter cursor-pointer hover:bg-bodydark2 hover:text-white"
                  onClick={() => {
                    const rowIndex = newRecords.findIndex(record => record.line === row.original.line);
                    const message = recordValidation[rowIndex]?.message || "No message available";
                    setPopupMessage(message);
                    setIsPopupVisible(true);
                  }}
                >
                  {row.getVisibleCells().map(cell =>
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center my-4">
            <div className='ml-4'>
              <button onClick={() => setPageIndex(old => Math.max(old - 1, 0))} disabled={pageIndex === 0} className="text-lg p-1 mr-2">
                <MdSkipPrevious size={30} />
              </button>
              <button onClick={() => setPageIndex(old => old < table.getPageCount() - 1 ? old + 1 : old)} disabled={pageIndex === table.getPageCount() - 1} className="text-lg p-1">
                <MdSkipNext size={30} />
              </button>
            </div>
            <span>Page <strong>{pageIndex + 1} of {table.getPageCount()}</strong></span>
            <div className='mr-4'>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="ml-2">
                {[10, 20, 30, 40, 50, 3000].map(size => (
                  <option key={size} value={size}>Show {size}</option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex flex-row justify-between items-center'>
            {
              recordValidation.every(record => record.valid) ? (
                <LoadingButton
                  className='w-[18rem] m-2 px-4 py-2 bg-primary hover:scale-1.1 text-white rounded hover:bg-blue-600 transition duration-300'
                  onClick={handleCommission}
                >
                  Import data to Eau Claire Two
                </LoadingButton>          
              ) : (
                <button
                  className='m-2 px-4 py-2 bg-body text-white rounded hover:bg-blue-600 transition duration-300'
                >
                  Cannot proceed. Investigate invalid data.
                </button>          
              )
            }
            <div>
              <p>Total Commission Deposited: <strong className='text-danger'>${commissionLog?.statementAmount}</strong> vs Total Calculated Post Markup Revenue: <strong className="text-danger">${Math.round((commissionLog?.totalPostMarkupRevenue || 0) * 100) / 100 }</strong></p>
            </div>
          </div>
        </motion.div>
      )}
      {isPopupVisible && (
        <MessageBox heading="Information" message={popupMessage} close={() => {setIsPopupVisible(false);}} />
      )}
      { (progress > 0  )  && (
        <motion.div className='fixed top-0 left-0 right-0 bottom-0 bg-bodydark/50 z-9999 flex flex-col justify-center items-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{delay: 0.3, duration: 0.4 }}
          exit={{ opacity: 0 }}
        >
          <p className='text-black  mb-6 text-2xl font-bold'>Processing... Please wait!!</p>
          <CircularProgressBar progress={progress} total={totalItems} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default TableView;

