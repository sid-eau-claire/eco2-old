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


export const getClientsByProfileId = async (profileId: string) => {
  const clientsFilters = `filters[profileId][id][$eq]=${profileId}&populate=profileId&populate=clientId`;

  let allClients: any = [];
  let page = 1;
  let pageCount = 1;
  console.log('getClients is called')
  while (page <= pageCount) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'clients',
      param: `?${clientsFilters}&pagination[page]=${page}&pagination[pageSize]=25`,
      normalize: true,
      options: { next: { revalidating: 2000 } }
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching clients: ${response.errorMessage || response.statusText}`);
    }

    allClients = allClients.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  }

  return allClients;
};

export const getOpportunityByClientId = async (id: string) => {
  const filterParam = `filters[clientId][id][$eq]=${id}&populate=clientId&populate=profileId&populate=notes&populate=activities&populate=documents`; 
  const response = await strapiFetch({
    method: 'GET',
    endpoint: `opportunities`,
    // param: '?populate=clientId&populate=profileId&populate=notes&populate=activities&populate=documents',
    param: `?${filterParam}`,
    normalize: true,
    options: { next: { revalidating: 2000 } }
  });

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
