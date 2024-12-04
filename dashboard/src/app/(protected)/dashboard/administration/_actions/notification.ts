// app/actions/notificationActions.ts
'use server'

import { strapiFetch } from '@/lib/strapi';

export async function searchUsers(searchTerm: string) {
  // This is a placeholder. In a real app, you'd implement the actual search logic here.
  const header = {
    'Content-Type': 'application/json'
  };
  const response = await strapiFetch({
    method: 'GET',
    endpoint: 'profiles',
    param: `?filters[username][$contains]=${searchTerm}`,
    normalize: true,
    header: header,
    options: {} 
  });
  return response.data;
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

export async function findTeammates(userId: string) {
  // This is a dummy function. In a real app, you'd implement the actual logic to find teammates.
  return [
    { id: '1', name: 'Teammate 1' },
    { id: '2', name: 'Teammate 2' },
    { id: '3', name: 'Teammate 3' },
  ];
}


export const getAdvisorNameList = async () => {
  try {
    const responses = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/profiles/advisorlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
      },
      next: {revalidate: 60, tags: ['profiles']}
    });
    const responseData = await responses.json();
    return responseData;
  } catch (error) {
    console.log(error);
    return null;
  }
}
