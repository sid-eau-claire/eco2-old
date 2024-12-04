'use server'

import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
import { canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';

export const fetchAdvisorCurrentPaymentPeriod = async (profileId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'], [], Number(profileId)) && !await canAccess(['InternalStaff'],['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({method: 'GET', endpoint: 'generatepaymentperiod/calculatepayment', 
    param: '?profileId=' + profileId, 
    normalize: true, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}

export const fetchAdvisorPayHistory = async (profileId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'], [], Number(profileId)) && !await canAccess(['InternalStaff'],['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({method: 'GET', endpoint: 'paymentperiods/getadvisorpayhistory', 
    param: '?profileId=' + profileId, 
    normalize: false, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}


export const fetchAdvisorPaymentPeriods = async (profileId: string, page?:number, pageSize?: number) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'], [], Number(profileId)) && !await canAccess(['InternalStaff'],['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({method: 'GET', endpoint: 'paymentperiods/getadvisorpaymentperiods', 
    param: '?profileId=' + profileId + `&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true`, 
    normalize: false, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}

export const getCurrentPaymentPeriodPreviewPayDate = async () => {
  // Check user permissions (you can modify roles as per your app's needs)
  // console.log('hello i am here')
  // Fetch the payment period preview data
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'paymentperiodpreviews',
    param: '?_sort=payPeriodDate:DESC&_limit=1', // Sorting by date and limiting to the most recent one
    normalize: true,
    options: {
      'cache': 'no-cache',
    }
  });
  console.log('response pay date', response);
  // Handle the response, assuming the first item is used
  if (response && response.data && response.data.length > 0) {
    return response.data[0].payPeriodDate;
  } else {
    return null; // or handle the case where no data is found
  }
};
