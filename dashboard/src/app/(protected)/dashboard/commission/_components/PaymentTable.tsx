'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/lib/format'; 
import { ColContainer, RowContainer } from '@/components/Containers';
import TableViewCache from '@/components/Tables/TableViewCache'; // Ensure this path is correct
import { Input } from '@/components/Input'; // Ensure this path is correct
import Link from 'next/link';
import { BiDetail } from 'react-icons/bi';
import { ToolTip } from '@/components/Common/ToolTip'; // Ensure this path is correct
import { fetchPaymentPeriod, fetchCurrentPaymentPeriod } from '../_actions/payment';

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  CellContext
} from '@tanstack/react-table';
import { generatePaymentPeriodPreview, createPaymentPeriod } from '../_actions/payment'; // Correct the relative path as needed
import { getAdvisorNameList } from '../_actions/retrievedata'; // Correct the relative path as needed
import LoadingButton from '@/components/Button/LoadingButton'; // Ensure this path is correct

import Spinner from '@/components/Common/Spinner';


const PaymentDetails: React.FC<any> = ({payments, paymentPeriod}: {payments: any, paymentPeriod: any} ) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [paymentPeriodDate, setPaymentPeriodDate] = useState(''); // Add this state
  const [data, setData] = useState<any | null>(null);
  const [fetcting, setFetching] = useState(false);
  const [advisorList, setAdvisorList] = useState<any[] | null>(null);
  
  function getFullNameById(id: string) {
    console.log('here')
    const profile = advisorList?.find((profile: any) => profile.id == id);
    return profile ? `${profile.firstName.trim()} ${profile.lastName.trim()}` : 'Profile not found';
  }
  
  const columns = useMemo(() => [
    {
      id: 'detail',
      header: () => <span className="font-semibold w-[1rem]"></span>,
      cell: (info: any) => (
        <ToolTip message='View detail statement log'>
          <Link
            href={`/dashboard/mybusiness/cashflow/${info.row.original.profileId}/${info.row.original.id}`}
            // onClick={() =>console.log('hello')} // Assuming each row has a unique 'id'
            className=" hover:scale-110 transition duration-150 ease-in-out  w-[0.5rem]"
            >
            <BiDetail className='cursor-pointer' size={30}/>
          </Link>
        </ToolTip>
      ),
    },      
    // { id: 'profileName', 
    //   header: 'Advisor',
    //   accessorFn: (row: any) => getFullNameById(row.profileId),
    //   cell: (info: any) => <div className='py-2'><strong>{info.getValue()}</strong></div>
    // },
    {
      // Combine first name and last name into one column
      id: 'fullName', // Custom ID for the combined column
      header: 'Full Name',
      accessorFn: (row: any) => getFullNameById(row.profileId),
      // Custom cell renderer that concatenates firstName and lastName
      cell: (info: any) =>
        <ToolTip message='View profile'>
          <Link href={`/dashboard/profile/${info.row.original.profileId}`} className="underline">
            <div className='py-2'><strong>{info.getValue()}</strong></div>
          </Link>
        </ToolTip>
    },    
    {
      id: 'totalAmount',
      header: 'Commission',
      accessorFn: (row: any) => row.totalPersonalAmount + row.totalAgencyAmount + row.totalGenerationAmount,
      cell: (info: any) => <strong>{formatCurrency(info.getValue())}</strong> // This will format the number as a string with commas
    },
    {
      id: 'breakdown',
      header: 'Break down',
      accessorFn: (row: any) => {
        const personal = formatCurrency(row.totalPersonalAmount);
        const agency = formatCurrency(row.totalAgencyAmount);
        const generation = formatCurrency(row.totalGenerationAmount);
        const escow = formatCurrency(row.totalEscrowAmount);
        return `${personal} (Personal), ${agency} (Agency), ${generation} (Generation) and ${escow} (Escrow)`;
      },
      cell: (info: any) => info.getValue()  // This will display the formatted string in the cell
    }
  ], [advisorList]);

  const fetchData = async () => {
    setFetching(true);
    console.log('Fetching data')
    try {
      const response = await generatePaymentPeriodPreview();
      setData(response);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setData(null); // Consider setting error state instead
    }
    console.log('Data fetched')
    setFetching(false);
  };

  const generate = async () => {
    console.log('Generating data')
    try {
      const response = await createPaymentPeriod('2024/01/01');
      console.log(response);
    } catch (error) {
      console.error('Failed to generate data:', error);
    }
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
    const fetchAdvisorList = async () => {
      const response = await getAdvisorNameList();
      setAdvisorList(response);
    }
    fetchAdvisorList(); 
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setPaymentPeriodDate(e.target.value);
  };  
  if (data === null) {
    return (
      <RowContainer className='flex flex-row justify-between items-center space-x-4' >
        <Input
          register={()=>console.log('register')}
          label="Payment Period Date"
          name="paymentPeriodDate"
          defaultValue={paymentPeriodDate}
          onChange={handleChange}
          isEditable={true}
          type="date" // Notice the type is 'date' for this input
        />
        { fetcting && (
          "It would take one or two minutes to calculate the commission. Please wait..."
        )}
        <>
          <LoadingButton onClick={() => fetchData()} className='max-w-[14rem] max-h-[3rem]' >
            Re-Calculate payment
          </LoadingButton>
        </>
      </RowContainer>
    );
  }
  console.log(data)
  if (!data) {
    return 
      <>
        <p>No records</p>      
      </>
  }

  // console.log(advisorList)
  return (
    <RowContainer className='flex flex-col space-y-4'>
      <RowContainer  className='flex flex-row justify-between items-center'>
        <div>
          <p>Payment Period Date: <strong>{paymentPeriodDate}</strong></p>
          <p>Total commission <strong>${(data?.paymentPeriodPreview?.totalPersonalAmount 
                + data?.paymentPeriodPreview?.totalAgencyAmount 
                + data?.paymentPeriodPreview?.totalGenerationAmount).toLocaleString(
                )}</strong></p>
        </div>
        <div className='text-sm'>
          <p>Total Personal Amount: {data?.paymentPeriodPreview?.totalPersonalAmount.toLocaleString()}</p>
          <p>Total Agency Amount: {data?.paymentPeriodPreview?.totalAgencyAmount.toLocaleString()}</p>
          <p>Total Generation Amount: {data?.paymentPeriodPreview?.totalGenerationAmount.toLocaleString()}</p>
          <p>Total Escrow Amount: {data?.paymentPeriodPreview?.totalEscrowAmount.toLocaleString()}</p>
        </div>
      </RowContainer>
      <TableViewCache
        data={data.paymentsPreview}
        columns={columns}
        // getCoreRowModel={getCoreRowModel}
        // getPaginationRowModel={getPaginationRowModel}
        // getSortedRowModel={getSortedRowModel}
        // getFilteredRowModel={getFilteredRowModel}
        // pageIndex={pageIndex}
        pageSize={pageSize}
        // setPageIndex={setPageIndex}
        // setPageSize={setPageSize}
        // pageCount={Math.ceil(data.paymentsPreview.length / pageSize)}
        initialSorting={[]}
      />
      <LoadingButton onClick={() => generate()} className="bg-primary ml-8 max-w-[20rem] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Generate payment transactions
      </LoadingButton>
    </RowContainer>
  );
};

export default PaymentDetails;
