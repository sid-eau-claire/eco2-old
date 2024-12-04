'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TableViewCache } from '@/components/Tables';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { IoMdCloseCircle } from 'react-icons/io';
import { FaCommentDots, FaEdit } from "react-icons/fa";
import { MdMoveUp, MdAddCircle } from "react-icons/md";
import { BiDetail } from 'react-icons/bi';
import { ConfirmPopup, PopupComponent } from '@/components/Popup';
import { RoundButton } from '@/components/Button';
import { ToolTip } from '@/components/Common/ToolTip';
import { StatusIcon } from '@/components/Icons';
import EditRecord from './EditRecord';
import AddRecord from './AddRecord';
import ViewEntriesInLog from './ViewEntriesInLog';
import CommentsBox from '@/components/Comments';
import { twMerge } from 'tailwind-merge';
import { getCarriers, getAdvisorNameList } from '../_actions/retrievedata';
import { fetchCommissionLogs, deleteCommissionLog, modifyCommissionLog, revalidating } from '../_actions/commission';
import { generatePaymentPeriodPreview } from '../_actions/payment';
import { normalize } from '@/lib/format';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { updateReadyToPay, getReadyToPay, getIsGeneratingPayroll, getIsSettling, updateIsSettling } from '../_actions/setting'

const JustIn = ({ refreshTab, setRefreshTab }: { refreshTab: number, setRefreshTab: any }) => {
  const [commissionLogs, setCommissionLogs] = useState<any[]>([]);
  const [isConfirmPopupVisible, setIsConfirmPopupVisible] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [selectedIdsToMove, setSelectedIdsToMove] = useState<string[]>([]);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [showEditRecordDialog, setShowEditRecordDialog] = useState(false);
  const [selectedCommissionLogId, setSelectedCommissionLogId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(100);
  const [carrierOptions, setCarrierOptions] = useState<any>([]);
  const [refreshData, setRefreshData] = useState(1);
  const [isViewEntriesInLog, setIsViewEntriesInLog] = useState(false);
  const [readyToPay, setReadyToPay] = useState<boolean | null>(null);
  const [isCommentsBoxVisible, setIsCommentsBoxVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const carriers = await getCarriers();
      setCarrierOptions(carriers);

      const logs = await fetchCommissionLogs(1, 100, false, '', '', '', 'Just In');
      setCommissionLogs(normalize(logs));

      const response = await getReadyToPay();
      setReadyToPay(response?.data?.readyToPay);
    };
    fetchData();
  }, [refreshData, refreshTab]);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            table.toggleAllPageRowsSelected(e.target.checked);
            if (e.target.checked) {
              setSelectedRows(table.getRowModel().rows.map(row => row.original.id));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => {
            row.toggleSelected(e.target.checked);
            if (e.target.checked) {
              setSelectedRows(prev => [...prev, row.original.id]);
            } else {
              setSelectedRows(prev => prev.filter(id => id !== row.original.id));
            }
          }}
        />
      ),
      enableSorting: false,
    },
    {
      accessorFn: (row: any) => row.carrierId ?? '',
      id: 'carrierId',
      header: () => <span className="font-semibold">Carrier</span>,
      cell: (info: any) => {
        return (
          <span className="" onClick={() => console.log('h')}>
            {carrierOptions.find((carrier: any) => carrier?.id == info.row.original.carrierId.id)?.carrierName}
          </span>
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
      cell: (info: any) => {
        if (info.getValue() != null) {
          return (`$${info.getValue()?.toFixed(2)}`)
        }
      },
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
                onClick={() => handleDetailClick(info.row.original.id)}
              />
              <RoundButton
                icon={FaEdit}
                hint='Update record'
                className='text-primary m-0'
                iconSize={24}
                hintHPos='-30%'
                hintVPos='120%'                
                onClick={() => handleEditClick(info.row.original.id)}
              />
              <RoundButton
                icon={FaCommentDots}
                hint='Notes'
                className='text-primary m-0'
                iconSize={24}
                hintHPos='-30%'
                hintVPos='120%'
                onClick={() => {setSelectedCommissionLogId(info.row.original.id); setIsCommentsBoxVisible(true)}}
              />
              {(info.row.original.statementAmount && 
                (info.row.original.deposit || info.row.original.deposit == 0) &&
                info.row.original.bankDepositStatus &&
                info.row.original.payrollStatus &&
                info.row.original.depositDate &&
                info.row.original.fieldPayDate &&
                info.row.original.carrierId &&
                info.row.original.statementDate &&
                !readyToPay
              ) ? (
                <RoundButton
                  icon={MdMoveUp}
                  hint='Move to current Pay Run'
                  className={twMerge(`text-success m-0 `, readyToPay ? 'text-meta-2' : '')}
                  iconSize={24}
                  hintHPos='-450%'
                  hintVPos='120%'
                  disabled={(info.row.original.paymentPeriodId?.id || readyToPay || selectedRows.length > 0) ? true : false}
                  onClick={() => handleMoveClick([info.row.original.id])}
                />              
              ):(
                <RoundButton
                  icon={MdMoveUp}
                  hint='Move to current Pay Run'
                  className={twMerge(`text-meta-9   m-0 `, '')}
                  iconSize={24}
                  hintHPos='-450%'
                  hintVPos='120%'
                  disabled={true}
                  onClick={() => handleMoveClick([info.row.original.id])}
                />                    
              )}
              <RoundButton
                icon={IoMdCloseCircle}
                hint='Delete commission log'
                className='text-primary m-0'
                iconSize={24}
                hintHPos='-570%'
                hintVPos='120%'
                onClick={() => handleDeleteClick(info.row.original.id)}
              />
            </div>
          )}
        </>
      ),
      enableSorting: false,
    },    
  ], [carrierOptions, selectedRows, readyToPay]);

  const handleDetailClick = (id: string) => {
    setSelectedCommissionLogId(id);
    setIsViewEntriesInLog(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedIdToDelete(id);
    setIsConfirmPopupVisible(true);
  };

  const handleEditClick = (id: string) => {
    setSelectedCommissionLogId(id);
    setShowEditRecordDialog(true);
  };

  const confirmDelete = async (id: string) => {
    await deleteCommissionLog(id);
    await revalidating();
    setRefreshData(prev => prev + 1);
    setIsConfirmPopupVisible(false);
  };

  const handleMoveClick = async (ids: string[]) => {
    const response = await getReadyToPay();
    setReadyToPay(response?.data?.readyToPay);
    if (response?.data?.readyToPay) {
      setRefreshData(prev => prev + 1);
      setRefreshTab((prev:any) => prev + 1);
    } else {
      setSelectedIdsToMove(ids);
      setIsConfirmPopupVisible(true);
    }
  };

  const confirmMove = async (ids: string[]) => {
    for (const id of ids) {
      const newFormData = new FormData();
      newFormData.append('data', JSON.stringify({payrollStatus: 'Current Pay Run'}));
      await modifyCommissionLog(Number(id), newFormData);
    }
    await revalidating();
    setRefreshData(prev => prev + 1);
    setRefreshTab((prev:any) => prev + 1);  
    setIsConfirmPopupVisible(false);
    setSelectedRows([]);
  };

  return (
    <>
      <div className="flex justify-end py-1 px-2">
        {selectedRows.length === 0 ? (
          <RoundButton
            icon={MdAddCircle}
            className="m-0 pt-0 bg-transparent text-primary rounded-md"
            onClick={() => setShowAddRecordDialog(true)}
            hint="Add new record"
          />
        ) : (
          <RoundButton
            icon={MdMoveUp}
            className="m-0 pt-0 bg-transparent text-primary rounded-md"
            onClick={() => handleMoveClick(selectedRows)}
            hint="Move selected to Current Pay Run"
          />
        )}
      </div>

      <TableViewCache 
        data={commissionLogs}
        columns={columns}
        pageSize={pageSize}
        initialSorting={{ id: 'statementDate', desc: true }}
      />

      <Dialog open={showAddRecordDialog} onOpenChange={(open) => !open && setShowAddRecordDialog(false)}>
        <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto">
          <DialogTitle className="flex justify-between items-center">
            <p className='text-xl font-bold'>Add Commission Log</p>
          </DialogTitle>          
          <AddRecord
            isOpen={showAddRecordDialog}
            onClose={() => {
              setShowAddRecordDialog(false);
              setRefreshData(prev => prev + 1);
              setRefreshTab((prev: number) => prev + 1);
            }}
          />
          <DialogDescription></DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditRecordDialog} onOpenChange={(open) => !open && setShowEditRecordDialog(false)}>
        <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto">
          <DialogTitle className="flex justify-between items-center">
            <p className='text-xl font-bold'>Edit Commission Log</p>
          </DialogTitle>
          <EditRecord
            isOpen={showEditRecordDialog}
            selectedCommissionLogId={selectedCommissionLogId}
            onClose={() => {
              setShowEditRecordDialog(false);
              setSelectedCommissionLogId(null);
              setRefreshData(prev => prev + 1);
              setRefreshTab((prev: number) => prev + 1);
            }}
          />
          <DialogDescription></DialogDescription>
        </DialogContent>
      </Dialog>

      {isConfirmPopupVisible && selectedIdToDelete && (
        <ConfirmPopup
          heading="Confirm Deletion"
          message="Are you sure you want to delete this commission log?"
          onConfirm={() => confirmDelete(selectedIdToDelete)}
          onCancel={() => setIsConfirmPopupVisible(false)}
        />
      )}

      {isConfirmPopupVisible && selectedIdsToMove.length > 0 && (
        <ConfirmPopup
          heading="Confirm to move to Current Payroll Run"
          message={`Are you sure you want to move ${selectedIdsToMove.length} commission log(s) to current pay run?`}
          onConfirm={() => confirmMove(selectedIdsToMove)}
          onCancel={() => setIsConfirmPopupVisible(false)}
          button1Color='bg-success'
        />
      )}

      <PopupComponent
        isVisible={isViewEntriesInLog}
        onClose={() => setIsViewEntriesInLog(false)}
      >
        <ViewEntriesInLog
          commissionLogId={selectedCommissionLogId ?? ''}
          onClose={() => setIsViewEntriesInLog(false)}
        />
      </PopupComponent>

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
    </>
  );
};

export default JustIn;