import { strapiFetch } from '@/lib/strapi';

export const fetchRelationships = async (profileId: string) => {
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'networks',
    param: `?filters[parentId][$eq]=${profileId}`,
    normalize: false,
    options: {},
  });
  return response.data;
};

export const fetchProfiles = async () => {
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'profiles',
    param: '',
    normalize: false,
    options: {},
  });
  return response.data;
};

export const updateRelationships = async (profileId: string, relationships: any[]) => {
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'networks/update',
    param: '',
    normalize: false,
    options: {},
    body: JSON.stringify({
      parentId: profileId,
      relationships,
    }),
    header: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};
