'use server'

import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
import { canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';

export const fetchAdvisorPayHistory = async (profileId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
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
