'use server'
import { strapiFetch } from '@/lib/strapi';
import { canAccess, accessWithAuth } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { postComment } from '@/components/Comments/_actions/comments';

export const getFundCategoryTypes = async (carrier: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  let allFundCategoryTypes:any = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'fundcategorytypes',
      param: `?filters[carrierId][id]=${carrier}&pagination[page]=${page}&pagination[pageSize]=100`,
      normalize: true,
      options: {
        'cache': 'no-cache',
      }
    });
    if (response && response.data) {
      allFundCategoryTypes = [...allFundCategoryTypes, ...response.data];
      hasMore = response.meta.pagination.page < response.meta.pagination.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allFundCategoryTypes;
}

export const getInvestmentFeeTypes = async (carrier: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  let allInvestmentFeeTypes:any = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'investmentfeetypes',
      param: `?populate[fundCategoryTypeId][populate][carrierId][fields][0]=id&filters[fundCategoryTypeId][carrierId][id]=${carrier}&filters[isActive][$eq]=true&pagination[page]=${page}&pagination[pageSize]=100`,
      normalize: true,
      options: {
        'cache': 'no-cache',
      }
    });
    if (response && response.data) {
      allInvestmentFeeTypes = [...allInvestmentFeeTypes, ...response.data];
      hasMore = response.meta.pagination.page < response.meta.pagination.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allInvestmentFeeTypes;
}

export const createInvestmentFeeType = async (investmentFeeTypeData: any) => {
  if (!await canAccess(['Superuser', 'Poweruser'])) {
    redirect('/dashboard/error');
  }
  const header = {
    'Content-Type': 'application/json',
  }
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'investmentfeetypes',
    param: '',
    normalize: true,
    options: {
      'cache': 'no-cache',
    },
    body: JSON.stringify({ data: investmentFeeTypeData }),
    header: header
  });
  if (response.status == 200) {
    const session = await accessWithAuth();
    await postComment('investmentfeetype', response.data.id.toString(), { content: `Investment Fee Type is created by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName}`, user: 'user' });
  }
  if (response && response.data) {
    return response.data;
  } else {
    throw new Error('Failed to create investment fee type');
  }
}

export const updateInvestmentFeeType = async (investmentFeeTypeId: number, investmentFeeTypeData: any) => {
  if (!await canAccess(['Superuser', 'Poweruser'])) {
    redirect('/dashboard/error');
  }
  const header = {
    'Content-Type': 'application/json',
  }  
  const response = await strapiFetch({
    method: 'PUT',
    endpoint: `investmentfeetypes/${investmentFeeTypeId}`,
    param: '',
    normalize: true,
    options: {
      'cache': 'no-cache',
    },
    body: JSON.stringify({ data: investmentFeeTypeData }),
    header: header
  });
  if (response.status == 200) {
    const session = await accessWithAuth();
    await postComment('investmentfeetype', response.data.id.toString(), { content: `Investment Fee Type is updated by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName} change: ${JSON.stringify(investmentFeeTypeData)}`, user: 'user' });
  }
  if (response && response.data) {
    return response.data;
  } else {
    throw new Error('Failed to update investment fee type');
  }
}