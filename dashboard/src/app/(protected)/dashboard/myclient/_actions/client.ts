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
import { accessWithAuth } from '@/lib/isAuth';

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
  const clients: any[] = [];
  let page = 1;
  let pageSize = 100; // Increased page size for efficiency
  let totalRecords = 0;
  let fetchedRecords = 0;

  // Loop to fetch all pages
  do {
    // Step 1: Fetch Clients associated with the given profileId
    const clientsResponse = await strapiFetch({
      method: 'GET',
      endpoint: 'clients',
      // param: `?filters[profileId][$eq]=${profileId}&filters[deleted][$null]=true&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=id:asc`,
      param: `?filters[profileId][$eq]=${profileId}&filters[deleted][$eq]=false&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=id:asc`,
      normalize: true,
      // options: { next: { revalidate: 1 } } 
      options: { cache: 'no-cache' } 
    });

    if (clientsResponse.status !== 200) {
      throw new Error(`Error fetching clients: ${clientsResponse.errorMessage || clientsResponse.statusText}`);
    }

    const currentBatch = clientsResponse?.data;
    totalRecords = clientsResponse?.meta?.pagination?.total || 0;

    if (currentBatch && currentBatch.length > 0) {
      // Check for duplicates before adding to the clients array
      const newClients = currentBatch.filter((newClient: any) => 
        !clients.some(existingClient => existingClient.id === newClient.id)
      );
      clients.push(...newClients);
      fetchedRecords += newClients.length;
    }

    page++;

    // Break the loop if we've fetched all records or if we're not getting any new records
    if (fetchedRecords >= totalRecords || currentBatch.length === 0) {
      break;
    }

  } while (true);

  // Step 2: Sort clients by id as a final safeguard
  clients.sort((a, b) => a.id - b.id);

  // Step 3: Return the fetched clients
  return clients;
};

// export const getClient = async (profileId: string) => {
//   const clients = new Map<string, any>(); // Use a Map to store unique clients
//   let page = 1;
//   let pageSize = 25; // Default page size
//   let totalRecords = 0;
//   let fetchedRecords = 0;

//   // Loop to fetch all pages
//   do {
//     // Step 1: Fetch Clients associated with the given profileId
//     const clientsResponse = await strapiFetch({
//       method: 'GET',
//       endpoint: 'clients',
//       param: `?filters[profileId][$eq]=${profileId}&filters[deleted][$null]=true&populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
//       normalize: true,
//       options: { next: { revalidating: 2000 } }
//     });

//     if (clientsResponse.status !== 200) {
//       throw new Error(`Error fetching clients: ${clientsResponse.errorMessage || clientsResponse.statusText}`);
//     }

//     const currentBatch = clientsResponse?.data;
//     totalRecords = clientsResponse?.meta?.pagination?.total || 0;

//     if (currentBatch && currentBatch.length > 0) {
//       // Add or update clients in the Map, using id as the key
//       currentBatch.forEach((client: => {
//         if (client.id) {
//           clients.set(client.id.toString(), client);
//         }
//       });
//       fetchedRecords += currentBatch.length;
//     }

//     page++;
//   } while (fetchedRecords < totalRecords);

//   // Step 2: Return the fetched clients as an array of unique records
//   return Array.from(clients.values());
// };

export const getClientById = async (clientId: string) => {
  // Fetch the client associated with the given clientId
  const clientResponse = await strapiFetch({
    method: 'GET',
    endpoint: `clients/${clientId}`, // Directly fetch the client by its ID
    param: '?populate=*', // Include all related data
    normalize: true,
    options: { cache: 'no-cache' } // Don't cache the response
  });

  if (clientResponse.status !== 200) {
    throw new Error(`Error fetching client: ${clientResponse.errorMessage || clientResponse.statusText}`);
  }

  const client = clientResponse?.data;

  // Check if the client exists
  if (!client) {
    throw new Error(`Client with ID ${clientId} not found`);
  }

  // Return the fetched client
  return client;
};



export const createClient = async (clientInfo: any, profileId: any) => {
  console.log('clientInfo', clientInfo);
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
    console.log('response', response);
    if (response.status == 200) {
      return response;
    } else {
      console.error('Failed to add client:', response.errorMessage);
      return response
    }
  } catch (error) {
    console.error('An error occurred while adding the client:', error);
  }
};

export const updateClient = async (clientId: string, clientInfo: any) => {
  console.log('Updating client:', clientId, clientInfo);
  try {
    const response = await strapiFetch({
      method: 'PUT',
      endpoint: `clients/${clientId}`,
      param: '',
      normalize: false,
      options: {},
      body: JSON.stringify({ data: clientInfo }),
      header: { 'Content-Type': 'application/json' },
    });
    console.log('Update response:', response);
    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to update client:', response.errorMessage);
      throw new Error(response.errorMessage || 'Failed to update client');
    }
  } catch (error) {
    console.error('An error occurred while updating the client:', error);
    throw error;
  }
};

export const getProvinces = async () => {
  try {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'provinces',
      param: '?pagination[pageSize]=100', // Adjust if you have more than 100 provinces
      normalize: true,
      options: { next: { revalidate: 20 } } // Cache for 1 hour
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching provinces: ${response.errorMessage || response.statusText}`);
    }

    return response.data.map((province: any) => ({
      id: province.id,
      name: province.name
    }));
  } catch (error) {
    console.error('Failed to fetch provinces:', error);
    return [];
  }
};


export const mergeRecords = async (
  consolidatedRecordId: string, 
  recordIds: string[], 
  consolidatedRecord: any,
) => {
  console.log('Merging records:', { consolidatedRecordId, recordIds, consolidatedRecord});
  const session = await accessWithAuth();
  const authorId = session?.user?.data?.profile?.id
  console.log('authorId', authorId);
  try {
    // console.log('Merging records:', { consolidatedRecordId, recordIds, consolidatedRecord });
    const response = await strapiFetch({
      method: 'POST',
      endpoint: 'clients/merge-records',
      param: '',
      normalize: false,
      options: {},
      body: JSON.stringify({
        data:{
        consolidatedRecordId,
        recordIds,
        consolidatedRecord: consolidatedRecord,
        author: {
          id: authorId
        }
      }}),
      header: { 'Content-Type': 'application/json' },
    });

    console.log('Merge response:', response);

    if (response.status === 200) {
      return response;
    } else {
      console.error('Failed to merge clients:', response.errorMessage);
      throw new Error(response.errorMessage || 'Failed to merge clients');
    }
  } catch (error) {
    console.error('An error occurred while merging the clients:', error);
    throw error;
  }
};


export const addActivityToClient = async (clientId: string, activity: {
  type: 'Call' | 'Meeting' | 'Task' | 'Deadline' | 'Email' | 'Lunch';
  subject: string;
  startDate: Date;
  endDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  location: string;
  videoCallLink: string;
  description: string;
  status: 'Free' | 'Busy' | 'Out of Office';
  notes: string;
  participants: { name: string; email: string }[];
}) => {
  try {
    // Fetch the current client data
    const getResponse = await strapiFetch({
      method: 'GET',
      endpoint: `clients/${clientId}`,
      param: '?populate=activities',
      normalize: false,
      options: { next: { revalidate: 0 } },
    });

    if (getResponse.status !== 200) {
      throw new Error(`Error fetching client: ${getResponse.errorMessage || getResponse.statusText}`);
    }

    const currentClient = getResponse.data;

    // Prepare the new activity
    const currentTime = new Date().toISOString();
    const newActivity = {
      ...activity,
      createTime: currentTime,
      startDate: activity.startDate.toISOString(),
      endDate: activity.endDate.toISOString(),
    };

    // Update the client's activities
    const updatedActivities = [
      ...(currentClient.attributes.activities || []),
      newActivity
    ];

    // Send the update request
    const updateResponse = await strapiFetch({
      method: 'PUT',
      endpoint: `clients/${clientId}`,
      param: '',
      normalize: false,
      options: { next: { revalidate: 2000 } },
      body: JSON.stringify({
        data: {
          activities: updatedActivities
        }
      }),
      header: { 'Content-Type': 'application/json' }
    });

    if (updateResponse.status !== 200) {
      throw new Error(`Error adding activity: ${updateResponse.errorMessage || updateResponse.statusText}`);
    }

    return updateResponse.data;
  } catch (error) {
    console.error('Error adding activity:', error);
    throw error;
  }
};


export const addNoteToClient = async (clientId: string, note: {
  content: string;
}) => {
  try {
    // Fetch the current client data
    const getResponse = await strapiFetch({
      method: 'GET',
      endpoint: `clients/${clientId}`,
      param: '?populate=notes',
      normalize: false,
      options: { next: { revalidate: 0 } },
    });

    if (getResponse.status !== 200) {
      throw new Error(`Error fetching client: ${getResponse.errorMessage || getResponse.statusText}`);
    }

    const currentClient = getResponse.data;

    // Prepare the new note
    const currentTime = new Date().toISOString();
    const newNote = {
      ...note,
      createTime: currentTime,
    };

    // Update the client's notes
    const updatedNotes = [
      ...(currentClient.attributes.notes || []),
      newNote
    ];

    // Send the update request
    const updateResponse = await strapiFetch({
      method: 'PUT',
      endpoint: `clients/${clientId}`,
      param: '',
      normalize: false,
      options: { next: { revalidate: 2000 } },
      body: JSON.stringify({
        data: {
          notes: updatedNotes
        }
      }),
      header: { 'Content-Type': 'application/json' }
    });

    if (updateResponse.status !== 200) {
      throw new Error(`Error adding note: ${updateResponse.errorMessage || updateResponse.statusText}`);
    }

    return updateResponse.data;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};