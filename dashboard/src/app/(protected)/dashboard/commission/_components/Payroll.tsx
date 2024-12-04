'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/format';
import { PanelContainer, ColContainer, RowContainer } from '@/components/Containers';
import TableViewCache from '@/components/Tables/TableViewCache';
import Link from 'next/link';
import { BiDetail, BiDownload } from 'react-icons/bi';
import { ToolTip } from '@/components/Common/ToolTip';
import Loader from '@/components/Common/Loader';
import { createPaymentPeriod, fetchCurrentPaymentPeriod } from '../_actions/payment';
// import { updateReadyToPay, getReadyToPay, getIsGeneratingPayroll, updateIsGeneratingPayroll, getIsSettling, updateIsSettling } from '../_actions/setting';
import { updateReadyToPay, getReadyToPay, getIsGeneratingPayroll, getIsSettling, updateIsSettling } from '../_actions/setting';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

const Payroll = ({refreshTab, setRefreshTab}: {refreshTab: number, setRefreshTab: any}) => {
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(100);
  const [payPeriodDate, setPayPeriodDate] = useState('');
  const [readyToPay, setReadyToPay] = useState(false);
  const [isGeneratingPayroll, setIsGeneratingPayroll] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [refreshData, setRefreshData] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    setPayPeriodDate(formattedDate);

    const fetchSetting = async () => {
      const response = await getReadyToPay();
      setReadyToPay(response?.data?.readyToPay);
      const response1 = await getIsGeneratingPayroll();
      setIsGeneratingPayroll(response1?.data?.isGeneratingPayroll);
    };

    fetchSetting();
  }, [refreshTab, refreshData]);

  useEffect(() => {
    const fetchCurrentPaymentPeriodData = async () => {
      const response = await fetchCurrentPaymentPeriod();
      setData(response?.data || []);
    };
    const fetchIsSetting = async () => {
      const response = await getIsSettling();
      if (response?.data?.isSettling) {
        setIsSettling(true);
      }
    }
    fetchCurrentPaymentPeriodData();
    fetchIsSetting();
  }, [refreshTab, refreshData]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columnHeaders = [
      { header: 'Full Name', dataKey: 'fullName' },
      { header: 'Total Amount', dataKey: 'totalAmount' },
      { header: 'Escrow Amount', dataKey: 'escrowAmount' }
    ];
    const rows = data.map((row: any) => ({
      fullName: `${row.firstName.trim()} ${row.lastName.trim()}`,
      totalAmount: formatCurrency(row.totalPayment),
      escrowAmount: formatCurrency(row.totalHold)
    }));
    (doc as any).autoTable({
      theme: 'striped',
      columns: columnHeaders,
      body: rows
    });
    doc.save('payment-details.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map((row: any) => ({
      FullName: `${row.firstName.trim()} ${row.lastName.trim()}`,
      TotalAmount: row.totalPayment,
      EscrowAmount: row.totalHold
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Details');
    XLSX.writeFile(workbook, 'payment-details.xlsx');
  };

  const columns = useMemo(() => [
    // {
    //   id: 'detail',
    //   header: 'Detail',
    //   accessorFn: (row: any) => row.profileId.id,
    //   cell: (info: any) => (
    //     <ToolTip message='View detail statement log'>
    //       <Link href={`/dashboard/mybusiness/cashflow/${info.getValue()}`}>
    //         <BiDetail className='cursor-pointer' size={30}/>
    //       </Link>
    //     </ToolTip>
    //   )
    // },
    {
      id: 'fullName',
      header: 'Full Name',
      accessorFn: (row: any) => `${row.firstName.trim()} ${row.lastName.trim()}`,
      cell: (info: any) => (
        // <Link href={`/dashboard/profile/${info.row.original.profileId}`} className="underline">
          <div className='py-2'><strong>{info.getValue()}</strong></div>
        // </Link>
      )
    },
    {
      id: 'totalAmount',
      header: 'Total Amount',
      accessorFn: (row: any) => formatCurrency(row.totalPayment)
    },
    {
      id: 'escrowAmount',
      header: 'Escrow Amount',
      accessorFn: (row: any) => formatCurrency(row.totalHold)
    }
  ], []);

  const handleSettlePayments = async () => {
    const isSettlingResponse = await getIsSettling();
    if (isSettlingResponse?.data?.isSettling) {
      setIsSettling(true);
      alert('Another user is currently settling payments. Please try again later.');
      return;
    }
    setIsConfirmDialogOpen(true);
  }

  const confirmSettlePayments = async () => {
    setIsLoading(true);
    setIsConfirmDialogOpen(false);
    try {
      const response1 = await getIsSettling();
      const response2 = await getIsGeneratingPayroll();
      if (response1?.data?.isSettling) {
        alert('Another user is currently settling payments. Please try again later.');
        return;
      }
      if (response2?.data?.isGeneratingPayroll) {
        alert('Another user is currently generating payroll. Please try again later.');
        return;
      }
      setIsSettling(true);
      // await updateIsSettling(true);
      await createPaymentPeriod(payPeriodDate);
      // await updateIsSettling(false);
      setRefreshData(prev => prev + 1);
      setRefreshTab((prev:any) => prev + 1);
    } catch (error) {
      console.error('Error settling payments:', error);
      alert('An error occurred while settling payments.');
    } finally {
      setIsLoading(false);
      setIsSettling(false);
    }
  }

  return (
    <RowContainer className='flex flex-col'>
      <PanelContainer header='Current Pay Period Summary' className='mt-2'>
        <div className='flex flex-row justify-between'>
          <div className="flex flex-row justify-start space-x-8 items-center">
            <p>Payment Period Date:</p>
            <input type='date'
              className='border border-meta-2 rounded-sm p-0'
              value={payPeriodDate} 
              onChange={e => setPayPeriodDate(e.target.value)} 
            />
          </div>
          {(readyToPay && !isGeneratingPayroll) ? (
            <Button
              onClick={handleSettlePayments}
              disabled={data?.length == 0 || isSettling || isLoading}
              className="max-w-[10rem] max-h-[3rem] bg-success"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Settle Payments"
              )}
            </Button>
          ) : (
            <Button disabled className="bg-gray text-black">
              Settle Payments
            </Button>
          )}
        </div>
      </PanelContainer>
      {isLoading && <Loader />}
      <PanelContainer header='Payment Details'>
        <RowContainer className='flex flex-row justify-end space-x-8 my-0 py-0 border-none'>
          <button onClick={exportToPDF}><BiDownload /> PDF</button>
          <button onClick={exportToExcel}><BiDownload /> Excel</button>
        </RowContainer>
        <TableViewCache
          data={data}
          columns={columns}
          pageSize={pageSize}
          initialSorting={[]}
        />
      </PanelContainer>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle payments</DialogTitle>
            <DialogDescription>
              Proceed to settle payments in current pay run?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSettlePayments} className="bg-success">
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
    </RowContainer>
  );
};

export default Payroll;