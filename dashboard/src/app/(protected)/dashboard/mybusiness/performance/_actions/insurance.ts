'use server'
import { strapiFetch } from '@/lib/strapi';
export const getokrinsurance = async (agentId: number, startDate: string, endDate: string) => {
  const endpoint = 'okr/getokrinsurance';
  const param = `?agentId=${agentId}&startDate=${startDate}&endDate=${endDate}`;
  const options = {
    cache: 'no-cache',
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  // console.log('response', response)
  return response.data
};

