'use server'

import { strapiFetch } from '@/lib/strapi';
import { canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';

export const citsGetPolicies = async (citsClientId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }

  let allPolicies: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'citspolicies',
      param: `?filters[clientIds][id][$eq]=${citsClientId}&populate[clientIds][fields][0]=id&populate[agentIds][fields][0]=id&populate[citsCoverageIds][fields][0]=id&pagination[page]=${page}&pagination[pageSize]=100`,
      normalize: true,
      options: {
        'cache': 'no-cache',
      }
    });

    if (response && response.data) {
      allPolicies = [...allPolicies, ...response.data];
      hasMore = response.meta.pagination.page < response.meta.pagination.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allPolicies;
}