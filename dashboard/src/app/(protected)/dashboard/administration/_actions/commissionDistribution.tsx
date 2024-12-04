'use server'
// import {normalize} from '@/lib/format';

// export const fetchCommissionDistributions = async () => {
//   try {
//     const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/commissiondistributions?populate=*`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
//       },
//       cache: 'no-cache',
//     });
//     if (!response.ok) {
//       console.error(`Failed to fetch commission distributions, status: ${response.status}`);
//       return { error: `Failed with status: ${response.status}` };
//     }
//     const responseData = await response.json();
//     return normalize(responseData.data);

//   } catch (error) {
//     console.error(error);
//     return { error: 'An error occurred while fetching commission distributions.' };
//   }
// }

import {normalize} from '@/lib/format'
import {isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';


export const fetchCommissionDistributions = async () => {
  if (!await canAccess(['Superuser'])) {
    redirect('/dashboard/error');
  }

  const endpoint = 'commissiondistributions';
  // const param = '?populate=*';
  const param = '?populate[rankOverrides][populate]=rankId&populate[generalSettings]=*&populate[generationOverrides]=*&populate[largeCaseSettings]=*&populate[accelerator]=*'
  const options = {
    method: 'GET',
    next: { tags: ['commissiondistributions'] }, // Assuming you have middleware to handle these
    cache: 'no-cache'
  };

  try {
    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    if (!response) {
      console.error('Failed to fetch commission distributions');
      return { error: 'Failed to fetch commission distributions' };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching commission distributions:', error);
    return { error: 'An error occurred while fetching commission distributions.' };
  }
}

export const createCommissionDistributions = async (id: number, commissionData: any) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['commissiondistributions'] },  // Assuming you have middleware to handle these
    cache: 'no-cache'
  };

  console.log('commissionData', commissionData);

  const response = await strapiFetch({
    method: 'POST',
    endpoint: `commissiondistributions`,
    param: '',
    normalize: false,
    options: options,
    body: JSON.stringify({ data: commissionData }),
    header: headers
  });
  console.log(JSON.stringify(response));
  revalidateTag('commissiondistributions');
  return response;
};

// export const getNewCase = async (id: number) => {
//   if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
//     redirect('/dashboard/error');
//   }
//   const endpoint = 'newcases';
//   const filterParam = `?filters[id]=${id}`;
//   const populateParam = "&populate[appInfo][fields][0]=id&populate[appInfo][fields][1]=appNumber&populate[appInfo][fields][2]=policyAccountNumber&populate[appInfo][fields][3]=type&populate[appInfo][populate][carrierId][fields][0]=id&populate[appInfo][populate][carrierId][fields][1]=carrierName&populate[appInsProducts][fields]=*&populate[appInsProducts][populate][productId]=*&populate[appInvProducts][fields]=*&populate[appInvProducts][populate][productId]=*&populate[applicants]=*&populate[caseType]=*&populate[status]=*&populate[writingAgentId][fields][0]=id&populate[writingAgentId][fields][1]=firstName&populate[writingAgentId][fields][2]=lastName";
//   const param = filterParam +  populateParam
//   const options = {
//     method: 'GET',
//     next: { tags: ['newcases'] }  // Assuming you have middleware to handle these
//   };
//   // console.log(endpoint, param, options)
//   const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
//   // console.log('response.data', JSON.stringify(response.data))
//   return response;
// };


// export const createNewCase = async (newCaseData: any) => {
//   const headers = {
//     'Content-Type': 'multipart/form-data'
//   };
//   const options = {
//     next: { tags: ['newcases'] },  // Assuming you have middleware to handle these
//     cache: 'no-cache'
//   };
//   console.log('newCaseData', newCaseData)
//   const response = await strapiFetch({
//     method: 'POST',
//     endpoint: 'newcases',
//     param: '',
//     normalize: false,
//     options: options,
//     body: newCaseData,
//     // header: headers
//   });
//   console.log(JSON.stringify(response))
//   revalidateTag('newcases');
//   return response
// }
