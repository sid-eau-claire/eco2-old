
'use server'

// import NextAuth from "next-auth";
// import { authOptions } from '@/lib/auth';
// const handler = NextAuth(authOptions);

type Credentials = {
  email: string;
  password: string;
};

export const login = async({credentials}: {credentials: Credentials}) => {
  // console.log(handler)
  console.log(credentials)
  var fetch_url = `${process.env.STRAPI_BACKEND_URL}/api/auth/local`;
  var params = {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      identifier: credentials.email,
      password: credentials.password
    })
  }
  let response = await fetch(fetch_url, params);
  let responseData = await response.json();
  console.log('responseData', responseData)
  return {...responseData}
}