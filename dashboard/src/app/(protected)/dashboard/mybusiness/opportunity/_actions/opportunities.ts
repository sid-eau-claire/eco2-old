'use server'
import { accessWithAuth } from '@/lib/isAuth';

import { strapiFetch } from '@/lib/strapi';

export const getOpportunities = async (profileId: string) => {
  // Step 1: Fetch Profile and Opportunities
  const profileResponse = await strapiFetch({
    method: 'GET',
    endpoint: 'profiles',
    param: `${profileId}`,
    normalize: false,
    options: { next: { revalidating: 2000 } }
  });

  if (profileResponse.status !== 200) {
    throw new Error(`Error fetching profile: ${profileResponse.errorMessage || profileResponse.statusText}`);
  }

  const opportunitiesFilters = `filters[profileId][id][$eq]=${profileId}&populate=clientId`;

  // Step 2: Fetch Opportunities
  let allOpportunities: any = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'opportunities',
      param: `?${opportunitiesFilters}&pagination[page]=${page}&pagination[pageSize]=25`,
      normalize: true,
      options: { next: { revalidating: 2000 } }
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching opportunities: ${response.errorMessage || response.statusText}`);
    }

    allOpportunities = allOpportunities.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allOpportunities;
};

export const createOpportunity = async (opportunityData: {
  profileId: string,
  description: string,
  type: 'Insurance' | 'Investment' | 'Affiliate',
  estAmount: number,
  status: 'Prospect' | 'Discovery' | 'Planning' | 'Plan Ready' | 'Pending Close' | 'Paper Work' | 'In The Mill',
  intent: string,
  clientId: string
}) => {
  // Step 1: Prepare the body of the request
  const body = {
    data: {
      profileId: opportunityData.profileId,
      description: opportunityData.description,
      type: opportunityData.type,
      estAmount: opportunityData.estAmount,
      status: opportunityData.status,
      intent: opportunityData.intent,
      clientId: opportunityData.clientId
    }
  };
  console.log('body', body)
  // Step 2: Make the POST request to create the opportunity
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'opportunities',
    param: '',
    normalize: false,
    options: { next: { revalidating: 2000 } },
    body: JSON.stringify(body),
    header: { 'Content-Type': 'application/json' }
  });

  if (response.status !== 200) { // 201 is the HTTP status code for Created
    throw new Error(`Error creating opportunity: ${response.errorMessage || response.statusText}`);
  }

  return response.data;
};

// export const getClientsByProfileId = async (profileId: string) => {
//   const clientsFilters = `filters[profileId][id][$eq]=${profileId}&populate[profileId]=id&populate=clientId`;
//   let allClients: any = [];
//   let page = 1;
//   let pageCount = 1;
//   console.log('getClients is called')
//   while (page <= pageCount) {
//     const response = await strapiFetch({
//       method: 'GET',
//       endpoint: 'clients',
//       param: `?${clientsFilters}&pagination[page]=${page}&pagination[pageSize]=25`,
//       normalize: true,
//       options: { 'cache': 'no-cache'  }
//     });

//     if (response.status !== 200) {
//       throw new Error(`Error fetching clients: ${response.errorMessage || response.statusText}`);
//     }

//     allClients = allClients.concat(response.data);
//     pageCount = response.meta.pagination.pageCount;
//     page++;
//   }
//   return allClients;
// };
export const getClientsByProfileId = async (profileId: string) => {
  // const clientsFilters = `filters[profileId][id][$eq]=${profileId}&populate=profileId&populate=clientId`;
  const clientsFilters = `filters[profileId][id][$eq]=${profileId}&populate[profileId][fields][0]=id`;
  // const clientsFilters = `filters[profileId][id][$eq]=${profileId}&filters[deleted][$eq]=false&populate[profileId][fields][0]=id`;


  let allClients: any = [];
  let page = 1;
  let pageCount = 1;
  console.log('getClients is called');
  while (page <= pageCount) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'clients',
      param: `?${clientsFilters}&pagination[page]=${page}&pagination[pageSize]=25`,
      normalize: true,
      options: { next: { revalidating: 2000 } },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching clients: ${response.errorMessage || response.statusText}`);
    }

    allClients = allClients.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  // Remove duplicates by creating a map of unique client IDs
  const uniqueClientsMap = new Map();
  allClients.forEach((client: any) => {
    uniqueClientsMap.set(client.id, client);
  });

  // Convert the map back to an array
  const uniqueClients = Array.from(uniqueClientsMap.values());

  // Sort the clients by their own firstName after removing duplicates
  uniqueClients.sort((a: any, b: any) => {
    const firstNameA = a.firstName.toLowerCase();
    const firstNameB = b.firstName.toLowerCase();

    if (firstNameA < firstNameB) return -1;
    if (firstNameA > firstNameB) return 1;
    return 0;
  });

  return uniqueClients;
};
export const getClients = async (profileId: string) => {
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
  // clients.sort((a, b) => a.id - b.id);
  clients.sort((a: any, b: any) => {
    const firstNameA = a.firstName.toLowerCase();
    const firstNameB = b.firstName.toLowerCase();

    if (firstNameA < firstNameB) return -1;
    if (firstNameA > firstNameB) return 1;
    return 0;
  });

  // Step 3: Return the fetched clients
  return clients;
};


export const updateOpportunity = async (id: string, opportunityData: {
  profileId?: string,
  description?: string,
  type?: 'Insurance' | 'Investment' | 'Affiliate',
  estAmount?: number,
  status?: string,
  clientId?: string,
  intent?: string,
  activities?: any[],
  planningOptions?: string,
  carrierId?: string,
  productCategoryId?: string,
  fundCategoryTypeId?: string,
  notes?: any[],
  documents?: any[]
}) => {
  // const body:any = {
  //   data: {
  //     ...opportunityData,
  //     profileId: opportunityData.profileId ? { connect: [{ id: opportunityData.profileId }] } : undefined,
  //     clientId: opportunityData.clientId ? { connect: [{ id: opportunityData.clientId }] } : undefined
  //   }
  // };
  const body:any = {
    data: {
      ...opportunityData,
      profileId: opportunityData?.profileId ? opportunityData?.profileId : null,
      clientId: opportunityData?.clientId ? opportunityData?.clientId : null
    }
  };  

  // Remove any undefined fields
  Object.keys(body.data).forEach(key => (body.data[key] === undefined || body.data[key] == '') && delete body.data[key]);
  console.log('id', id)
  console.log('Update opportunity request body:', JSON.stringify(body, null, 2));

  try {
    const response = await strapiFetch({
      method: 'PUT',
      endpoint: `opportunities/${id}`,
      param: '',
      normalize: false,
      options: { next: { revalidate: 0 } },
      body: JSON.stringify(body),
      header: { 'Content-Type': 'application/json' }
    });

    if (response.error) {
      console.error('Error updating opportunity:', response.error);
      throw new Error(response.error.message || 'Failed to update opportunity');
    }

    return response.data;
  } catch (error) {
    console.error('Error in updateOpportunity:', error);
    throw error;
  }
};

export const deleteOpportunity = async (id: string) => {
  try {
    const response = await strapiFetch({
      method: 'DELETE',
      endpoint: `opportunities/${id}`,
      param: '',
      normalize: false,
      options: { next: { revalidate: 0 } },
    });

    if (response.error) {
      console.error('Error deleting opportunity:', response.error);
      throw new Error(response.error.message || 'Failed to delete opportunity');
    }

    return response.data;
  } catch (error) {
    console.error('Error in deleteOpportunity:', error);
    throw error;
  }
};


export const addActivityToOpportunity = async (opportunityId: string, activity: {
  type: string;
  subject: string;
  startDate: Date;
  endDate: Date;
  priority: string;
  location: string;
  videoCallLink: string;
  description: string;
  status: string;
  notes: string;
  participants: { name: string; email: string }[];
}) => {
  try {
    const getResponse = await strapiFetch({
      method: 'GET',
      endpoint: `opportunities/${opportunityId}`,
      param: '?populate=activities',
      normalize: false,
      options: { next: { revalidating: 0 } },
    });

    if (getResponse.status !== 200) {
      throw new Error(`Error fetching opportunity: ${getResponse.errorMessage || getResponse.statusText}`);
    }

    const currentOpportunity = getResponse.data;
    const currentTime = new Date().toISOString();

    const updatedActivities = [
      ...(currentOpportunity.attributes.activities || []),
      {
        ...activity,
        createTime: currentTime // Add this line
      }
    ];

    const updateResponse = await strapiFetch({
      method: 'PUT',
      endpoint: `opportunities/${opportunityId}`,
      param: '',
      normalize: false,
      options: { next: { revalidating: 2000 } },
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
export const getOpportunityById = async (id: string) => {
  const response = await strapiFetch({
    method: 'GET',
    endpoint: `opportunities/${id}`,
    param: '?populate=clientId&populate=profileId&populate=notes&populate=activities&populate=documents',
    normalize: true,
    options: { next: { revalidating: 2000 } }
  });
  console.log('getOpportunityById response', response)
  if (response.status !== 200) {
    throw new Error(`Error fetching opportunity: ${response.errorMessage || response.statusText}`);
  }

  return response.data;
};


export const getEvents = async (startDate: string, endDate: string) => {
  const session: any = await accessWithAuth();
  // console.log('session', session)
  if (!session?.user?.googleAccessToken) {
    console.error('Google Access token not found');
    return { message: 'Not authenticated' };
  }

  const googleAccessToken = session.user.googleAccessToken;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startDate}&timeMax=${endDate}`, {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch calendar events:', errorData);
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return { message: 'Error fetching calendar events', status: 500 };
  }
};

export const addNoteToOpportunity = async (opportunityId: string, note: { content: string }) => {
  try {
    const getResponse = await strapiFetch({
      method: 'GET',
      endpoint: `opportunities/${opportunityId}`,
      param: '?populate=notes',
      normalize: false,
      options: { next: { revalidating: 0 } },
    });

    if (getResponse.status !== 200) {
      throw new Error(`Error fetching opportunity: ${getResponse.errorMessage || getResponse.statusText}`);
    }

    const currentOpportunity = getResponse.data;
    const currentTime = new Date().toISOString();

    const updatedNotes = [
      ...(currentOpportunity.attributes.notes || []),
      { 
        content: note.content, 
        createdAt: currentTime,
        createTime: currentTime // Add this line
      }
    ];

    const updateResponse = await strapiFetch({
      method: 'PUT',
      endpoint: `opportunities/${opportunityId}`,
      param: '?populate=notes',
      normalize: false,
      options: { next: { revalidating: 2000 } },
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

    return updateResponse.data.attributes.notes[updateResponse.data.attributes.notes.length - 1];
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};


export const addFileToOpportunity = async (opportunityId: string, fileInfo: { name: string, type: string, size: number }, fileContentBase64: string) => {
  try {
    console.log('Uploading file:', fileInfo.name);

    const formData = new FormData();
    const blob = await fetch(`data:${fileInfo.type};base64,${fileContentBase64}`).then(res => res.blob());
    formData.append('files.documents.attachments', blob, fileInfo.name);
    formData.append('data', JSON.stringify({
      documents: [
        {
          createTime: new Date().toISOString()
        }
      ]
    }));

    const uploadResponse = await strapiFetch({
      method: 'PUT',
      endpoint: `opportunities/${opportunityId}`,
      param: '?populate=documents.attachments',
      normalize: false,
      options: { next: { revalidating: 0 } },
      body: formData,
    });

    console.log('Full upload response:', JSON.stringify(uploadResponse, null, 2));

    if (uploadResponse.status !== 200) {
      console.error('Upload response error:', uploadResponse);
      throw new Error(`Error uploading file: ${uploadResponse.errorMessage || uploadResponse.statusText}`);
    }

    if (!uploadResponse.data || !uploadResponse.data.attributes || !uploadResponse.data.attributes.documents) {
      console.error('Unexpected response structure:', uploadResponse);
      throw new Error('Unexpected response structure from server');
    }

    const documents = uploadResponse.data.attributes.documents;
    if (!Array.isArray(documents) || documents.length === 0) {
      console.error('No documents found in response:', uploadResponse);
      throw new Error('No documents found in server response');
    }

    const lastDocument = documents[documents.length - 1];
    if (!lastDocument.attachments || !Array.isArray(lastDocument.attachments) || lastDocument.attachments.length === 0) {
      console.error('No attachments found in the last document:', lastDocument);
      throw new Error('No attachments found in the last document');
    }

    const uploadedFile = lastDocument.attachments[0];

    if (!uploadedFile || !uploadedFile.id) {
      console.error('Invalid uploaded file structure:', uploadedFile);
      throw new Error('Invalid uploaded file structure in server response');
    }

    return {
      id: uploadedFile.id,
      name: uploadedFile.name,
      url: uploadedFile.url,
      size: uploadedFile.size,
      type: uploadedFile.mime,
      uploadedAt: uploadedFile.createdAt,
    };
  } catch (error) {
    console.error('Error in addFileToOpportunity:', error);
    throw error;
  }
};