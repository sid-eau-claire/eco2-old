'use server'
import { strapiFetch } from '@/lib/strapi';
export const getokrinvestment = async (agentId: number, startDate: string, endDate: string) => {
  console.log('agentId', agentId)
  console.log('startDate', startDate)
  console.log('endDate', endDate)
  const endpoint = 'okr/getokrinvestment';
  const param = `?agentId=${agentId}&startDate=${startDate}&endDate=${endDate}`;
  const options = {
    cache: 'no-cache',
  };
  
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  // console.log(response.data)
  // console.log('response', response)
  return response.data
};

