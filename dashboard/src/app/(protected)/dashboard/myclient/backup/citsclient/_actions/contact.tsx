// 'use server'

// import { strapiFetch } from '@/lib/strapi';

// export const getCitsClient = async () => {
//   let allClients: any[] = [];
//   let page = 1;
//   let pageCount = 1;

//   while (page <= pageCount) {
//     const response = await strapiFetch({
//       method: 'GET',
//       endpoint: 'citsclients',
//       param: `?pagination[page]=${page}&pagination[pageSize]=25`,
//       normalize: false,
//       options: {}
//     });

//     if (response.status !== 200) {
//       throw new Error(`Error fetching data: ${response.errorMessage || response.statusText}`);
//     }

//     allClients = allClients.concat(response.data);
//     pageCount = response.meta.pagination.pageCount;
//     page++;
//   }

//   return allClients;
// };


'use server'

import { strapiFetch } from '@/lib/strapi';

export const getCitsClient = async (profileId: string) => {
  // Step 1: Fetch Profile and External Accounts
  const profileResponse = await strapiFetch({
    method: 'GET',
    endpoint: 'profiles',
    param: `${profileId}?populate=externalAccount`,
    normalize: false,
    options: {next: {revalidating: 2000}}
  });

  if (profileResponse.status !== 200) {
    throw new Error(`Error fetching profile: ${profileResponse.errorMessage || profileResponse.statusText}`);
  }

  const externalAccounts = profileResponse?.data?.attributes?.externalAccount;
  // console.log(externalAccounts )

  if (!externalAccounts || externalAccounts.length === 0) {
    return []; // No external accounts to match with cits clients
  }

  // Prepare filter query for external accounts
  // const filters = externalAccounts.map((account: any) => 
  //   `filters[$or][0][carriercode][$eq]=${account.externalCode}&filters[$or][1][agentid][$eq]=${account.account}`
  // ).join('&');

  const filters = externalAccounts.map((account: any, index: number) => 
    `filters[$or][${index}][carriercode][$eq]=${account.externalCode}&filters[$or][${index}][agentid][$eq]=${account.account}`
  ).join('&');  

  // Step 2: Fetch and Filter Cits Clients
  let allClients: any = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'citsclients',
      param: `?${filters}&pagination[page]=${page}&pagination[pageSize]=25`,
      normalize: true,
      options: {next: {revalidating: 2000}}
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching cits clients: ${response.errorMessage || response.statusText}`);
    }

    allClients = allClients.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allClients;
};

export const getClient = async (profileId: string) => {
  // Step 1: Fetch Clients associated with the given profileId
  const clientsResponse = await strapiFetch({
    method: 'GET',
    endpoint: 'clients',
    param: `?filters[profileId][$eq]=${profileId}&populate=*`,
    normalize: true,
    options: { next: { revalidating: 2000 } }
  });

  if (clientsResponse.status !== 200) {
    throw new Error(`Error fetching clients: ${clientsResponse.errorMessage || clientsResponse.statusText}`);
  }

  const clients = clientsResponse?.data;
  // console.log(clients);

  if (!clients || clients.length === 0) {
    return []; // No clients found for the given profileId
  }

  // Step 2: Return the fetched clients
  return clients;
};

export const createContact = async (clientInfo: any, profileId: any) => {
  try {
    const response = await strapiFetch({
      method: 'POST',
      endpoint: 'clients',
      param: '',
      normalize: false,
      options: {},
      body: JSON.stringify({ data: clientInfo }),
      header: { 'Content-Type': 'application/json' },
    });
    if (response.status == 200) {
      return response.data;
    } else {
      console.error('Failed to add client:', response.errorMessage);
    }
  } catch (error) {
    console.error('An error occurred while adding the client:', error);
  }
};