import React from 'react'
import CarrierList from './_components/CarrierList';
import {CarrierType} from '@/types/carrier';
import {normalize} from '@/lib/format';

const page = async () => {
  let carriers: CarrierType[] = [];
  try {
    // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/carriers?populate[0]=photo&fields[0]=carrierName&fields[1]=summary&fields[2]=focus&fields[3]=bgColor&fields[4]=textColor&sort=order:asc`,
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/carriers?populate[0]=photo&fields[0]=carrierName&fields[1]=summary&fields[2]=focus&fields[3]=bgColor&fields[4]=textColor&filters[deactivatedAt][$null]=true&sort=order:asc`,
    { headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        application: 'application/json'
      },
      'cache': 'no-cache'
    })
    const responseData = await response.json()
    carriers = await normalize(responseData);
    // console.log(carriers)
  } catch (error) {
    console.error('Error fetching article:', error);
  }
  return (
    <>
      <CarrierList carriers={carriers} />
    </>
  )
}

export default page