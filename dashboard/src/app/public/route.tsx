
import type { NextApiRequest, NextApiResponse } from 'next';

// Define a handler function for your API route
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // console.log(searchParams.get('collection'))
  const collection = searchParams.get('collection')
  console.log(req.url)
  if (collection !== 'licensestatus' && collection !== 'provinces' && collection !== 'ranks' && collection !== 'relationships' && collection !== 'tags') {
    return new Response('Not Found', { status: 404 });
  }
  const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${collection}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const responseData = await response.json();
  // console.log(responseData);
  return Response.json(responseData.data);
}
