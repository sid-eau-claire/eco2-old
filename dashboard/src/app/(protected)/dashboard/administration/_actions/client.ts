
'use server'

import { strapiFetch } from '@/lib/strapi';


export async function getMatchedClients(page: number = 1, pageSize: number = 50) {
  const response = await strapiFetch({
    method: 'POST',
    // endpoint: 'matched-clients',
    endpoint: 'clients/updateClientFromCits',
    param: `?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    normalize: true,
    options: { cache: 'no-store' }
  });

  if (response.status !== 200) {
    throw new Error(`Error fetching matched clients: ${response.errorMessage || response.statusText}`);
  }

  return {
    matchedClients: response.data,
    pagination: response.meta.pagination,
    nextPage: response.meta.pagination.page < response.meta.pagination.pageCount ? response.meta.pagination.page + 1 : null
  };
}

export async function updateClientFromCits(clientId: string, citsClientData: any) {
  const response = await strapiFetch({
    method: 'PUT',
    endpoint: 'clients',
    param: clientId,
    body: {
      data: {
        ...citsClientData,
        citsClientId: citsClientData.id
      }
    },
    normalize: true,
    options: { cache: 'no-store' }
  });

  if (response.status !== 200) {
    throw new Error(`Error updating client: ${response.errorMessage || response.statusText}`);
  }

  return response.data;
}
