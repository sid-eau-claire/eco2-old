'use server'
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
