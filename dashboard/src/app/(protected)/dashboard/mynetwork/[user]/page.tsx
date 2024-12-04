import axios from 'axios';
import NetworkTree from '../_components/NetworkTree'; // Your component to display the network tree
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from '@/types/session';
// import { findHierarchyPath } from '@/lib/network';
import { redirect } from 'next/navigation';

interface NetworkProps {
  networks: any[]; // Define a more specific type based on your data structure
}

export default async ({ params }: { params: { user: string, showActiveOnly: boolean } }) => {
  const session: Session | null = await getServerSession(authOptions as any);
  const sessionUserProfileId = session?.user?.data?.profile?.id as any;
  // const isUnderManagement = await findHierarchyPath(Number(sessionUserProfileId), Number(params.user));
  const response = await fetch (`${process.env.STRAPI_BACKEND_URL}/api/networks/isUnderManagement?parentId=${sessionUserProfileId}&childId=${params.user}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
    },
    next: { revalidate: 60, tags: ['networks'] },
  }) 
  const responseData = await response.json();
  const isUnderManagement: boolean = responseData?.underManagement || false;
  // const isUnderManagement = await findHierarchyPath(Number(sessionUserProfileId), Number(params.user));
  let parentIdFilter = -1
  console.log(isUnderManagement)
  // const parentIdFilter = session?.user?.data?.profile?.id; // Replace with the parent ID you want to filtr
  if (session?.user?.data?.role?.name === 'Superuser' || sessionUserProfileId == params.user) {
    console.log('You are authorized to edit this profile');
    parentIdFilter = Number(params.user)
  } else if (isUnderManagement) {
    console.log('You are authorized to view this profile');
    parentIdFilter = Number(params.user)
  } else {
    console.log('You are not authorized to view this profile');
    redirect('/dashboard');
    return;
  }
  // const showActiveOnly = params.showActiveOnly;
  // let network = []
  // try {
  //   const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/networks/fetchnetworkgraph?profileId=${params.user}&activeOnly=${showActiveOnly}`, {
  //     method: 'GET',  
  //     headers: {
  //       Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
  //     },
  //     // next: { revalidate: 60, tags: ['networks'] },
  //     'cache': 'no-cache',
  //   });
  //   network = await response.json();
  // } catch (error) {
  //   console.error(error);
  // }

  // const filteredNetworks = allNetworks.filter((item: any) => item.attributes.parentId?.data?.id === parentIdFilter);
  // console.log(allNetworks)
  // console.log(JSON.stringify(network))
  return (
    <div className=''>
      {/* <NetworkTree network={network?.data} /> */}
      <NetworkTree user={Number(params?.user)} />
      {/* <NetworkTree user={Number(params?.user)} /> */}
    </div>
  );
};


