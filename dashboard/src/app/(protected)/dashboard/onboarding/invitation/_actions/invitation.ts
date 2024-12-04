'use server'
import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
export const createInvitation = async (newFormData: any) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['invitation'] },  // Assuming you have middleware to handle these
    cache: 'no-cache'
  };
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'invitations',
    param: '',
    normalize: false,
    options: options,
    body: JSON.stringify({ data: newFormData }),
    header: headers
  });
  console.log(response)
  return { status: response.status, data: response.data, errorMessage: response?.errorMessage };
}

export const getInvitation = async (agentId: number) => {
  const endpoint = 'profiles';
  const param = `${agentId}?populate=invitations`;
  const options = {
    cache: 'no-cache',
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  return response.data.invitations;
};

export const cancelInvitation = async (invitationId: number) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['invitation'] },
    cache: 'no-cache'
  };
  const response = await strapiFetch({
    method: 'DELETE',
    endpoint: 'invitations',
    param: `/${invitationId}`,
    normalize: false,
    options: options,
    header: headers
  });
  revalidateTag('invitation');
  return { status: response.status, data: response.data, errorMessage: response?.errorMessage };
}