'use server'
// import {CommissionLog, CommissionLogEntry} from '@/types/commissionlog';
import {canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { normalize } from 'path';
import { revalidateTag } from 'next/cache';

import { strapiFetch } from '@/lib/strapi';

export async function revalidating  () {
  revalidateTag('paymentperiod');
  // revalidateTag('commissionlogentries');
}

// export const fetchPaymentPeriod = async (page: number, pageSize: number, formattedStartDate: string, formattedEndDate: string) => {
//   if (!await canAccess(['Superuser', 'InternalStaff'])) {
//     redirect('/dashboard/error');
//   }  
//   try {
//     let additionalFilter = '';
//     // console.log(page, pageSize);
//     if (formattedStartDate != '') {
//       additionalFilter += `&filters[statementDate][$gte]=${formattedStartDate}`;
//     }
//     if (formattedEndDate != '') {
//       additionalFilter += `&filters[statementDate][$lte]=${formattedEndDate}`;
//     }
//     // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/commissionLogs?populate=carrierId&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}&sort=statementDate:desc`, {
//     // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/paymentperiods?pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}&sort=statementDate:desc`, {
//     const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/paymentperiods?populate[paymentIds]=*`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
//       },
//       next: { tags: ['paymentperiod']}
//     });
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const responseData = await response.json();
//     return responseData;

//   } catch (error) {
//     console.error('Failed to fetch PaymentPeriod:', error);
//   }
//   return { data: [], meta: { pagination: { pageCount: 0 } } };
// }


export const fetchPaymentPeriod = async (page: number, pageSize: number, formattedStartDate: string, formattedEndDate: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'])) {
    redirect('/dashboard/error');
  }
  let additionalFilter = '';
  if (formattedStartDate) {
    additionalFilter += `&filters[payPeriodDate][$gte]=${formattedStartDate}`;
  }
  if (formattedEndDate) {
    additionalFilter += `&filters[payPeriodDate][$lte]=${formattedEndDate}`;
  }
  // const param = `?pagination[page]=${page}&pagination[pageSize]=${pageSize}${additionalFilter}&sort=payPeriodDate:desc`;
  const param = `?pagination[page]=${page}&pagination[pageSize]=${pageSize}${additionalFilter}&sort=payPeriodDate:desc` 
              + `&populate[accountIds][populate][profileId][fields][0]=id`
              + `&populate[advisorRevenue][populate][accountId][populate][profileId][fields][0]=id`
              + `&populate[advisorRevenue][populate][accountId][populate][profileId][fields][1]=firstName`
              + `&populate[advisorRevenue][populate][accountId][populate][profileId][fields][2]=lastName`
              + `&populate[advisorRevenue][populate][TRXIds][populate][statementLog]=*`
              + `&populate[advisorRevenue][populate][FLAgentIds][fields][0]=id`

  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'paymentperiods',
    param: param,
    normalize: true,  // Set to true if data normalization is needed as per your implementation
    options: {
      'cache': 'no-cache',
    }
  });
  return response;
}

export const fetchCurrentPaymentPeriodPreview = async () => {
  if (!await canAccess(['Superuser', 'InternalStaff'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({method: 'GET', endpoint: 'paymentperiodpreviews', 
    param: '?populate[paymentPreviewIds][populate][profileId]=id&filters[status][$eq]=preview', 
    normalize: true, 
    options: {'cache': 'no-cache'} 
  });
  return response;
}

export const fetchCurrentPaymentPeriod = async () => {
  if (!await canAccess(['Superuser', 'InternalStaff'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({method: 'GET', endpoint: 'generatepaymentperiod/calculatepayment', 
    param: '', 
    normalize: true, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}

// export const generatePaymentPeriodPreview = async() => {
//   if (!await canAccess(['Superuser','InternalStaff'])) {
//     redirect('/dashboard/error');
//   }  
//   try {
//     const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/generatepaymentperiod/generatepaymentpreview`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
//       },
//       next: { tags: ['paymentperiodpreview']}
//     });
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const responseData = await response.json();
//     console.log(JSON.stringify(responseData));
//     return {...responseData};

//   } catch (error) {
//     console.error('Failed to generate PaymentPeriodPreview:', error);
//   }
//   return { data: [], meta: { pagination: { pageCount: 0 } } };
// }
export const generatePaymentPeriodPreview = async () => {
  if (!await canAccess(['Superuser', 'InternalStaff'])) {
    redirect('/dashboard/error');
    return { data: [], meta: { pagination: { pageCount: 0 } }, status: 403, errorMessage: 'Access Denied' };
  }
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'generatepaymentperiod/generatepaymentpreview',
    param: '',
    normalize: true,  // Set to true if data normalization is needed
    options: {
      'cache': 'no-cache'  // Example of how to pass additional fetch options
    }
  });

  return response;
}

export const createPaymentPeriod = async(payPeriodDate: string) => {
  if (!await canAccess(['Superuser','InternalStaff'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({method: 'POST', endpoint: 'generatepaymentperiod/createpaymentperiod',
    param: '', 
    normalize: true, 
    options: {
      'body': JSON.stringify({"data": {payPeriodDate: payPeriodDate}}),
      'revalidate': 20
    } 
  });
  return response;
}

export const generateCommissionTransaction = async(paymentPeriodDate: string) => {
  if (!await canAccess(['Superuser','InternalStaff'])) {
    redirect('/dashboard/error');
  }  
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/generatepaymentperiod/commissiontransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      body: JSON.stringify({"data": {paymentPeriodDate: paymentPeriodDate}}),
      next: { tags: ['paymentperiod']}
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    console.log(JSON.stringify(responseData));
    revalidateTag('paymentperiod');
    return {...responseData};

  } catch (error) {
    console.error('Failed to generate PaymentPeriodPreview:', error);
  }
  return { data: [], meta: { pagination: { pageCount: 0 } } };
}

