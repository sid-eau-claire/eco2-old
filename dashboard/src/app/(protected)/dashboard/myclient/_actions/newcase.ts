'use server'
import { accessWithAuth } from '@/lib/isAuth';

import { strapiFetch } from '@/lib/strapi';


export const getNewCasesByClientId = async (clientId: string) => {
  const filterParam = `filters[$or][0][applicants][clientId][id][$eq]=${clientId}`;
  // const filterParam = `filters[$or][0][applicants][clientId][id][$eq]=25`;
  const populateParam = [
    'populate[applicants][populate][0]=clientId',
    'populate[appInvProducts][populate][0]=productId',
    'populate[appInvProducts][populate][1]=categoryId',
    'populate[appInvProducts][populate][2]=feeTypeId',
    'populate[appInsProducts][populate][0]=productId',
    'populate[appInsProducts][populate][1]=productCategory',
    'populate[writingAgentId]=*',
    'populate[splitAgents]=*',
    'populate[appInfo]=*',
    'populate[compliance]=*',
    'populate[applicationDocuments]=*',
    'populate[illustrationDocuments]=*',
    'populate[appAffiliateProduct]=*'
  ].join('&');
  console.log(`?${filterParam}&${populateParam}`)
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'newcases',
    param: `?${filterParam}&${populateParam}`,
    normalize: true,
    options: { 'cache': 'no-cache' }
  });

  if (response.status !== 200) {
    throw new Error(`Error fetching newcases: ${response.errorMessage || response.statusText}`);
  }

  return response.data;
};