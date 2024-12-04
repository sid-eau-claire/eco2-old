import React from 'react'
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from '@/types/session';
import { normalize } from '@/lib/format';
import {Payment } from '@/types/payment';
import StatementLog from '../../_components/StatementLog';

const page = async ({ params }: { params: { payment: string } }) => {
  let statementLogs: any[] = [];
  const session: Session | null = await getServerSession(authOptions as any);

  try {
    console.log(params.payment)
    const fetchPayments = async (start: number) => {
      // const url = `${process.env.STRAPI_BACKEND_URL}/api/payments?pagination[start]=${start}&pagination[limit]=25&populate[paymentPeriodId]=*&populate[profileId]=id&populate[statementLog]=commission&filters[id][$eq]=${params.payment}`;
      const url = `${process.env.STRAPI_BACKEND_URL}/api/payments/${params.payment}?populate[statementLog][populate][logId]=*`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        next: { revalidate: 60, tags: ['payments']}
      });
      const data = await response.json();
      const normalizedData = await normalize(data);
      return normalizedData;
    };
    statementLogs = await fetchPayments(0);
    

  } catch (error) {
    console.error('Failed to fetch payments:', error);
  }
  // console.log(JSON.stringify(statementLogs, null, 2))
  return (
    <>
        <StatementLog statementLogs={statementLogs} />
    </>
  )
}

export default page
