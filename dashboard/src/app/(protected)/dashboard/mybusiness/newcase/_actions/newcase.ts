'use server'
import {normalize} from '@/lib/format'
import {isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
import { cache } from 'react';


export const fetchNewCase = async (agentId: number, formattedStartDate: string, formattedEndDate: string) => {
  if (!await canAccess(['Superuser', 'Advisor', 'Poweruser'], [], agentId)) {
    redirect('/dashboard/error');
  }
  if (agentId === undefined) {
    return { data: [], meta: { pagination: { pageCount: 0 } }, status: 400 };
  }
  let additionalFilter = '';
  additionalFilter += `&filters[splitAgents][profileId][$eq]=${agentId}`;
  if (formattedStartDate !== '') {
    additionalFilter += `&filters[transactionDate][$gte]=${formattedStartDate}`;
  }
  if (formattedEndDate !== '') {
    additionalFilter += `&filters[transactionDate][$lte]=${formattedEndDate}`;
  }
  const endpoint = 'newcases';
  const populateParam = "&populate[appInfo][fields][0]=id" 
                      + "&populate[appInfo][fields][1]=appNumber" 
                      + "&populate[appInfo][fields][2]=policyAccountNumber&populate[appInfo][fields][3]=type" 
                      + "&populate[appInfo][populate][carrierId][fields][0]=id" 
                      + "&populate[appInfo][populate][carrierId][fields][1]=carrierName" 
                      + "&populate[appInsProducts][fields]=*&populate[appInsProducts][populate][productId]=*" 
                      + "&populate[appInvProducts][fields]=*&populate[appInvProducts][populate][productId]=*" 
                      + "&populate[applicants]=*&populate[caseType]=*&populate[status]=*"
                      + "&populate[writingAgentId][fields][0]=id" 
                      + "&populate[writingAgentId][fields][1]=firstName" 
                      + "&populate[writingAgentId][fields][2]=lastName"
                      + "&populate[splitAgents]=*"
  const sortParam = "&sort[0]=updatedAt:desc";
  let allCases:any = [];
  let page = 1;
  let pageCount = 0;
  do {
    const filterParam = `?filters[caseType][$ne]=Affiliate&pagination[withCount]=true&pagination[page]=${page}&pagination[pageSize]=100${additionalFilter}`;
    const param = filterParam + populateParam + sortParam;
    console.log('param', param)
    const options = {
      method: 'GET',
      cache: 'no-cache',
    };
    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    allCases = allCases.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  } while (page <= pageCount);
  return { data: allCases, meta: { pagination: { pageCount } }, status: 200 };
};


export const getNewCase = async (id: number) => {
  if (!await canAccess(['Superuser', 'Advisor', 'Poweruser'], [])) {
    redirect('/dashboard/error');
  }
  const endpoint = 'newcases';
  const filterParam = `?filters[id]=${id}`;
  const populateParam = "&populate[appInfo][fields][0]=id&populate[appInfo][fields][1]=appNumber&populate[appInfo][fields][2]=policyAccountNumber&populate[appInfo][fields][3]=type"
                      + "&populate[appInfo][populate][carrierId][fields][0]=id&populate[appInfo][populate][carrierId][fields][1]=carrierName" 
                      + "&populate[appInfo][populate][provinceId]=*"
                      + "&populate[appInsProducts][fields]=*&populate[appInsProducts][populate][productId]=*&populate[appInsProducts][populate][productCategory]=*" 
                      + "&populate[appInvProducts][fields]=*&populate[appInvProducts][populate][categoryId]=*&populate[appInvProducts][populate][feeTypeId]=*" 
                      // + "&populate[applicants]=*" 
                      + "&populate[applicants][populate][clientId]=*" 
                      + "&populate[caseType]=*&populate[status]=*" 
                      + "&populate[writingAgentId][fields][0]=id&populate[writingAgentId][fields][1]=firstName&populate[writingAgentId][fields][2]=lastName"
                      + "&populate[splitAgents][populate][profileId]=*"
                      + "&populate[compliance][fields]=*&populate[compliance][populate][QA]=*"
                      + "&populate[applicationDocuments]=*&populate[illustrationDocuments]=*"
                      + "&populate[estSettleDays]=*"
  const param = filterParam +  populateParam
  const options = {
    method: 'GET',
    next: { tags: ['newcases'] }  // Assuming you have middleware to handle these
  };
  // console.log(endpoint, param, options)
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  // console.log('response.data', JSON.stringify(response.data))
  return response;
};



export const createNewCase = async (newCaseData: any) => {
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  const options = {
    next: { tags: ['newcases'] },  // Assuming you have middleware to handle these
    cache: 'no-cache'
  };
  console.log('newCaseData', newCaseData)
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'newcases',
    param: '',
    normalize: false,
    options: options,
    body: newCaseData,
    // header: headers
  });
  console.log(JSON.stringify(response))
  revalidateTag('newcases');
  return response
}
