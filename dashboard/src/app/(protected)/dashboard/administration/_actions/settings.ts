// app/_actions/okrSettings.ts

import { strapiFetch } from '@/lib/strapi';
import { redirect } from 'next/navigation';
import { canAccess } from '@/lib/isAuth';

export const getOKRSettings = async () => {
  if (!await canAccess(['Superuser', 'Advisor', 'Poweruser'], [])) {
    redirect('/dashboard/error');
  }
  const endpoint = `setting`;
  const options = {
    method: 'GET',
    cache: 'no-cache',
  };
  const param = '?fields[0]=OKRMonthTargetSettings';
  try {
    const response = await strapiFetch({ method: 'GET', endpoint, param: param, normalize: true, options });
    console.log('Raw response from strapiFetch:', response); // Log the raw response
    return response;
  } catch (error) {
    console.error('Error in getOKRSettings:', error);
    throw error; // Re-throw the error to be caught in the component
  }
};

export const updateOKRSettings = async (settings: any) => {
  if (!await canAccess(['Superuser', 'Poweruser'], [])) {
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
    body: JSON.stringify({"data": { OKRMonthTargetSettings: settings }}),
    header: headers
  });
  console.log(JSON.stringify(response));
  return response;
};