'use server'
import {normalize} from '@/lib/format'
import {isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';


export const fetchNewCase = async (agentId: number, status: string, page: number, pageSize: number, search: string, formattedStartDate: string, formattedEndDate: string) => {
  if (!await canAccess(['Superuser', 'Advisor', 'InternalStaff'])) {
    redirect('/dashboard/error');
  }

  const buildFilter = (forWritingAgent = true) => {
    let additionalFilter = '';

    if (agentId != 0) {
      additionalFilter += forWritingAgent
        ? `&filters[writingAgentId][$eq]=${agentId}`
        : '';
    }
    if (status !== '') {
      additionalFilter += `&filters[status][$eq]=${status}`;
    }
    if (formattedStartDate !== '') {
      additionalFilter += `&filters[createdAt][$gte]=${formattedStartDate}`;
    }
    if (formattedEndDate !== '') {
      additionalFilter += `&filters[createdAt][$lte]=${formattedEndDate}`;
    }

    return additionalFilter;
  };

  const fetchCases = async (forWritingAgent = true) => {
    const additionalFilter = buildFilter(forWritingAgent);
    const endpoint = 'newcases';
    const filterParam = `?filters[caseType][$ne]=Affiliate&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}`;
    const populateParam = "&populate[appInfo][fields][0]=id&populate[appInfo][fields][1]=appNumber" 
                        + "&populate[appInfo][fields][2]=policyAccountNumber"  
                        + "&populate[appInfo][fields][3]=type" 
                        + "&populate[appInfo][populate][carrierId][fields][0]=id" 
                        + "&populate[appInfo][populate][carrierId][fields][1]=carrierName" 
                        + "&populate[appInsProducts][fields]=*" 
                        + "&populate[appInsProducts][populate][productId]=*&populate[appInvProducts][fields]=*" 
                        + "&populate[appInvProducts][populate][productId]=*&populate[applicants]=*" 
                        + "&populate[caseType]=*&populate[status]=*" 
                        + "&populate[writingAgentId][fields][0]=id" 
                        + "&populate[writingAgentId][fields][1]=firstName&populate[writingAgentId][fields][2]=lastName" 
                        + "&populate[splitAgents][fields]=*&populate[splitAgents][populate][profileId][fields]=id";

    const param = filterParam + populateParam;
    const options = {
      method: 'GET',
      next: { tags: ['newcases'] }
    };

    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    return response.data;
  };

  // Fetch cases for writing agent
  const writingAgentCases = await fetchCases(true);

  // Fetch cases where there are split agents (this fetches all, we'll filter in the application)
  const splitAgentCases = await fetchCases(false);
  const filteredSplitAgentCases = splitAgentCases.filter((singleCase: any) => 
    singleCase.splitAgents.some((agent: any) => agent.profileId.id === agentId)
  );

  
  // Combine both sets of cases
  const combinedCases = [...writingAgentCases, ...filteredSplitAgentCases];
  
  const uniqueCases = Array.from(new Set(combinedCases.map(caseItem => caseItem.id)))
  .map(id => {
    return combinedCases.find(caseItem => caseItem.id === id);
  });
  const processedCases = uniqueCases.map(singleCase => {
    let totalCases = 1;
    let totalRevenue = singleCase.totalEstFieldRevenue;


    return {
      ...singleCase,
      totalCases,
      totalRevenue
    };
  });

  return {
    data: processedCases
  };
  
};

export const fetchAdvisorPersonalFieldRevenueHistory = async (profileId: string, startYearMonth: number, endYearMonth: number) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  const populate = 'populate[profileId][fields][0]=id';
  const filters = `filters[profileId][id]=${profileId}` 
                + `&filters[metricName]=personalFieldRevenue` 
                + `&filters[yearMonth][$gte]=${startYearMonth}&filters[yearMonth][$lte]=${endYearMonth}`;
  
  const response = await strapiFetch({
    method: 'GET', 
    endpoint: 'monthly-metrics', 
    param: `?${populate}&${filters}`, 
    normalize: false, 
    options: {
      'cache': 'no-cache',
    }
  });
  return response;
};

export const fetchPersonalYTDMetric = async (profileId: string, yearMonth: number) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  console.log('profileId', profileId);
  console.log('yearMonth', yearMonth);
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    cache: 'no-cache'
  };
  const body = {
      "profileId": Number(profileId),
      "yearMonth": yearMonth
  };

  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'newcases/calculatePersonalYTDMetric',
    param: '',
    normalize: false,
    // body: {data: JSON.stringify(body)}, // Ensure the body is a JSON string
    body: JSON.stringify({ data: body }), // Ensure the body is a JSON string
    options: options,
    header: headers
  });

  return response;
};



export const fetchTeamYTDMetric = async (profileId: string, yearMonth: number) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  console.log('profileId', profileId);
  console.log('yearMonth', yearMonth);
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    // cache: 'no-cache'
    next: { revalidate: 2000 }
  };
  const body = {
      "profileId": Number(profileId),
      "yearMonth": yearMonth
  };

  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'newcases/calculateTeamYTDMetric',
    param: '',
    normalize: false,
    // body: {data: JSON.stringify(body)}, // Ensure the body is a JSON string
    body: JSON.stringify({ data: body }), // Ensure the body is a JSON string
    options: options,
    header: headers
  });

  return response;
};
