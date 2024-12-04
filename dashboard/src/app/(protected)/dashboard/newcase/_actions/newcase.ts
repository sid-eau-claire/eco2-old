'use server'
import {normalize} from '@/lib/format'
import {isMe, canAccess, accessWithAuth } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
import { postComment } from '@/components/Comments/_actions/comments';


export const fetchNewCase = async (agentId: number, status: string,  page: number, pageSize: number, search: string, formattedStartDate: string, formattedEndDate: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['newcaseEdit'])) {
    redirect('/dashboard/error');
  }
  let additionalFilter = '';
  if (agentId != 0) {
    additionalFilter += `&filters[writingAgentId]=${agentId}`;
  } 
  if (status !== '') {
    additionalFilter += `&filters[status]=${status}`;
  }
  if (formattedStartDate !== '') {
    additionalFilter += `&filters[createdAt][$gte]=${formattedStartDate}`;
  }
  if (formattedEndDate !== '') {
    additionalFilter += `&filters[createdAt][$lte]=${formattedEndDate}`;
  }
  const endpoint = 'newcases';
  const filterParam = `?filters[caseType][$ne]=Affiliate&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}`;
  const populateParam = "&populate[appInfo][fields][0]=id" 
                      + "&populate[appInfo][fields][1]=appNumber" 
                      + "&populate[appInfo][fields][2]=policyAccountNumber" 
                      + "&populate[appInfo][fields][3]=type" 
                      + "&populate[appInfo][populate][carrierId][fields][0]=id" 
                      + "&populate[appInfo][populate][carrierId][fields][1]=carrierName" 
                      + "&populate[appInsProducts][fields]=*" 
                      + "&populate[appInsProducts][populate][productId]=*" 
                      + "&populate[appInvProducts][fields]=*" 
                      + "&populate[appInvProducts][populate][productId]=*" 
                      + "&populate[applicants]=*"
                      + "&populate[caseType]=*" 
                      + "&populate[status]=*&populate[writingAgentId][fields][0]=id" 
                      + "&populate[writingAgentId][fields][1]=firstName&populate[writingAgentId][fields][2]=lastName"
                      + "&populate[splitAgents][populate][profileId]=*"
  const sortParam = "&sort[0]=updatedAt:desc";
  const param = filterParam + populateParam + sortParam;
  const options = {
    method: 'GET',
    next: { tags: ['newcases'] }  // Assuming you have middleware to handle these
  };
  // console.log(endpoint, param, options)
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  // console.log('response.data', JSON.stringify(response.data))
  return response;
};
export const fetchConfirmSettledCase = async (agentId: number, status: string,  page: number, pageSize: number, search: string, formattedStartDate: string, formattedEndDate: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['newcaseEdit'])) {
    redirect('/dashboard/error');
  }
  let additionalFilter = '';
  if (agentId != 0) {
    additionalFilter += `&filters[writingAgentId]=${agentId}`;
  } 
  if (status !== '') {
    additionalFilter += `&filters[status]=${status}`;
  }
  if (formattedStartDate !== '') {
    additionalFilter += `&filters[transactionDate][$gte]=${formattedStartDate}`;
  }
  if (formattedEndDate !== '') {
    additionalFilter += `&filters[transactionDate][$lte]=${formattedEndDate}`;
  }
  const endpoint = 'newcases';
  const filterParam = `?filters[caseType][$ne]=Affiliate&filters[settledDate][$notNull]=*&filters[status][$ne]=Paid%20Settled&pagination[page]=${page}&pagination[pageSize]=${pageSize}&pagination[withCount]=true${additionalFilter}`;
  const populateParam = "&populate[appInfo][fields][0]=id" 
                      + "&populate[appInfo][fields][1]=appNumber" 
                      + "&populate[appInfo][fields][2]=policyAccountNumber" 
                      + "&populate[appInfo][fields][3]=type" 
                      + "&populate[appInfo][populate][carrierId][fields][0]=id" 
                      + "&populate[appInfo][populate][carrierId][fields][1]=carrierName" 
                      + "&populate[appInsProducts][fields]=*" 
                      + "&populate[appInsProducts][populate][productId]=*" 
                      + "&populate[appInvProducts][fields]=*" 
                      + "&populate[appInvProducts][populate][productId]=*" 
                      + "&populate[applicants][populate][clientId]=*" 
                      + "&populate[caseType]=*" 
                      + "&populate[status]=*&populate[writingAgentId][fields][0]=id" 
                      + "&populate[writingAgentId][fields][1]=firstName&populate[writingAgentId][fields][2]=lastName"
                      + "&populate[splitAgents][populate][profileId]=*"
                      + "&populate[commissionLogEntriesIds]=*";


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
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'newcases',
    param: '',
    normalize: false,
    options: options,
    body: newCaseData,
    // header: headers
  });
  // console.log(response)
  revalidateTag('newcases');
  return { status: response.status, data: response.data };
}

export const getNewCase = async (id: number) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['newcaseEdit'])) {
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

// export const getNewCase = async (id: number) => {
//   if (!await canAccess(['Superuser', 'InternalStaff'], ['commissionEdit'])) {
//     redirect('/dashboard/error');
//   }
//   const endpoint = 'newcases';
//   const filterParam = `?filters[id]=${id}`;
//   const populateParam = "&populate[appInfo][fields][0]=id&populate[appInfo][fields][1]=appNumber&populate[appInfo][fields][2]=policyAccountNumber&populate[appInfo][fields][3]=type"
//                       + "&populate[appInfo][populate][carrierId][fields][0]=id&populate[appInfo][populate][carrierId][fields][1]=carrierName" 
//                       + "&populate[appInfo][populate][provinceId]=*"
//                       + "&populate[appInsProducts][fields]=*&populate[appInsProducts][populate][productId]=*&populate[appInsProducts][populate][productCategory]=*" 
//                       + "&populate[appInvProducts][fields]=*&populate[appInvProducts][populate][categoryId]=*&populate[appInvProducts][populate][feeTypeId]=*" 
//                       // + "&populate[applicants]=*" 
//                       + "&populate[applicants][populate][clientId]=*" 
//                       + "&populate[caseType]=*&populate[status]=*" 
//                       + "&populate[writingAgentId][fields][0]=id&populate[writingAgentId][fields][1]=firstName&populate[writingAgentId][fields][2]=lastName"
//                       + "&populate[splitAgents][populate][profileId]=*"
//                       + "&populate[compliance][fields]=*&populate[compliance][populate][QA]=*"
//                       + "&populate[applicationDocuments]=*&populate[illustrationDocuments]=*"
//                       + "&populate[estSettleDays]=*"
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


export const updateNewCaseStatus = async (selectedRecord: any, status: string) => {
  if (!await canAccess(['Superuser', 'InternalStaff'], ['newcaseEdit'])) {
    redirect('/dashboard/error');
  }
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: {revalidate: 5 , tags: ['newcases'] },  // Assuming you have middleware to handle these
  };
  // console.log(selectedRecord, status)
  // Check if the target status is "Paid & Settled"
  let content: { status: string, settledDate?: string|null } = { status: status };
  if (status == 'Paid Settled') {
    content = { status: status, settledDate: new Date().toISOString() };
  } else {
    content = { status: status, settledDate: null };
  }
  const response = await strapiFetch({
    method: 'PUT',
    endpoint: 'newcases',
    param: `/${selectedRecord.id}`,
    normalize: false,
    options: options,
    body: JSON.stringify({ data: content }),
    header: headers
  });
  console.log(response)
  if (response.status == 200) {
    const session = await accessWithAuth();
    // export const postComment = async (collectionType: string, id: string, commentData: { content: string, user: string }) => {
    const recipientIds = selectedRecord.splitAgents.map((agent: any) => agent.profileId.id);
    await postComment(
      'newcase', 
      selectedRecord.id.toString(), 
      { content: `Status changed to ${status} by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName}`, user: 'user', title: 'New business case' },
      '',
      true,
      recipientIds
    );
  }
  revalidateTag('newcases');
  return { status: response.status, data: response.data };
}



export const  updateNewCase = async (id: number, newCaseData: any) => {
  console.log('id', id)
  console.log('newCaseData', newCaseData)
  if (!await canAccess(['Superuser', 'InternalStaff'], ['newcaseEdit'])) {
    redirect('/dashboard/error');
  }  
  const headers = {
    // 'Content-Type': 'multipart/form-data'
    'Content-Type': 'application/json'
  };
  const options = {
    next: {revalidate: 5 , tags: ['newcases'] },  // Assuming you have middleware to handle these
  };
  const response = await strapiFetch({
    method: 'PUT',
    endpoint: 'newcases',
    param: `/${id}`,
    normalize: false,
    options: options,
    body: newCaseData,
    // header: headers
  });
  if (response.status == 200) {
    const session = await accessWithAuth();
    // export const postComment = async (collectionType: string, id: string, commentData: { content: string, user: string }) => {
    await postComment('newcase', id.toString(), { content: `It is updated by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName}`, user: 'user' });
  }  
  // console.log(response)
  revalidateTag('newcases');
  return { status: response.status, data: response.data };
}