import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/format'; 
import { PanelContainer, ColContainer, RowContainer } from '@/components/Containers';
import TableViewCache from '@/components/Tables/TableViewCache'; // Ensure this path is correct
import { Input } from '@/components/Input'; // Ensure this path is correct
import Link from 'next/link';
import { BiDetail } from 'react-icons/bi';
import { ToolTip } from '@/components/Common/ToolTip'; // Ensure this path is correct
import Loader from '@/components/Common/Loader'; // Ensure this path is correct
import {updateReadyToPay, getReadyToPay} from '../_actions/setting'
import {ConfirmPopup} from '@/components/Popup'; // Ensure this path is correct

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  CellContext
} from '@tanstack/react-table';
import { generatePaymentPeriodPreview, fetchCurrentPaymentPeriodPreview } from '../_actions/payment'; // Correct the relative path as needed
import {LoadingButton, LoadingButtonNP} from '@/components/Button'; // Ensure this path is correct

import Spinner from '@/components/Common/Spinner';
import { px } from 'framer-motion';
// import { set } from 'zod';


const CommissionPreview = ({refreshTab ,  setRefreshTab}: {refreshTab: number ,  setRefreshTab: any}) => {
// const Payroll: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [paymentPeriodDate, setPaymentPeriodDate] = useState(''); // Add this state
  const [data, setData] = useState<any | null>([]);
  const [data1, setData1] = useState<any | null>(null);
  const [fetcting, setFetching] = useState(false);
  const [advisorList, setAdvisorList] = useState<any[] | null>(null);
  const [readyToPay, setReadyToPay] = useState(false);
  const [refreshData, setRefreshData] = useState(0);
  const [isConfirmPopupVisible, setIsConfirmPopupVisible] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  function getFullNameById(profileId: any) {
    // console.log(profileId)
    return profileId ? `${profileId.firstName.trim()} ${profileId.lastName.trim()}` : 'Profile not found';
  }

  const columns = useMemo(() => [
    // {
    //   id: 'detail',
    //   header: () => <span className="font-semibold w-[1rem]"></span>,
    //   cell: (info: any) => (
    //     <ToolTip message='View detail statement log'>
    //       <Link
    //         href={`/dashboard/mybusiness/cashflow/${info.row.original.profileId.id}/${info.row.original.id}`}
    //         // onClick={() =>console.log('hello')} // Assuming each row has a unique 'id'
    //         className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
    //         >
    //         <BiDetail className='cursor-pointer' size={20}/>
    //       </Link>
    //     </ToolTip>
    //   ),
    // },
    {
      // Combine first name and last name into one column
      id: 'fullName', // Custom ID for the combined column
      header: 'Full Name',
      accessorFn: (row: any) => getFullNameById(row.profileId),
      // Custom cell renderer that concatenates firstName and lastName
      cell: (info: any) =>
         <div className='py-2'><strong>{info.getValue()}</strong></div>
    },    
    {
      id: 'totalAmount',
      header: 'Commission',
      accessorFn: (row: any) => row.totalPersonalAmount + row.totalAgencyAmount + row.totalGenerationAmount,
      cell: (info: any) => <strong>{formatCurrency(info.getValue())}</strong> // This will format the number as a string with commas
    },
    {
      id: 'escrow',
      header: 'Escrow amount',
      accessorFn: (row: any) => row.totalEscrowAmount,
      cell: (info: any) => <strong>{formatCurrency(info.getValue() | 0)}</strong> // This will format the number as a string with commas
    },    
    {
      id: 'breakdown',
      header: 'Break down',
      accessorFn: (row: any) => {
        const personal = formatCurrency(row.totalPersonalAmount);
        const agency = formatCurrency(row.totalAgencyAmount);
        const generation = formatCurrency(row.totalGenerationAmount);
        const escow = formatCurrency(row.totalEscrowAmount | 0);
        return `${personal} (Personal), ${agency} (Agency), ${generation} (Generation) and ${escow} (Escrow)`;
      },
      cell: (info: any) => info.getValue()  // This will display the formatted string in the cell
    }
  ], [advisorList]);


  const generate = async () => {
    console.log('Generating data')
    setIsCalculating(true);
    try {
      const response = await generatePaymentPeriodPreview();
      await fetchCurrentPaymentPeriodData();
      console.log(response);
    } catch (error) {
      console.error('Failed to generate data:', error);
    }
    setIsCalculating(false);
    console.log('Data generated')
  }

  useEffect(() => {
    // set paymentPeriodDate to today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    setPaymentPeriodDate(formattedDate);
    fetchCurrentPaymentPeriodData()
    const fetchSetting = async () => {
      const response = await getReadyToPay();
      setReadyToPay(response?.data?.readyToPay);
    }
    fetchSetting();
  }, [refreshData, refreshTab]);

  const fetchCurrentPaymentPeriodData = async () => {
    const response = await fetchCurrentPaymentPeriodPreview();
    setData(response?.data[0]);
  }

  // useEffect(() => {
  //   fetchCurrentPaymentPeriodData();
  //   const intervalId = setInterval(() => {
  //     fetchCurrentPaymentPeriodData();
  //   }, 60000);
  // }, []);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setPaymentPeriodDate(e.target.value);
  };
  if (!isCalculating && (data == null || data === undefined || data.length == 0)) {
    return (
      <RowContainer className='flex flex-row justify-center items-center' >
        <div className='flex flex-col justify-end items-end space-x-4 space-y-4 mr-[2rem]'>
          <LoadingButton onClick={() => generate()} className='max-w-[30rem] max-h-[3rem]' >
            Re-calculate payment preview for current pay run
          </LoadingButton>
          {/* {readyToPay && (
            <LoadingButtonNP onClick={() => setIsConfirmPopupVisible(true)} className='max-w-[10rem] max-h-[3rem] bg-success' >
              Settle Payments
            </LoadingButtonNP>
          )} */}
        </div>        
      </RowContainer>
    );
  }
  if ((data == null || data === undefined || data.length == 0) ) {
    return (
      <RowContainer className='flex flex-row justify-center items-center' >
        <div>
          <div>
          <p>Recalculating the Payments for current pay run</p>
          <p>Please wait....</p>
          </div>
          <Loader/>
        </div>
      </RowContainer>
    );
  }
  // console.log(advisorList)
  // console.log('data', data)
  // console.log()
  // console.log('Payroll settings', readyToPay)
  return (
    <>
      <PanelContainer header='Commission Preview Summary' className='mt-4'>
        <ColContainer cols="3:3:2:1">
          <div>
            <p>Total Commission: <strong>${(data?.totalPersonalAmount 
                  + data?.totalAgencyAmount 
                  + data?.totalGenerationAmount).toLocaleString(
                  )}</strong></p>
            <p>Total Deposit: <strong>{formatCurrency(data?.totalCommissionDeposited)}</strong></p>
          </div>
          <div className='text-sm'>
            <p>Total Personal Amount: ${data?.totalPersonalAmount.toLocaleString()}</p>
            <p>Total Agency Amount: ${data?.totalAgencyAmount.toLocaleString()}</p>
            <p>Total Generation Amount: ${data?.totalGenerationAmount.toLocaleString()}</p>
            {/* <p>Total Escrow Amount: {data?.totalEscrowAmount.toLocaleString()}</p> */}
          </div>
          <div className='flex flex-col justify-center items-end space-x-4 space-y-4 mr-[2rem]'>
            <LoadingButton onClick={() => generate()} className='max-w-[10rem] max-h-[3rem]' >
              Re-calculate
            </LoadingButton>
            {/* {readyToPay && (
              <LoadingButtonNP onClick={() => setIsConfirmPopupVisible(true)} className='max-w-[10rem] max-h-[3rem] bg-success' >
                Settle Payments
              </LoadingButtonNP>
            )} */}
          </div>
        </ColContainer>
      </PanelContainer>
      <PanelContainer header='Commission Preview Details' className='ml-0 mt-4' collapse={true}>
        <TableViewCache
          data={data?.paymentPreviewIds}
          columns={columns}
          // getCoreRowModel={getCoreRowModel}
          // getPaginationRowModel={getPaginationRowModel}
          // getSortedRowModel={getSortedRowModel}
          // getFilteredRowModel={getFilteredRowModel}
          // pageIndex={pageIndex}
          // pageSize={pageSize}
          // setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          // pageCount={Math.ceil(data?.paymentPreviewIds?.length / pageSize)}
          initialSorting={[]}
        />
      </PanelContainer>
      {isConfirmPopupVisible && (
        <ConfirmPopup
          heading="Settle payments"
          message="Proceed to settle payments in current pay run?"
            onConfirm={() => {console.log('testing');setRefreshTab(refreshTab + 1)}}
          onCancel={() => setIsConfirmPopupVisible(false)}
          button1Color='bg-success'
        />
      )}   
    </>
  );
};

export default CommissionPreview;
