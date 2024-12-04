'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { ColContainer, RowContainer, PanelContainer } from '@/components/Containers';
import { LoadingButton, RoundButton } from '@/components/Button';
import { TableViewCache } from '@/components/Tables';
import { getCarriers } from '../_actions/retrievedata';
import { CommissionLog } from '@/types/commissionlog';
import { PopupComponent } from '@/components/Popup';
import EditRecord from './EditRecord';
import { ToolTip } from '@/components/Common/ToolTip';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { IoMdCloseCircle } from 'react-icons/io';
import { FaCommentDots } from "react-icons/fa";
import { MdMoveUp } from "react-icons/md";
import { BiDetail } from 'react-icons/bi';
import { modifyCommissionLog, fetchCommissionLogs, revalidating, deleteCommissionLog} from '../_actions/commission'
import { FaEdit } from "react-icons/fa";
import ViewEntriesInLog from './ViewEntriesInLog';
import { twMerge } from 'tailwind-merge';
import { normalize } from '@/lib/format';
import { StatusIcon} from '@/components/Icons'
// import {updateReadyToPay, getReadyToPay, getIsGeneratingPayroll, updateIsGeneratingPayroll} from '../_actions/setting'
import {updateReadyToPay, getReadyToPay, getIsGeneratingPayroll} from '../_actions/setting'
import {generateCommissionTransaction} from '../_actions/payment'
import CommissionPreview from './CommissionPreview'
import CommentsBox from '@/components/Comments';
import { canAccess } from '@/lib/isAuth';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TableDataItem = {
  [key: string]: any;
}

const CurrentPay = ({refreshTab, setRefreshTab}: {refreshTab: number, setRefreshTab: any}) => {
  const [commissionLogs, setCommissionLogs] = useState<CommissionLog[]>([]);
  const [selectedCommissionLogId, setSelectedCommissionLogId] = useState<string | null>(null);
  const [showEditRecordPopup, setShowEditRecordPopup] = useState(false);
  const [pageSize, setPageSize] = React.useState(100);
  const [carrierOptions, setCarrierOptions] = useState<any>([]);
  const [refreshData, setRefreshData] = useState(1);
  const [commissionLogId, setCommissionLogId] = useState<string | null>(null);
  const [isViewEntriesInLog, setIsViewEntriesInLog] = useState(false);
  const [readyToPay, setReadyToPay] = useState(false);
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [isCommentsBoxVisible, setIsCommentsBoxVisible] = useState(false);
  const [isAllowRun, setIsAllowRun] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const getCarrierOptions = async () => {
      const carriers = await getCarriers();
      await setCarrierOptions(carriers);
    }
    const getIsAllowRun = async () => {
      const isAllowRun: boolean = await canAccess(['Superuser', 'InternalStaff'], ['commissionRun']);
      setIsAllowRun(isAllowRun);
    }
    getCarrierOptions();
    getIsAllowRun();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      let page=1; let pageSize = 100; let showUnpaidLogOnly = false; let selectedCarrier = ''; let formattedStartDate = ''; let formattedEndDate = ''; let payrollStatus = 'Current Pay Run';
      const logs = await fetchCommissionLogs(page, pageSize, showUnpaidLogOnly, selectedCarrier, formattedStartDate, formattedEndDate, payrollStatus)
      setCommissionLogs(normalize(logs));
    };
    const fetchSetting = async () => {
      const response = await getReadyToPay();
      setReadyToPay(response?.data?.readyToPay);
      const response1 = await getIsGeneratingPayroll();
      setIsGeneratingPayroll(response1?.data?.isGeneratingPayroll);
    }
    fetchLogs();
    fetchSetting();
  }, [refreshData, refreshTab]);

  const columns: ColumnDef<TableDataItem>[] = useMemo(() => [
    // {
    //   id: 'detail',
    //   header: () => <span className="font-semibold w-[1rem]"></span>,
    //   cell: (info: any) => (
    //     <ToolTip message='View commission log entries'>
    //       <button
    //         onClick={() => handleDetailClick(info.row.original.id)} // Assuming each row has a unique 'id'
    //         className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
    //         >
    //         <BiDetail className='cursor-pointer' size={30}/>
    //       </button>
    //     </ToolTip>
    //   ),
    //   enableSorting: false,
    // },
    {
      accessorFn: (row: CommissionLog) => row.carrierId ?? '',
      id: 'carrierId',
      header: () => <span className="font-semibold">Carrier</span>,
        cell: (info: any) => {
          // const matchingCarrier = carrierOptions.find((carrier: any) => carrier?.id === info.getValue());
          // const carrierName = matchingCarrier ? matchingCarrier?.carrierName : 'Unknown';
          return (
            // <Link href={`/dashboard/carriers/${info.row.original.carrierId.id}`}>
              <span className="" onClick={()=>console.log('h')}>
                {/* {carrierOptions.find((carrier: any) => carrier?.id == info.row.original.carrierId.id )?.carrierName} */}
                {carrierOptions.find((carrier: any) => carrier?.id == info.row.original.carrierId.id )?.carrierName}
              </span>
            // </Link>
          )
        },
      enableSorting: false,
    },    
    {
      accessorKey: 'statementDate',
      header: () => <span className="font-semibold">Statement Date</span>,
      cell: (info: any) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: 'statementAmount',
      header: () => <span className="font-semibold">Statement Amount</span>,
      cell: (info: any) => {
        if (info.getValue() != null) {
          return (`$${info.getValue()?.toFixed(2)}`)
        }
      },
      enableSorting: false,
    },
    {
      accessorKey: 'bankDepositStatus',
      header: () => <span className="font-semibold">Status<br/>[S/D/L/P]</span>,
      cell: (info: any) => {
        const { statementDate, statementAmount, originalStatement, depositDate, deposit, fieldPayDate, totalPostMarkupRevenue } = info.row.original;
        const allStatementFieldsFilled = statementDate && statementAmount && originalStatement;
        const depositFieldsFilled = depositDate && deposit;
        const depositAmountCheck = deposit == statementAmount;
    
        return (
          <div className="flex space-x-2">
            {StatusIcon(allStatementFieldsFilled ? 1 : 3, "Statement Date, Amount and Raw Statement must be inputted")}
            {StatusIcon(depositFieldsFilled && depositAmountCheck ? 1 : depositFieldsFilled ? 2 : 3, 
              depositFieldsFilled ? (depositAmountCheck ? "Deposit matches the statement amount" : "Deposit details are complete but does not match the statement amount") : "Deposit details are incomplete"
            )}
            {StatusIcon(totalPostMarkupRevenue != null ? 1 : 3, "ECO log need to be uploaded!")}
            {StatusIcon(fieldPayDate ? 1 : 3, "Field pay date must be specified")}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'depositDate',
      header: () => <span className="font-semibold">Deposit Date</span>,
      cell: (info: any) => info.getValue(),
      enableSorting: false,
    },
    {
      accessorKey: 'deposit',
      header: () => <span className="font-semibold">Deposit</span>,
      cell: (info: any) => {
        if (info.getValue() != null) {
          return (`$${info.getValue()?.toFixed(2)}`)
        }
      },
      enableSorting: false,
    },    
    {
      accessorKey: 'payrollStatus',
      header: () => <span className="font-semibold">Payroll Status</span>,
      cell: (info: any) => info.getValue(),
      enableSorting: false, 
    },
    {
      accessorKey: 'totalPostMarkupRevenue',
      header: () => <span className="font-semibold">Total MarkUp revenue</span>,
      cell: (info: any) => info.getValue(),
      enableSorting: false, 
    },    
    {
      accessorKey: 'fieldPayDate',
      header: () => <span className="font-semibold">Field Pay Date</span>,
      cell: (info: any) => info.getValue(),
      enableSorting: false,
    },    
    {
      id: 'delete',
      header: () => <span className="font-semibold">Actions</span>,
      cell: (info: any) => (
        <>
          {info.row.original.paymentPeriodId?.id ? (
            <RoundButton
              disabled={true}
              icon={IoMdCloseCircle}
              hint='No allowed!'
            />
          ):(
            <div className='flex flex-row justify-center items-start space-x-2 py-1'>
              <RoundButton
                icon={BiDetail}
                hint='View detail'
                className='text-primary m-0'
                iconSize={24}
                hintHPos='-30%'
                hintVPos='120%'                
                onClick={() => handleDetailClick(info.row.original.id)} // Assuming each row has a unique 'id'
              />
              <RoundButton
                icon={FaCommentDots}
                hint='Notes'
                className='text-primary m-0'
                iconSize={24}
                hintHPos='-30%'
                hintVPos='120%'
                onClick={() => {setSelectedCommissionLogId(info.row.original.id); setIsCommentsBoxVisible(true)}} // Assuming each row has a unique 'id'
              />            
              <RoundButton
                icon={FaEdit}
                hint='Update record'
                hintHPos="-8rem"
                className='text-primary m-0'
                iconSize={24}
                onClick={() => handleEditClick(info.row.original.id)} // Assuming each row has a unique 'id'
              />
              <RoundButton
                icon={IoMdCloseCircle}
                hint='Delete commission log'
                className={twMerge(`text-primary m-0`, readyToPay ? 'text-meta-2' : '')}
                iconSize={24}
                hintHPos="-12rem"
                disabled={readyToPay ? true : false}
                onClick={() => handleDeleteClick(info.row.original.id)} // Assuming each row has a unique 'id'
              />
            </div>
          )}
        </>
      ),
      enableSorting: false,
    },    
    // Add more columns as necessary
  ], [carrierOptions]);


  const handleDetailClick = async (id: string) => {
    setCommissionLogId(id);
    await setTimeout(() => {setIsViewEntriesInLog(true)}, 200);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this commission log?")) {
      await deleteCommissionLog(id);
      await revalidating();
      await setRefreshData(refreshData + 1);
    }
  }

  const handleEditClick = async (id: string) => {
    setSelectedCommissionLogId(id);
    await setShowEditRecordPopup(true);
  }
  const waitForGeneratingPayrollComplete = async (maxAttempts = 60): Promise<void> => {
    const checkPayrollStatus = async (attempts = 0): Promise<void> => {
      if (attempts >= maxAttempts) {
        console.error('Max attempts reached. Payroll generation might be stuck.');
        return;
      }
      try {
        const response = await getIsGeneratingPayroll();
        console.log('response', response);
        if (response?.data?.isGeneratingPayroll) {
          // If still generating, wait for 10000ms and check again
          await new Promise(resolve => setTimeout(resolve, 10000));
          return checkPayrollStatus(attempts + 1);
        } else {
          // If generation is complete, update the data
          setIsLoading(false);
          setRefreshData(prev => prev + 1);
          setRefreshTab((prev: any) => prev + 1);
        }
      } catch (error) {
        console.error('Error checking payroll generation status:', error);
        // In case of error, wait and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        return checkPayrollStatus(attempts + 1);
      }
    };
  
    await checkPayrollStatus();  // Ensure you await the initial call
  };
  
  const handleGenerateTransaction = async () => {
    setIsLoading(true);
    setIsConfirmDialogOpen(false);
    try {
      const response = await getIsGeneratingPayroll();
      if (response?.data?.isGeneratingPayroll) {
        alert('Settlement is in progress. Please wait until it is completed.');
        setIsLoading(false);  // Don't forget to set loading to false here
        return;
      }
      await generateCommissionTransaction('dummy');
      await waitForGeneratingPayrollComplete();  // Add parentheses to call the function
      console.log('after generating payroll');
      await revalidating();
    } catch (error) {
      console.error('Error generating transaction:', error);
      alert('An error occurred while generating the transaction.');
    } finally {
      // setIsLoading(false);  // Always set loading to false in finally block
    }
  };

  const handleReadyToPay = async () => {
    setIsLoading(true);
    try {
      await updateReadyToPay(true);
      setRefreshData(prev => prev + 1);
      setRefreshTab((prev:any) => prev + 1);
      setReadyToPay(true);
    } catch (error) {
      console.error('Error updating ready to pay status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async () => {
    setIsLoading(true);
    try {
      await updateReadyToPay(false);
      setRefreshData(prev => prev + 1);
      setRefreshTab((prev:any) => prev + 1);
      setReadyToPay(false);
    } catch (error) {
      console.error('Error releasing ready to pay status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ColContainer cols='1:1:1:1'>
        <div className="flex flex-row justify-end my-0 py-1 mt-0">
          {!readyToPay ? (
            <Button
              onClick={handleReadyToPay}
              disabled={!isAllowRun || isLoading}
              className="max-w-[10rem]"
            >
              {isLoading  ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Ready to Pay"
              )}
            </Button>
          ) : (
            <div className='flex flex-row space-x-4'>
              <Button
                onClick={handleRelease}
                disabled={!isAllowRun || isLoading}
                className="w-[15rem] bg-warning"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Release"
                )}
              </Button>
              <Button
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={commissionLogs.length == 0 || !isAllowRun || isLoading || isGeneratingPayroll}
                className="w-[15rem] bg-success"
              >
                {(isLoading || isGeneratingPayroll) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Generate Payroll"
                )}
              </Button>
            </div>
          )}
        </div>
        <PanelContainer header="Commission logs" className='relative mt-3'>
          {readyToPay && (
            <div className='absolute top-0 left-0 right-0 bottom-0 bg-slate-300/40'></div>
          )}          
          <TableViewCache 
            data={commissionLogs}
            columns={columns}
            pageSize={pageSize}
            initialSorting={{ id: 'statementDate', desc: true }}
          />
        </PanelContainer>
      </ColContainer>

      {selectedCommissionLogId && (
        <PopupComponent
          isVisible={showEditRecordPopup}
          onClose={() => { setShowEditRecordPopup(false); }}
        >
          <EditRecord 
            selectedCommissionLogId={selectedCommissionLogId} 
            onClose={() => {
              revalidating();
              setRefreshData(prev => prev + 1);
              setRefreshTab((prev: any) => prev + 1);
              setShowEditRecordPopup(false);
            }} 
            isOpen={true}
          />
        </PopupComponent>
      )}

      <PopupComponent
        isVisible={isViewEntriesInLog}
        onClose={() => { setIsViewEntriesInLog(false); }}
      >
        <ViewEntriesInLog 
          commissionLogId={commissionLogId ?? ''} 
          onClose={() => setIsViewEntriesInLog(false)} 
        />
      </PopupComponent>

      <CommissionPreview refreshTab={refreshTab} setRefreshTab={setRefreshTab}/>

      {isCommentsBoxVisible && selectedCommissionLogId && (
        <CommentsBox
          collectionType="commissionlog"
          id={selectedCommissionLogId}
          isOpen={isCommentsBoxVisible}
          onClose={() => setIsCommentsBoxVisible(false)}
          link={`/dashboard/commission`}
          recipientIds={[1]}
        />
      )}

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm to generate transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to generate transactions for these commission logs?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateTransaction} className="bg-success">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CurrentPay;