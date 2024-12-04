import ClientView from "../_components/ClientView";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type request = {
  searchParams: {
    pageLimit: number;
    advisor: number;
  },
  params: {
    advisor: string;
    client: number;
  }
}

const client = async (request: request) => {
  console.log(request)
  const session = await getServerSession(authOptions as any);
  console.log(session)
  if (request?.params?.advisor != (session as { user: { data: { id: string } } })?.user?.data?.id ) { 
    return (
      <>
        <Breadcrumb pageName="My Clients" />
        <h1>Unauthorized</h1>
      </>
    )
  }
  const editContact = async (data: any) => {
    'use server'
    console.log(data)
    console.log(session)
    const dataWithAdvisor = {...data, advisor: (session as { user: { data: { id: string } } })?.user?.data?.id}
    console.log(dataWithAdvisor)
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      },
      body: JSON.stringify({data: dataWithAdvisor})
    });
    console.log(response)
  }

  let pageLimit = request.searchParams.pageLimit || 10;
  // let pageLimit = 10;
  let records = null;
  let tagsData = null;
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/clients?populate[0]=advisor&filters[advisor][id][$eq]=${request.params.advisor}&filters[id][$eq]=${request.params.client}&pagination[limit]=3000`,
    // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/clients?populate[0]=advisor&filters[advisor][id][$eq]=12&pagination[limit]=3000`,
      { headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
          application: 'application/json'
        },
        next: {revalidate: 60, tags: ['guidelines']}
      }
    ); 
    records = await response.json().then((data) => data.data).then((data) => data.map((item: any) => item.attributes))
    console.log(records)
    const tags = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/tags`,
      { headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
          application: 'application/json'
        },
        next: {revalidate: 60, tags: ['tags']}
      }
    );
    tagsData = await tags.json().then((data) => data.data).then((data) => data.map((item: any) => item.attributes))
    console.log(tagsData)
  } catch (error) {
    console.error('Error fetching article:', error);
  }  
  return (
    <>
        <ClientView record={records[0]} tags={tagsData} editContact={editContact}/>
    </>
  );
};

export default client;
