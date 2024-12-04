import React from 'react'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from '@/types/session';
import { normalize } from '@/lib/format';
import {Payment } from '@/types/payment';
import Summary from '../_components/Summary';
import { canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';

// import PaymentsTable from '../_backups/PaymentsTable';

const page = async ({ params }: { params: { advisor: string } }) => {
  // const [isAllowed, setIsAllowed] = React.useState(false);
  const advisor = params.advisor
  // Check if user is authorized to access this page by advisor type role
  const isAllowedForAdvisor  = await canAccess(['Superuser', 'Advisor', 'Poweruser'],[], Number(advisor));
  const isAllowedForInternal = await canAccess(['InternalStaff'],['commissionEdit']);
  // if (!canAccess(['Superuser', 'Advisor', 'Poweruser'],[], Number(advisor))) {
  //   redirect('/dashboard/error'); 
  // }
  if (!isAllowedForAdvisor && !isAllowedForInternal) {
    redirect('/dashboard/error');
  }
  const session: Session | null = await getServerSession(authOptions as any);

  // try {
  //   const fetchPayments = async (start: number) => {
  //     // const url = `${process.env.STRAPI_BACKEND_URL}/api/payments?pagination[start]=${start}&pagination[limit]=25&populate[paymentPeriodId]=*&populate[profileId]=id&populate[statementLog]=commission&filters[paymentPeriodId]=${params.paymentPeriodId}`;
  //     const url = `${process.env.STRAPI_BACKEND_URL}/api/payments?pagination[start]=${start}&pagination[limit]=25&populate[paymentPeriodId]=*&populate[profileId]=id&populate[statementLog]=commission&filters[profileId][id]=${params.advisor}`;
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
  //       },
  //       next: { revalidate: 60, tags: ['payments']}
  //     });
  //     const data = await response.json();
  //     const normalizedData = await normalize(data);
  //     return normalizedData;
  //   };

  //   let start = 0;
  //   let results = [];
  //   do {
  //     results = await fetchPayments(start);
  //     payments = [...payments, ...results];
  //     start += results.length;
  //   } while (results.length > 0);
    

  // } catch (error) {
  //   console.error('Failed to fetch payments:', error);
  // }

  return (
    <>
      <Summary profileId={params?.advisor} isAllowedForAdvisor={isAllowedForAdvisor} />
      {/* <p>here</p> */}
    </>
  )
}

export default page
