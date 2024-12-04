'use server'
import {normalize} from '@/lib/format'
import {isMe, canAccess, accessWithAuth } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
import { cache } from 'react';
// import { getServerSession } from 'next-auth/server';

// export const getNetworkGraph1 = async (profileId: number, showActiveOnly: boolean) => {
//   if (!await canAccess(['Superuser', 'Advisor', 'Poweruser'])) {
//     redirect('/dashboard/error');
//   }
//   const endpoint = 'networks/fetchnetworkgraph';
//   const param = `?profileId=${profileId}&showActiveOnly=${showActiveOnly}`;
//   const options = {
//     method: 'GET',
//     cache: 'no-cache'  // Assuming you have middleware to handle these
//   };
//   // const header = {
//   //   Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
//   // };
//   console.log('profileId', profileId)
//   const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
//   return response;
// };

export const getNetworkGraph = async (user: number, showActiveOnly: boolean) => {
  const session: any | null = await accessWithAuth()
  const sessionUserProfileId = session?.user?.data?.profile?.id as any;
  // const isUnderManagement = await findHierarchyPath(Number(sessionUserProfileId), Number(params.user));
  const response = await fetch (`${process.env.STRAPI_BACKEND_URL}/api/networks/isUnderManagement?parentId=${sessionUserProfileId}&childId=${user}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    }
  }) 
  const responseData = await response.json();
  const isUnderManagement: boolean = responseData?.underManagement || false;
  // const isUnderManagement = await findHierarchyPath(Number(sessionUserProfileId), Number(params.user));
  let parentIdFilter = -1
  console.log(isUnderManagement)
  // const parentIdFilter = session?.user?.data?.profile?.id; // Replace with the parent ID you want to filtr
  if (session?.user?.data?.role?.name === 'Superuser' || sessionUserProfileId == user) {
    console.log('You are authorized to edit this profile');
    parentIdFilter = Number(user)
  } else if (isUnderManagement) {
    console.log('You are authorized to view this profile');
    parentIdFilter = Number(user)
  } else {
    console.log('You are not authorized to view this profile');
    redirect('/dashboard');
    return;
  }
  let network = []
  try {
    // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/networks/fetchnetworkgraph?profileId=${user}&activeOnly=${showActiveOnly}`, {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/networks/fetchnetworkgraph?profileId=${user}&activeOnly=${showActiveOnly}`, {
      method: 'GET',  
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      // next: { revalidate: 60, tags: ['networks'] },
      // next: { 'cache': 'no-cache' } 
    });
    network = await response.json();
    return network;
  } catch (error) {
    console.error(error);
    return { data: {}, meta: {} };
  }

};
