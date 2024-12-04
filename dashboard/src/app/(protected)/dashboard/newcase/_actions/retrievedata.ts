'use server'
import {normalize} from '@/lib/format'
import {isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';
import { cache } from 'react';

export const getCarrier = async (carrier: string) => {
  const endpoint = 'carriers';
  const param = `?fields=id&fields=carrierName&filters[carrierName]=${encodeURIComponent(carrier)}`;
  const options = { cache: 'no-cache' };
  const response = await strapiFetch({
    method: 'GET',
    endpoint: endpoint,
    param: param,
    normalize: true,
    options: options
  });
  // Assuming the normalization and error handling are taken care of by strapiFetch
  console.log('response', response)
  return response.status == 200 ? response.data[0] : null;
};


export const getCommissionDistributionGS = async () => {
  const endpoint = 'commissiondistributions';
  const param = '?populate=generalSettings';
  const options = {
    cache: 'no-cache',
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  return response.data[0]?.generalSettings;
};

export const getCarriers = async () => {
  const endpoint = 'carriers';
  const baseParam = '?populate[photo][formats][small][url][fields][0]=url&fields[1]=carrierName&fields[2]=id&sort=order:asc';
  const options = {
    next: { revalidate: 60, tags: ['carriers'] } // Assuming you have middleware to handle these
  };
  let allCarriers:any[] = [];
  let page = 1;
  let hasMorePages = true;
  while (hasMorePages) {
    const param = `${baseParam}&pagination[page]=${page}&pagination[pageSize]=100`;
    const response = await strapiFetch({ 
      method: 'GET', 
      endpoint, 
      param, 
      normalize: true, 
      options 
    });
    if (response.status !== 200) {
      console.error('Error fetching carriers:', response.status);
      return [];
    }
    allCarriers = [...allCarriers, ...response.data];
    // Check if there are more pages
    hasMorePages = response.meta.pagination.page < response.meta.pagination.pageCount;
    page++;
  }
  console.log(`Retrieved ${allCarriers.length} carriers in total.`);
  return allCarriers;
};

export const getProvinces = async () => {
  const endpoint = 'provinces';
  const param = '?fields=id&fields=name';
  const options = {
    next: { revalidate: 60, tags: ['provinces'] } // Assuming you have middleware to handle these
  };
  const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
  return response.data;
};




export const getProducts = async (carrierId: number) => {
  const endpoint = 'products';
  const options = {
    next: { revalidate: 10, tags: ['products'] } // Assuming you have middleware to handle these
  };
  let allProducts: any[] = [];
  let page = 1;
  let pageCount = 0;
  do {
    // const param = `?populate[productcategoryId]=*&populate[carrierId]=*&filters[carrierId]=${carrierId}&pagination[page]=${page}&pagination[pageSize]=100`;
    const param = `?populate[productcategoryId][fields][0]=name&populate[productcategoryId][fields][1]=productCategoryGroup&populate[carrierId][fields][2]=carrierName&populate=*&filters[carrierId]=${carrierId}&pagination[page]=${page}&pagination[pageSize]=100`;
    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    allProducts = allProducts.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  } while (page <= pageCount);

  // console.log(JSON.stringify(allProducts));
  return allProducts;
};

export const getFundCategory = async (carrierId: number) => {
  const endpoint = 'fundcategorytypes';
  const options = {
    cache: 'no-cache',
  };
  let allFundCategories: any[] = [];
  let page = 1;
  let pageCount = 0;
  do {
    const param = `?fields=id&fields=name&populate[carrierId][fields][0]=id&filters[carrierId][id][$eq]=${carrierId}&pagination[page]=${page}&pagination[pageSize]=100`;
    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    allFundCategories = allFundCategories.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  } while (page <= pageCount);
  // console.log(JSON.stringify(allFundCategories));
  return allFundCategories;
};

export const getInvestmentFeeType = async () => {
  const endpoint = 'investmentfeetypes';
  const options = {
    cache: 'no-cache',
  };
  let allFeeTypes: any[] = [];
  let page = 1;
  let pageCount = 0;
  do {
    const param = `?populate=fundCategoryTypeId&pagination[page]=${page}&pagination[pageSize]=100`;
    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    allFeeTypes = allFeeTypes.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  } while (page <= pageCount);
  // console.log(JSON.stringify(allFeeTypes));
  return allFeeTypes;
};


function convertProfilesToFormattedArray(profiles: any[]) {
  return profiles.map(profile => ({
    name: `${profile?.firstName?.trim().toUpperCase()} ${profile?.lastName?.trim().toUpperCase()}`,
    id: profile.id
  }));
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