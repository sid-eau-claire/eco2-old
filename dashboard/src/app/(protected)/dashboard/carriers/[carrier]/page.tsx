import React from 'react'
import {normalize} from '@/lib/format';
import Tabview from '../_components/Tabview';


const page = async ({ params }: { params: { carrier: string } }) => {
  let carrier = null;
  let productCodes = [];
  let carriertrainings = []
  try {
    // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/carriers?populate=*&filters[id][$eq]=${params.carrier}&sort=sequence&pagination[limit]=1000`,
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/carriers?populate[documents][populate][productType]=*&populate[products]=*&populate[training][populate][productType]=*&filters[id][$eq]=${params.carrier}&sort=order:asc&pagination[limit]=1000`,
    { headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        application: 'application/json'
      },
      next: {revalidate: 60, tags: ['carrier']}
    }
    );
    const responseData = await response.json()
    carrier = await normalize(responseData)[0];
    // console.log(carrier)
  } catch (error) {
    console.error('Error fetching carrier', error);
  }

  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/productcodes?filters[carrierId][id][$eq]=${params.carrier}&sort=promoted&pagination[limit]=1000`,
    { headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        application: 'application/json'
      },
      next: {revalidate: 60, tags: ['productcodes']}
      // next: {revalidate: 60}
    }
    );
    const responseData = await response.json()
    productCodes = await normalize(responseData);
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/carriertrainings?filters[carrierId][id][$eq]=${params.carrier}&pagination[limit]=1000`,
    { headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        application: 'application/json'
      },
      next: {revalidate: 60, tags: ['carriertainings']}
      // next: {revalidate: 60}
    }
    );
    const responseData = await response.json()
    carriertrainings = await normalize(responseData);
    // console.log('start1')
    // console.log(carriertrainings)
    // console.log('end1')
  } catch (error) {
    console.error('Error fetching product:', error);
  }


  return (
    <>
      {carrier && (
        <Tabview carrier={carrier} productCodes={productCodes} carriertrainings={carriertrainings}/>
      )}
    </>
  )
}

export default page