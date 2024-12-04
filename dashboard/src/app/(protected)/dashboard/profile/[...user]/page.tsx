import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Profile from '../_components/Profile';
import { redirect } from 'next/navigation';
import { GraphQLClient } from 'graphql-request';
import { Session } from '@/types/session';
import { normalize } from '@/lib/format';
import { findHierarchyPath } from '@/lib/network';

const page = async ({ params }: { params: { user: string } }) => {
  let mode: string = 'view';
  let query = ''
  const session: Session | null = await getServerSession(authOptions as any);
  const sessionUserProfileId = session?.user?.data?.profile?.id as any;
  
  const fullQuery = `${process.env.STRAPI_BACKEND_URL}/api/profiles/${params.user}?populate[homeAddress][populate][provinceId]=*&populate[mailAddress][populate][provinceId]=*&populate=owner&populate[bankingInformation]=*&populate[beneficiary]=*&populate[subscriptionSetting]=*&populate[rankId]=*&populate[administrative]=*`;
  const partlyQuery = `${process.env.STRAPI_BACKEND_URL}/api/profiles/${params.user}?populate[homeAddress][populate][provinceId]=*&fields[0]=firstName&fields[1]=lastName&fields[2]=middleName&fields[3]=nickName&fields[4]=homeProvince`;
   

  // Check management hierarchy
  const response = await fetch (`${process.env.STRAPI_BACKEND_URL}/api/networks/isUnderManagement?parentId=${sessionUserProfileId}&childId=${params.user}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    },
    next: { revalidate: 60, tags: ['networks'] },
  }) 
  const responseData = await response.json();
  const isUnderManagement: boolean = responseData?.underManagement || false;

  if (session?.user?.data?.role?.name === 'Superuser' || sessionUserProfileId == params.user) {
    console.log('You are authorized to edit this profile');
    query = fullQuery;
    mode = 'edit';
  } else if (isUnderManagement) {
    console.log('You are authorized to view this profile');
    query = partlyQuery;
    mode = 'view'
  } else {
    console.log('You are not authorized to view this profile');
    redirect('/dashboard');
    return;
  }
  
  let profile = null;
  
  try {
    const variables = { id: params.user[0] };
    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      next: { tags: ['profile'] },
    });
    const responseData = await response.json();
    profile = await normalize(responseData.data); // Ensure your normalize function can handle this data structure
    if (profile) {
      mode = session?.user?.data?.role?.name === 'Superuser' || sessionUserProfileId == params.user ? 'edit' : 'view';
    }
    // Change the selectable field to the ID
    profile.rankId = profile.rankId?.id;
  } catch (error) {
    console.error('GraphQL Error:', error);
    redirect('/dashboard');
  }
  // console.log(session?.user?.data?.role)
  // console.log('profile', profile)
  return (
    <>
      {profile && <Profile profile={profile} mode={mode}/>}
    </>
  );
}

export default page;
