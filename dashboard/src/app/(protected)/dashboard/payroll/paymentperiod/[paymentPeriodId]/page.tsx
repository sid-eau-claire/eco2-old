import React from 'react'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from '@/types/session';
import { normalize } from '@/lib/format';
import {Payment } from '@/types/payment';
import PaymentTable from '../_components/PaymentTable';

const page = async ({ params }: { params: { paymentPeriodId: string } }) => {
  let payments: any[] = [];
  let paymentPeriod = []; 
  const session: Session | null = await getServerSession(authOptions as any);

  try {
    const fetchPayments = async (start: number) => {
      const url = `${process.env.STRAPI_BACKEND_URL}/api/payments?pagination[start]=${start}&pagination[limit]=25&populate[paymentPeriodId]=*&populate[profileId]=*&filters[paymentPeriodId]=${params.paymentPeriodId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        }
      });
      const data = await response.json();
      const normalizedData = await normalize(data);
      return normalizedData;
    };

    let start = 0;
    let results = [];
    do {
      results = await fetchPayments(start);
      payments = [...payments, ...results];
      start += results.length;
    } while (results.length > 0);
    
    const responseData = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/paymentperiods/${params.paymentPeriodId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      next: { revalidate: 60, tags: ['profiles']}
    });
    // console.log(responseData)
    const data = await responseData.json();
    const normalizedData = await normalize(data);
    // console.log(normalizedData)
    paymentPeriod = normalizedData.paymentIds;

  } catch (error) {
    console.error('Failed to fetch payments:', error);
  }

  return (
    <>
      <Breadcrumb pageName='Payments' />
      <PaymentTable payments={payments} paymentPeriod={paymentPeriod}/>
    </>
  )
}

export default page
