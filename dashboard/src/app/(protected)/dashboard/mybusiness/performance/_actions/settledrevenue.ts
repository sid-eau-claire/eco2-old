'use server'
import { strapiFetch } from '@/lib/strapi';
export const getokrsettledrevenue = async (agentId: number, startDate: string, endDate: string) => {
  const endpoint = 'okr/getokrsettledrevenue';
  const param = `?agentId=${agentId}&startDate=${startDate}&endDate=${endDate}`;
  const options = {
    cache: 'no-cache',
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  // console.log(param)
  // console.log('response', response)
  return response.data
};

export const fetchSettledRevenue = async (profileId: string, startDate: string, endDate: string) => {
  const endpoint = 'accounttransactions';
  const baseParam = `?filters[accountId][profileId][$eq]=${profileId}&filters[createdAt][$gte]=${startDate}&filters[createdAt][$lte]=${endDate}&filters[type][$eq]=commission&populate[statementLog][populate]=*`;
  const options = {
    next: { revalidate: 60, tags: ['settledRevenue'] }
  };

  let allTransactions: any[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const param = `${baseParam}&pagination[page]=${page}&pagination[pageSize]=100`;
    const response = await strapiFetch({
      method: 'GET',
      endpoint,
      param,
      normalize: true,
      options
    });

    if (response.status !== 200) {
      console.error('Error fetching account transactions:', response.status);
      return { totalFieldRevenue: 0, totalTeamFieldRevenue: 0 };
    }

    allTransactions = [...allTransactions, ...response.data];
    
    // Check if there are more pages
    hasMorePages = response.meta.pagination.page < response.meta.pagination.pageCount;
    page++;
  }

  console.log(`Retrieved ${allTransactions.length} transactions in total.`);

  // Calculate totalFieldRevenue and totalTeamFieldRevenue
  let totalFieldRevenue = 0;
  let totalTeamFieldRevenue = 0;

  allTransactions.forEach(transaction => {
    transaction.statementLog.forEach((log: any) => {
      if (log.source === 'Personal') {
        totalFieldRevenue += log.fieldRevenue || 0;
        totalTeamFieldRevenue += log.teamFieldRevenue || 0;
      }
    });
  });

  // Revalidate the 'settledRevenue' tag

  return {
    totalFieldRevenue,
    totalTeamFieldRevenue
  };
};