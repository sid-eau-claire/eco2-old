'use server'
import { strapiFetch } from '@/lib/strapi';
import { canAccess, accessWithAuth } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { postComment } from '@/components/Comments/_actions/comments';

export const getProductCategories = async () => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }

  let allProductCategories:any = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'productcategories',
      param: `?pagination[page]=${page}&pagination[pageSize]=100`,
      normalize: true,
      options: {
        'cache': 'no-cache',
      }
    });
    if (response && response.data) {
      allProductCategories = [...allProductCategories, ...response.data];
      hasMore = response.meta.pagination.page < response.meta.pagination.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allProductCategories;
}

export const getProducts = async (carrier: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  let allProducts:any = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: 'products',
      // param: `?populate[carrierId][fields][0]=id&populate[productcategoryId]=*&filters[carrierId][id]=${carrier}&pagination[page]=${page}&pagination[pageSize]=100`,
      param: `?populate[carrierId][fields][0]=id&populate[productcategoryId]=*&filters[carrierId][id]=${carrier}&filters[isActive][$eq]=true&pagination[page]=${page}&pagination[pageSize]=100`,
      normalize: true,
      options: {
        'cache': 'no-cache',
      }
    });
    if (response && response.data) {
      allProducts = [...allProducts, ...response.data];
      hasMore = response.meta.pagination.page < response.meta.pagination.pageCount;
      page++;
    } else {
      hasMore = false;
    }
  }
  return allProducts;
}

      

export const createProduct = async (productData: any) => {
  if (!await canAccess(['Superuser', 'Poweruser'])) {
    redirect('/dashboard/error');
  }
  console.log('here')
  console.log('productData', productData);
  const header = {
    'Content-Type': 'application/json',
  }
  const response = await strapiFetch({
    method: 'POST',
    endpoint: 'products',
    param: '',
    normalize: true,
    options: {
      'cache': 'no-cache',
    },
    body: JSON.stringify({ data: productData }),
    header: header
  });
  if (response.status == 200) {
    const session = await accessWithAuth();
    await postComment('product', response.data.id.toString(), { content: `Product is created by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName}`, user: 'user' });
  }
  if (response && response.data) {
    return response.data;

  } else {
    throw new Error('Failed to create product');
  }
}


export const updateProduct = async (productId: number, productData: any) => {
  if (!await canAccess(['Superuser', 'Poweruser'])) {
    redirect('/dashboard/error');
  }
  console.log('update productData', productData);
  const header = {
    'Content-Type': 'application/json',
  }  
  const response = await strapiFetch({
    method: 'PUT',
    endpoint: `products/${productId}`,
    param: '',
    normalize: true,
    options: {
      'cache': 'no-cache',
    },
    body: JSON.stringify({ data: productData }),
    header: header
  });
  if (response.status == 200) {
    const session = await accessWithAuth();
    await postComment('product', response.data.id.toString(), { content: `Product is updated by ${session?.user?.data?.profile?.firstName} ${session?.user?.data?.profile?.lastName} change: ${productData} `, user: 'user' });
  }
  if (response && response.data) {
    return response.data;
  } else {
    throw new Error('Failed to update product');
  }
}