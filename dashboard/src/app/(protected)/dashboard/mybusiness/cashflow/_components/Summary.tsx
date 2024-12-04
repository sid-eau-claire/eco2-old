'use client'

import React, { useMemo, useState, useEffect } from 'react';
import { PageContainer, ColContainer, RowContainer } from '@/components/Containers';
import { fetchAdvisorCurrentPaymentPeriod, fetchAdvisorPayHistory, fetchAdvisorPaymentPeriods, getCurrentPaymentPeriodPreviewPayDate  } from '../_actions/payments';
import { Card, ProgressBar } from '@tremor/react';
import { ProfileIcon } from '@/components/Icons';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/Common';
import { formatCurrency } from '@/lib/format';
import { GenericTable, TableViewCache } from '@/components/Tables';
import { ColumnDef } from '@tanstack/react-table';
import { BiDetail } from 'react-icons/bi';
import { ToolTip } from '@/components/Common/ToolTip';
import { BiDownload } from 'react-icons/bi';
import { PopupComponent } from '@/components/Popup';
import StatementLog from './StatementLog';
import CurrentPaymentPreview from './CurrentPaymentPreview';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Loader2 } from "lucide-react";

const Summary = ({ profileId, isAllowedForAdvisor }: { profileId: string, isAllowedForAdvisor: boolean }) => {
  const [currentCashflow, setCurrentCashflow] = useState<any>(null);
  const [payHistory, setPayHistory] = useState<any>({
    monthToDate: null,
    yearToDate: null,
    rolling12Months: null,
    careerEarnings: null,
    previousMonthToDate: null,
    previousYearToDate: null,
    previousRolling12Months: null,
  });
  const [paymentPeriods, setPaymentPeriods] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [refreshData, setRefreshData] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [statementLogs, setStatementLogs] = useState<any[]>([]);
  const [isShowPaymentPeriodPopup, setIsShowPaymentPeriodPopup] = useState(false);
  const [paymentPeriodPreviewPayDate, setPaymentPeriodPreviewPayDate] = useState<any>(null);
  const [isShowCurrentPaymentPreview, setIsShowCurrentPaymentPreview] = useState(false);
  const colors = ["88, 202, 155", "196, 26, 105", "102, 65, 169"];

  useEffect(() => {
    const fetchPaymentPeriods = async () => {
      const response = await fetchAdvisorPaymentPeriods(profileId, page, pageSize);
      setPaymentPeriods(response?.data);
      setPageCount(response?.meta?.pagination?.pageCount || 0);
    };
    fetchPaymentPeriods();
  }, [page, pageSize, profileId]);

  useEffect(() => {
    const fetchCashflow = async () => {
      const responseCurrentPaymentPeriod = await fetchAdvisorCurrentPaymentPeriod(profileId);
      const responsePayHistory = await fetchAdvisorPayHistory(profileId);
      const responseAdvisorPaymentPeriods= await fetchAdvisorPaymentPeriods(profileId);
      const CurrentPaymentPeriodPreviewPayDate = await getCurrentPaymentPeriodPreviewPayDate();
      setCurrentCashflow(responseCurrentPaymentPeriod?.data[0]);
      setPayHistory(responsePayHistory?.data[0]);
      setPaymentPeriods(responseAdvisorPaymentPeriods?.data);
      setPaymentPeriodPreviewPayDate(CurrentPaymentPeriodPreviewPayDate);
    };
    fetchCashflow();
  }, [profileId]);

  const handleDetailClick = async (statementLog: any) => {
    const commissionStatementLogs = await statementLog.filter((log: any) => log.type == "commission");
    if (commissionStatementLogs.length === 0) {
      console.log('No commission type logs found.');
      setStatementLogs([]);
      return;
    }
    const allCommissionLogs = await commissionStatementLogs.flatMap((log: any) => log.statementLog);
    const payrollStatementLogs = await statementLog.filter((log: any) => log.type == "payroll");
    payrollStatementLogs.forEach((log: any) => {
      allCommissionLogs.push({
        TRANS_DATE: log.createAt,
        commission: log.amount,
        type: log.type,
      });
    })
    const tableData = await convertToTable(allCommissionLogs);

    setStatementLogs(tableData);
    setIsShowPaymentPeriodPopup(true);
  };

  const handleDownload = async (paymentPeriod: any) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a3'
    }) as any;
    
    doc.setFontSize(18);
    doc.text('Payment Period Details', 14, 15);
    
    doc.setFontSize(12);
    doc.text(`Pay Period Date: ${paymentPeriod.payPeriodDate}`, 14, 25);
    
    const summaryTableData = [
      ['Category', 'Amount'],
      ['Additions', formatCurrency(paymentPeriod.additions)],
      ['Deductions', formatCurrency(paymentPeriod.deductions)],
      ['Escrow', formatCurrency(paymentPeriod.escrow)],
      ['Net Bank Deposit', formatCurrency(paymentPeriod.netBackDeposit)]
    ];
    
    doc.autoTable({
      startY: 35,
      head: [summaryTableData[0]],
      body: summaryTableData.slice(1),
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    if (paymentPeriod.payment?.TRXIds) {
      doc.setFontSize(14);
      doc.text('Transaction Details', 14, doc.lastAutoTable.finalY + 10);
      
      const trxTableData = paymentPeriod.payment.TRXIds
        .filter((trx: any) => trx.type === 'payroll')
        .map((trx: any) => [trx.type, formatCurrency(trx.amount)]);
      
      if (trxTableData.length > 0) {
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 15,
          head: [['Type', 'Amount']],
          body: trxTableData,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 }
        });
      }
    }

    // Add Statement Log
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Statement Log', 14, 15);

    const statementLogData = await Promise.all(paymentPeriod.payment.TRXIds
      .flatMap((trx: any) => trx.statementLog)
      .map(async (log: any) => [
        log.source || '',
        log.logId?.carrier || '',
        log.logId?.clientName || '',
        log.logId?.policyAccountFund || '',
        log.logId?.transactionDate || '',
        log.logId?.writingAgent || '',
        `${log.logId?.writingAgentPercentage || ''}%`,
        log.logId?.splitAgent1 || '',
        log.logId?.splitAgent1Percentage > 0 ? `${log.logId?.splitAgent1Percentage}%` : '',
        log.logId?.productCategory || '',
        log.logId?.productDetails || '',
        formatCurrency(log.logId?.receivedRevenue || 0),
        formatCurrency(log.fieldRevenue || 0),
        log.generation || '',
        log.level || '',
        `${log.levelPercentage || ''}%`,
        formatCurrency(log.commission || 0)
      ]));

    doc.autoTable({
      startY: 20,
      head: [['Source', 'Carrier', 'Client Name', 'Policy/Account', 'Trans Date', 'Writing Adv', 'Adv %', 'Split Adv', 'Split %', 'Trans Type', 'Trans Details', 'Gross Rev', 'Field Rev', 'Gen', 'Lvl', 'Lvl %', 'Comm']],
      body: statementLogData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 },
        7: { cellWidth: 25 },
        8: { cellWidth: 15 },
        9: { cellWidth: 25 },
        10: { cellWidth: 30 },
        11: { cellWidth: 20 },
        12: { cellWidth: 20 },
        13: { cellWidth: 15 },
        14: { cellWidth: 15 },
        15: { cellWidth: 15 },
        16: { cellWidth: 20 }
      }
    });
    
    doc.save(`Payment_Details_${paymentPeriod.payPeriodDate}.pdf`);
  };

  const calculateAdditions = (trxIds: any[]): string => {
    return trxIds
      .reduce((sum, trx) => {
        return sum + trx.statementLog.reduce((acc: number, log: any) => acc + (log.commission > 0 ? log.commission : 0), 0);
      }, 0)
      .toFixed(2);
  };

  const calculateDeductions = (trxIds: any[]): string => {
    return trxIds
      .reduce((sum, trx) => {
        return sum + trx.statementLog.reduce((acc: number, log: any) => acc + (log.commission < 0 ? log.commission : 0), 0);
      }, 0)
      .toFixed(2);
  };

  const calculateEscrow = (trxIds: any[]): string => {
    return trxIds
      .reduce((sum, trx) => {
        return sum + trx.statementLog.reduce((acc: number, log: any) => acc + log.escrow, 0);
      }, 0)
      .toFixed(2);
  };

  const calculateNetBackDeposit = (additions: string, deductions: string): string => {
    const net = parseFloat(additions) + parseFloat(deductions);
    return net > 0 ? net.toFixed(2) : '0.00';
  };

  const processedPaymentPeriods = paymentPeriods?.map((period: any) => {
    const additions = calculateAdditions(period.payment.TRXIds);
    const deductions = calculateDeductions(period.payment.TRXIds);
    const escrow = calculateEscrow(period.payment.TRXIds);
    const netBackDeposit = calculateNetBackDeposit(additions, deductions);
    return {
      ...period,
      additions,
      deductions,
      escrow,
      netBackDeposit,
    };
  });

  const convertToTable = (statementLog: any) => {
    return statementLog.map((entry: any) => ({
      TYPE: entry?.type,
      SOURCE: entry?.source,
      CARRIER: entry?.logId?.carrier,
      CLIENT_NAME: entry?.logId?.clientName,
      POLICY_ACCOUNT_NUMBER: entry?.logId?.policyAccountFund,
      TRANS_DATE: entry?.logId?.transactionDate,
      WRITING_ADVISOR: entry?.logId?.writingAgent,
      ADV_PERCENTAGE: `${entry?.logId?.writingAgentPercentage}%`,
      SPLIT_ADVISOR: entry?.logId?.splitAgent1 || '',
      SPLIT_ADV_PERCENTAGE: entry?.logId?.splitAgent1Percentage > 0 ? `${entry?.logId?.splitAgent1Percentage}%` : '',
      TRANS_TYPE: entry?.logId?.productCategory,
      TRANS_DETAILS: entry?.logId?.productDetails,
      GROSS_REV: entry?.logId?.receivedRevenue?.toFixed(2),
      FIELD_REV: entry?.fieldRevenue?.toFixed(2),
      GENERATION: entry?.generation,
      LVL: entry?.level,
      LVL_PERCENTAGE: `${entry?.levelPercentage}%`,
      COMMISSION: entry?.commission?.toFixed(2)
    }));
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0 || previous === null) return 'N/A';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'payPeriodDate',
        header: () => <span className="font-semibold">Pay Period Date</span>,
        cell: (info) => info.getValue(),
      },
      {
        id: 'additions',
        header: () => <span className="font-semibold">Additions</span>,
        cell: (info) => formatCurrency(info.row.original.additions),
      },
      {
        id: 'deductions',
        header: () => <span className="font-semibold">Deductions</span>,
        cell: (info) => formatCurrency(info.row.original.deductions),
      },
      {
        id: 'escrow',
        header: () => <span className="font-semibold">Escrow</span>,
        cell: (info) => formatCurrency(info.row.original.escrow),
      },
      {
        id: 'TRXIds',
        header: () => <span className="font-semibold">Net Bank Deposit</span>,
        cell: (info) => (
          <div>
            {info.row.original.payment?.TRXIds
              .filter((trx: any) => trx.type === 'payroll')
              .map((trx: any) => (
                <span key={trx.id} className="block">
                  {formatCurrency(trx.amount)}
                </span>
              ))}
          </div>
        ),
      },
      {
        id: 'detail',
        header: () => <span className="font-semibold">Actions</span>,
        cell: (info: any) => (
          <div className='flex flex-row justify-start items-center space-x-8'>
            <ToolTip message='View details' hintHPos="-6.2rem" hintVPos='-2rem'>
              <button
                onClick={() => handleDetailClick(info.row.original.payment.TRXIds)}
                className="hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
              >
                <BiDetail className='cursor-pointer' size={20} />
              </button>
            </ToolTip>
            <ToolTip message='Download PDF'  hintHPos="-6.2rem" hintVPos='-2rem'>
              <button
                onClick={() => handleDownload(info.row.original)}
                className="hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
              >
                <BiDownload className='cursor-pointer' size={20} />
              </button>
            </ToolTip>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <PageContainer pageName='Cashflow Summary' className='relative'>
      {isAllowedForAdvisor && (
        <ColContainer cols="4:4:4:1" className='bg-transparent border-none mt-[1rem] gap-[1rem]'>
          <AnimatedBackground
            className="col-span-2 rounded-lg shadow-sm relative px-[1rem] py-[0.5rem] min-h-[10rem]"
            colors={colors}
          >
            <div className='flex flex-row justify-between items-center'>
              <motion.span
                className='text-lg text-white'
              >
                Upcoming Pay
                <ProfileIcon profileId={profileId} className='mt-[0.2rem] z-50 relative' />
              </motion.span>
              <Dialog>
                <DialogTrigger asChild>
                  <motion.button
                    className='bg-white text-black rounded-sm p-2 z-50 relative'
                    onClick={() => setIsShowCurrentPaymentPreview(true)}
                  >
                    View Details
                  </motion.button>
                </DialogTrigger>
                <DialogContent className='w-11/12 max-w-6xl h-[70vh] overflow-y-auto'>
                  <DialogTitle  className='text-white'>Current Payment Preview</DialogTitle>
                  <CurrentPaymentPreview currentCashflow={currentCashflow} />
                </DialogContent>
              </Dialog>
            </div>
            <div className='absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center'>
              <motion.h2
                className='text-4xl text-white'
              >
                {currentCashflow === null ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `$${currentCashflow?.totalPayment?.toFixed(2) || '0.00'}`
                )}
              </motion.h2>
              <motion.p
                className='text-white text-xs'
              >
                Target paid at {paymentPeriodPreviewPayDate || 'N/A'}
              </motion.p>
            </div>
            <div className="absolute bottom-0 right-0">
              { currentCashflow && currentCashflow.totalPayment >= 50 ? (
                <></>
              ):(
                <p className='text-white p-4'>Payouts are only made when balance exceeds $50.00</p>
              )}
            </div>
          </AnimatedBackground>
          <div className='grid grid-cols-1 col-span-2 md:grid-cols-2 gap-[1rem]'>
            <Card className="mx-auto max-w-md">
              <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                Month to Date
              </h4>
              <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {payHistory.monthToDate === null ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(payHistory.monthToDate)
                )}
              </p>
              <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                <span
                  className={`${
                    payHistory?.monthToDate > payHistory?.previousMonthToDate ? 'text-green-500' : 'text-orange-500'
                  }`}
                >
                  {calculatePercentageChange(payHistory?.monthToDate, payHistory?.previousMonthToDate)} compared with previous duration
                </span>
                <span>{formatCurrency(payHistory?.previousMonthToDate) || 'N/A'}</span>
              </p>
              <ProgressBar value={Number(((payHistory?.monthToDate / payHistory?.previousMonthToDate) * 100).toFixed(2))} className="mt-2" />
            </Card>
            <Card className="mx-auto max-w-md">
              <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                Year to Date
              </h4>
              <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {payHistory.yearToDate === null ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(payHistory.yearToDate)
                )}
              </p>
              <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                <span
                  className={`${
                    payHistory?.yearToDate > payHistory?.previousYearToDate ? 'text-green-500' : 'text-orange-500'
                  }`}
                >
                  {calculatePercentageChange(payHistory?.yearToDate, payHistory?.previousYearToDate)} compared with previous duration
                </span>
                <span>{formatCurrency(payHistory?.previousYearToDate) || 'N/A'}</span>
              </p>
              <ProgressBar value={Number(((payHistory?.yearToDate / payHistory?.previousYearToDate) * 100).toFixed(2))} className="mt-2" />
            </Card>
            <Card className="mx-auto max-w-md">
              <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                Rolling 12 Months
              </h4>
              <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {payHistory.rolling12Months === null ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(payHistory.rolling12Months)
                )}
              </p>
              <p className="mt-4 flex items-center justify-between text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                <span
                  className={`${
                    payHistory?.rolling12Months > payHistory?.previousRolling12Months ? 'text-green-500' : 'text-orange-500'
                  }`}
                >
                  {calculatePercentageChange(payHistory?.rolling12Months, payHistory?.previousRolling12Months)} compared with previous duration
                </span>
                <span>{formatCurrency(payHistory?.previousRolling12Months) || 'N/A'}</span>
              </p>
              <ProgressBar value={Number(((payHistory?.rolling12Months / payHistory?.previousRolling12Months) * 100).toFixed(2))} className="mt-2" />
            </Card>
            <Card className="mx-auto max-w-md">
              <h4 className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                Career Earnings
              </h4>
              <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {payHistory.careerEarnings === null ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  formatCurrency(payHistory.careerEarnings)
                )}
              </p>
            </Card>
          </div>
        </ColContainer>
      )}
      <ColContainer cols="1:1:1:1">
        <RowContainer className='mt-[0.5rem] rounded-lg'>
          <GenericTable
            columns={columns as any}
            data={processedPaymentPeriods}
            pageIndex={page - 1}
            pageSize={pageSize}
            pageCount={pageCount}
            onRefresh={() => setRefreshData(!refreshData)}
            onPreviousPage={() => setPage((old) => Math.max(old - 1, 1))}
            onNextPage={() => setPage((old) => (old < pageCount ? old + 1 : old))}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            search={""}
          />
        </RowContainer>
      </ColContainer>
      {isShowPaymentPeriodPopup && statementLogs.length > 0 && (
        <PopupComponent
          isVisible={isShowPaymentPeriodPopup}
          onClose={() => setIsShowPaymentPeriodPopup(false)}
        >
          <StatementLog statementLogs={statementLogs} />
        </PopupComponent>
      )}
    </PageContainer>
  );
};

export default Summary;