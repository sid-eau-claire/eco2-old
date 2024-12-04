'use server'
import {zCommissionLogSchema, CommissionLog, CommissionLogEntry} from '@/types/commissionlog';
import {isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { normalize } from '@/lib/format';
import { revalidateTag } from 'next/cache';
import { strapiFetch } from '@/lib/strapi';
import { cache } from 'react';


export async function revalidating  () {
  revalidateTag('commissionlogs');
  revalidateTag('commissionlogentries');
  revalidateTag('paymentperiod');
}


export const getReadyToPay = async () => {
  if (!await canAccess(['Superuser', 'InternalStaff', ], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const endpoint = `setting`;
  const options = {
    method: 'GET',
    cache: 'no-cache',
  };
  const param = '?fields[0]=readyToPay';
  const response = await strapiFetch({ method: 'GET', endpoint, param: param, normalize: true, options });
  return response;
};
export const updateReadyToPay = (status: boolean) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
        redirect('/dashboard/error');
      }
      const options = {
        cache: 'no-cache'
      };
      const headers = {
        'Content-Type': 'application/json'
      };
      const response = await strapiFetch({
        method: 'PUT', 
        endpoint: `setting`, 
        param: '', 
        normalize: true, 
        options: options,
        body: JSON.stringify({"data": { readyToPay: status }}),
        header: headers
      });
      console.log(JSON.stringify(response));
      resolve(response);
    } catch (error) {
      console.error('Error in updateReadyToPay:', error);
      reject(error);
    }
  });
}

export const getIsGeneratingPayroll = async () => {
  if (!await canAccess(['Superuser', 'InternalStaff', ], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const endpoint = `setting`;
  const options = {
    method: 'GET',
    cache: 'no-cache',
  };
  const param = '?fields[0]=isGeneratingPayroll';
  const response = await strapiFetch({ method: 'GET', endpoint, param: param, normalize: true, options });
  return response;
};
// export const updateIsGeneratingPayroll = (status: boolean) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
//         redirect('/dashboard/error');
//       }
//       const options = {
//         cache: 'no-cache'
//       };
//       const headers = {
//         'Content-Type': 'application/json'
//       };
//       const response = await strapiFetch({
//         method: 'PUT', 
//         endpoint: `setting`, 
//         param: '', 
//         normalize: true, 
//         options: options,
//         body: JSON.stringify({"data": { isGeneratingPayroll: status }}),
//         header: headers
//       });
//       console.log(JSON.stringify(response));
//       resolve(response);
//     } catch (error) {
//       console.error('Error in update isGeneratingPayroll:', error);
//       reject(error);
//     }
//   });
// }


export const getIsSettling = async () => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const endpoint = `setting`;
  const options = {
    method: 'GET',
    cache: 'no-cache',
  };
  const param = '?fields[0]=isSettling';
  const response = await strapiFetch({ method: 'GET', endpoint, param: param, normalize: true, options });
  return response;
};

// body: JSON.stringify({ data: commissionLogEntry }),

export const updateIsSettling = async (status: boolean) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
    redirect('/dashboard/error');
  }
  const options = {
    cache: 'no-cache'
  };
  const headers = {
    'Content-Type': 'application/json'
  };
  const response = await strapiFetch({
    method: 'PUT', 
    endpoint: `setting`, 
    param: '', 
    normalize: true, 
    options: options,
    body: JSON.stringify({"data": { isSettling: status }}),
    header: headers
  });
  console.log(JSON.stringify(response))
  return response 
}

