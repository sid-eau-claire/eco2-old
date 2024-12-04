'use server'

import { normalize as normalizeFunction } from './format';

export const strapiFetch = async ({method, endpoint, param, normalize, options, body, header} : {method: string, endpoint: string, param: string, normalize: boolean, options: any, body?: any, header?: any}) => {
  if (method == 'GET' || method == 'get') {
    param = `/${param}`
  }
  try {
    const defaultOptions = {
      method: method,
      headers: {
        ...header,
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      },
      body: body
    }
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}${param}`, 
      {...defaultOptions, ...options}
    );
    // console.log(param)
    // console.log(response)
    class CustomError extends Error {
      status: number = 0;
      statusText: string = '';
      body: any;
    }
    // console.log('responseData', await response.json())
    if (response.status !== 200) {
      const errorBody = await response.json();  // Assuming the server returns JSON with an error message
      const errorMessage = errorBody.error ? errorBody.error.message : response.statusText;
      const error = new CustomError(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      error.body = errorBody;
      throw error;
    }
    if (normalize) {
      const {data, meta} = await response.json();
      return {data: normalizeFunction(data), meta: meta, status: response.status};
    } else {
      const responseData = await response.json();
      return await {...responseData, status: response.status};
    }
  } catch (error: any) {
    // console.error('Failed to fetch data:', error);
    // console.log(error.status)
    // console.log(error.statusText )
    // console.log(error?.body?.error?.message)
    // console.log(error)
    // console.log(JSON.stringify(error))
    return  { 
      data: [], 
      meta: { pagination: { pageCount: 0 } }, 
      status: error?.status, 
      errorMessage: error?.body?.error?.message,
      details: error?.body?.error?.details || 'no details available. check the server console log'
    };
  }
  
}

// For PUT Response
// {"data":{"id":340,"attributes":{"carrier":"RBC Insurance","createdAt":"2024-04-29T17:29:00.071Z","updatedAt":"2024-04-29T17:41:11.782Z","statementPeriodStartDate":"2024-03-14","statementPeriodEndDate":"2024-03-22","statementDate":"2024-03-22","fieldPayDate":"2024-04-26","payrollStatus":"Just In","statementAmount":12.8,"bankDepositStatus":"Statement Only","depositDate":null,"deposit":null,"totalPostMarkupRevenue":12.8}},"meta":{}}
// Common functions to fetch data from Strapi

export const fetchRanks = async () => {
  const response = await strapiFetch({method: 'GET', endpoint: 'ranks', param: '', normalize: true, options: {}});
  return response;
}


export const fetchProvinces = async () => {
  const response = await strapiFetch({method: 'GET', endpoint: 'provinces', param: '', normalize: true, options: {}});
  return response;
}

export const fetchMonthlyMetric = async (profileId: string, metricName: string, yearMonth: string = '') => {
  let queryParams = `filters[profileId][$eq]=${profileId}`;
    if (metricName) {
    queryParams += `&filters[metricName][$eq]=${metricName}`;
  }
  if (yearMonth) {
    if (yearMonth.length === 4) {
      queryParams += `&filters[yearMonth][$gte]=${yearMonth}01&filters[yearMonth][$lte]=${yearMonth}12`;
    } else if (yearMonth.length === 6) {
      queryParams += `&filters[yearMonth][$eq]=${yearMonth}`;
    }
  }
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'monthly-metrics',
    param: `?${queryParams}`,
    normalize: true,
    options: {}
  });
  return response;
}



export const options = async (option: string , identifier: string) => {
  const response = await strapiFetch({method: 'GET', endpoint: option, param: `?fields[0]=${identifier}`, normalize: true, options: {cache: 'no-cache'}});
}

export async function getStrapiRoles () {
  const header = {
    'Content-Type': 'application/json'
  };
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'users-permissions/roles',
    param: '',
    normalize: false,
    header: header,
    options: {} 
  });
  return response.roles;
}


// app/actions/notification.ts (or wherever your server actions are located)

// app/actions/notification.ts (or wherever your server actions are located)

export const fetchProfileIdsByRank = async (rankId: string) => {
  const header = {
    'Content-Type': 'application/json'
  };
  let baseParam = '';
  if (rankId === 'all') {
    baseParam = 'fields[0]=id&populate[rankId][fields][0]=id';
  } else {
    baseParam = `filters[rankId][$eq]=${rankId}&fields[0]=id`;
  }

  let allProfileIds: string[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const param = `?${baseParam}&pagination[page]=${page}&pagination[pageSize]=100`;
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'profiles',
      param: param,
      normalize: true,
      header: header,
      options: {}
    });

    if (response.data && response.data.length > 0) {
      const profileIds = response.data.map((profile: any) => profile.id);
      allProfileIds = [...allProfileIds, ...profileIds];
      page++;

      // Check if we've reached the last page
      if (response.meta && response.meta.pagination) {
        hasMorePages = page <= response.meta.pagination.pageCount;
      } else {
        hasMorePages = false;
      }
    } else {
      hasMorePages = false;
    }
  }

  return allProfileIds;
}


export async function sendNotification(
  { recipientIds, title, message, link }
  : { recipientIds: string[], title: string, message: string, link: string }) {
  const header = {
    'Content-Type': 'application/json'
  };
  const endpoint = 'notifications';
  const options = { cache: 'no-cache' };

  for (const recipientId of recipientIds) {
    const body = {
      data: {
        title: title.substring(0, 50),
        message: message,
        link: link,
        profileId: recipientId,
        isRead: false
      }
    };

    await strapiFetch({
      method: 'POST',
      endpoint: endpoint,
      param: '',
      normalize: false,
      options: options,
      body: JSON.stringify(body),
      header: header
    });
  }

  return { success: true };
}