'use server'
import {zCommissionLogSchema, CommissionLog, CommissionLogEntry} from '@/types/commissionlog';
import {accessWithAuth, isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { normalize } from '@/lib/format';
import { revalidateTag } from 'next/cache';
import { strapiFetch } from '@/lib/strapi';
import { postComment } from '@/components/Comments/_actions/comments';


export async function revalidating  () {
  revalidateTag('commissionlogs');
  revalidateTag('commissionlogentries');
  revalidateTag('paymentperiod');
}

export async function createCommissionLog(commissionLog: any) {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const options = {
    next: { tags: ['commissionlogs'] },  // Assuming you have middleware to handle these
    cache: 'no-cache'
  };
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  const response = await strapiFetch({
    method: 'POST', 
    endpoint: 'commissionlogs', 
    param: '', 
    normalize: false, 
    options: options,
    body: commissionLog,
    // header: headers
  });
  // console.log(JSON.stringify(response))
  // Add Comments for commission log created
  if (response.status == 200) {
    console.log('response', response)
    const session = await accessWithAuth();
    await postComment('commissionlog', response?.data?.id, { content: `Commission log is created by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName}`, user: 'user' });
  }  

  if (response.status !== 200) {
    console.error(`HTTP error! status: ${response.status}`, response.errorMessage);
    return { success: false, data: null };
  } else {
    return { success: true, data: response.data };
  }
}

export async function createCommissionLogEntry(commissionLogEntry: CommissionLogEntry) {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['commissionlogentries'] },  // Assuming you have middleware to handle these
    cache: 'no-cache'
  };
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'commissionlogentries',
    param: '',
    normalize: false,
    options: options,
    body: JSON.stringify({ data: commissionLogEntry }),
    header: headers
  });
  return { success: true, data: response.data };
}

// _actions/commission.ts
export const fetchCommissionLogs = async (page: number, pageSize: number, showUnpaidLogOnly: boolean, selectedCarrier: string,  formattedStartDate: string, formattedEndDate: string, payrollStatus: string, searchPolicyAccountNumber?: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  let additionalFilter = '';
  if (selectedCarrier !== '') {
    additionalFilter += `&filters[carrierId]=${selectedCarrier}`;
  }
  if (formattedStartDate !== '') {
    additionalFilter += `&filters[statementDate][$gte]=${formattedStartDate}`;
  }
  if (formattedEndDate !== '') {
    additionalFilter += `&filters[statementDate][$lte]=${formattedEndDate}`;
  }
  if (payrollStatus !== '') {
    additionalFilter += `&filters[payrollStatus][$eq]=${payrollStatus}`;
  }
  if (showUnpaidLogOnly === true) {
    additionalFilter += `&filters[paymentPeriodId][id][$notNull]=false`;
  }
  const endpoint = 'commissionLogs';
  const param = `?populate[paymentPeriodId]=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}&populate[carrierId][fields][0]=id&populate[carrierId][fields][1]=carrierName&populate[originalStatement][fields][2]&sort[0]=statementDate:desc&sort[1]=carrierId.carrierName:desc`;
  const options = {
    method: 'GET',
    cache: 'no-cache'
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  // console.log('response.data', response.data)
  return response;
};

export const fetchNewLogs = async ()  => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/commissionLogs?populate[paymentPeriodId]=*&populate[carrierId][fields][0]=id&populate[carrierId][fields][1]=carrierName&sort[0]=statementDate:desc&sort[1]=carrierId.carrierName:desc`, {

    // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/commissionLogs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      // options: { cache: 'no-cache' },
      next: { revalidate: 60, tags: ['commissionlogs']}
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    return await normalize(responseData.data)
    // return await normalize(responseData.data);

  } catch (error) {
    console.error('Failed to fetch commission logs:', error);
  }
  return { data: []};
}


export const getCommissionLog = async (id: string) => {
  // console.log(`${process.env.STRAPI_BACKEND_URL}/api/commissionLogs/${id}`)
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/commissionLogs/${id}?populate[originalStatement]=*&populate[carrierId]=id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      cache: 'no-cache', 
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    // console.log(responseData.data)
    return responseData.data;
    // console.log(normalize(responseData.data))
    // return await normalize(responseData.data);
    return null
  } catch (error) {
    console.error('Failed to fetch commission log:', error);
    return null; 
  }
}

export const fetchCommissionLogEntries = async (page: number, pageSize: number, commissionLogId: string, selectedCarrier: string, formattedStartDate: string, formattedEndDate: string, searchPolicyAccountNumber: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  let additionalFilter = '';
  if (selectedCarrier !== '') {
    additionalFilter += `&filters[carrierId]=${selectedCarrier}`;
  }
  if (formattedStartDate !== '') {
    additionalFilter += `&filters[transactionDate][$gte]=${formattedStartDate}`;
  }
  if (formattedEndDate !== '') {
    additionalFilter += `&filters[transactionDate][$lte]=${formattedEndDate}`;
  }
  if (commissionLogId !== '') {
    additionalFilter += `&filters[commissionLogId]=${commissionLogId}`;
  }
  if (searchPolicyAccountNumber !== '' && searchPolicyAccountNumber !== undefined && searchPolicyAccountNumber !== null)  {
    additionalFilter += `&filters[policyAccountFund]=${searchPolicyAccountNumber}`;
  }
  const endpoint = 'commissionLogEntries';
  const param = `?pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}&sort=transactionDate:desc&populate[carrierId][fields][0]=id&populate[carrierId][fields][1]=carrierName&populate[writingAgentId][fields][3]=id&populate[splitAgent1Id][fields][4]=id&populate[splitAgent2Id][fields][5]=id&populate[splitAgent3Id][fields][6]=id`;
  const options = {
    method: 'GET',
    cache: 'no-cache',
    next: { tags: ['commissionlogs'] }  // Assuming you have middleware to handle these
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: false, options });
  // console.log('response.data', JSON.stringify(response.data))
  return response;
};


export const deleteCommissionLog = async (id: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const endpoint = `commissionLogs/${id}`;
  const options = {
    method: 'DELETE',
    'cache': 'no-cache',
    next: { tags: ['commissionlogs'] } // Assuming you have middleware to handle these
  };
  const response = await strapiFetch({ method: 'DELETE', endpoint, param: '', normalize: false, options });
  revalidateTag('commissionlogs');
  return response.ok;
};


export const modifyCommissionLog = async (id: number, commissionLog: any, changed?: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const options = {
    next: { tags: ['commissionlogs'] },  // Assuming you have middleware to handle these
    cache: 'no-cache'
  };
  const headers = {
    'Content-Type': 'application/json'
  };
  const response = await strapiFetch({
    method: 'PUT', 
    endpoint: `commissionlogs/${id}`, 
    param: '', 
    normalize: true, 
    options: options,
    body: commissionLog,
    // header: headers
  });
  // Add comments for commission log modified
  if (response.status == 200) {
    console.log('commissionLog', commissionLog)
    const session = await accessWithAuth();
    await postComment('commissionlog', response?.data?.id, { content: `Commission log is modified by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName} ${changed || ''}`, user: 'user' });
  }
  console.log(JSON.stringify(response))
  return { success: true, data: response.data };
}
