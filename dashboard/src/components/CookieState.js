// import { useState, useEffect } from 'react';
// import Cookies from 'js-cookie';
// import axios, { all } from 'axios';

// export function useCookieState  (key, initialState, scope) {
//   const [state, setState] = useState(() => {
//     const cookieValue = Cookies.get(scope + '_' + key);
//     return cookieValue ? JSON.parse(cookieValue) : initialState;
//   });

//   useEffect(() => {
//     Cookies.set(scope + '_' + key, JSON.stringify(state));
//   }, [key, state]);

//   return [state, setState];
// };

// // Function to read cookies and construct an object
// const readCookiesAsObject = (scope) => {
//   const allCookies = Cookies.get();
//   const scopeCookies = {};

//   Object.keys(allCookies).forEach(key => {
//     if (key.startsWith(scope + '_')) {
//       scopeCookies[key.substring(scope.length + 1)] = allCookies[key];
//     }
//   });
//   return scopeCookies;
// };

// // Function to read cookies and construct an object
// const readCookiesItem = (item) => {
//   const allCookies = Cookies.get(item);
//   // const scopeCookies = {};
//   console.log(allCookies)
//   return allCookies
//   // Object.keys(allCookies).forEach(key => {
//     // if (key.startsWith(scope + '_')) {
//       // scopeCookies[key.substring(scope.length + 1)] = allCookies[key];
//     // }
//   // });

//   // return scopeCookies;
// };

// export async function postCookiesData (scope, session, endpoint) {
//   const cookieData = readCookiesAsObject(scope);
//   console.log('cookieData:', cookieData);
//   console.log('session:', session);
//   console.log('endpoint:', `${process.env.STRAPI_BACKEND_URL}/api/${endpoint}` );
//   try {
//     // const data = JSON.stringify(cookieData);
//     const response = await axios.post(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`, 
//     // {data: JSON.stringify(cookieData)}, {
//     {data: cookieData}, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${session.user.accessToken}`
//       },
//     });
//     console.log('Data posted successfully:', response.data);
//   } catch (error) {
//     console.error('Error posting data:', error);
//   }
// };

// export async function putCookiesItem (item, session, endpoint) {
//   const cookieData = readCookiesItem(item);
//   const invitationId = JSON.parse(cookieData).id
//   const cookieDataJSON = JSON.parse(cookieData)
//   console.log('cookieDataJSON:', JSON.parse(cookieData));
//   console.log('cookieData:', cookieData);
//   console.log('session:', session);
//   console.log('endpoint:', `${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`);

//   try {
//     // const data = JSON.stringify(cookieData);
//     const response = await axios.put(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}/${invitationId}`, 
//     // {data: JSON.stringify(cookieData)}, {
//     {data: cookieDataJSON}, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${session.user.accessToken}`
//       },
//     });
//     console.log('Data posted successfully:', response.data);
//   } catch (error) {
//     console.error('Error posting data:', error);
//   }
// };


// export async function getCookiesData (scope, session, endpoint) {
//   // console.log('session:', session);
//   console.log(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`)
//   try {
//     const response = await axios.get(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`, 
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${session?.user?.accessToken}`
//       },
//     });
//     console.log('Data retrieved successfully:', response.data.data);
//       Object.keys(response.data.data.attributes).forEach(key => {
//         if (key != 'publishedAt' && key != 'createdAt' && key != 'updatedAt') {
//           Cookies.set(scope + '_' + key, response.data.data.attributes[key]);
//         }
//       });
//       Cookies.set(scope + '_id', response.data.data.id);
//     // });
//   } catch (error) {
//     console.error('Error get data:', error);
//   }
// };

// export async function clearCookiesData (item) {
//   if (item == undefined) {
//     document.cookie = 'invitation_formData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//   }
// }

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export function useCookieState  (key, initialState, scope) {
  const [state, setState] = useState(() => {
    const cookieValue = Cookies.get(scope + '_' + key);
    return cookieValue ? JSON.parse(cookieValue) : initialState;
  });

  useEffect(() => {
    Cookies.set(scope + '_' + key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

// Function to read cookies and construct an object
const readCookiesAsObject = (scope) => {
  const allCookies = Cookies.get();
  const scopeCookies = {};

  Object.keys(allCookies).forEach(key => {
    if (key.startsWith(scope + '_')) {
      scopeCookies[key.substring(scope.length + 1)] = allCookies[key];
    }
  });
  return scopeCookies;
};

// Function to read cookies and construct an object
const readCookiesItem = (item) => {
  const allCookies = Cookies.get(item);
  // const scopeCookies = {};
  console.log(allCookies)
  return allCookies
  // Object.keys(allCookies).forEach(key => {
    // if (key.startsWith(scope + '_')) {
      // scopeCookies[key.substring(scope.length + 1)] = allCookies[key];
    // }
  // });

  // return scopeCookies;
};

export async function postCookiesData(scope, session, endpoint) {
  const cookieData = readCookiesAsObject(scope);
  console.log('cookieData:', cookieData);
  console.log('session:', session);
  console.log('endpoint:', `${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`);

  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({ data: cookieData })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Data posted successfully:', responseData);
  } catch (error) {
    console.error('Error posting data:', error);
  }
};

// export async function putCookiesItem(item, session, endpoint) {
//   const cookieData = readCookiesItem(item);
//   const invitationId = JSON.parse(cookieData).id;
//   const cookieDataJSON = JSON.parse(cookieData);

//   try {
//     const formData = new FormData();
//     formData.append('data', JSON.stringify(cookieDataJSON));
//     const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}/${invitationId}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${session.user.accessToken}`
//       },
//       body: formData
//     });

//     if (!response.ok) {
//       throw new Error(`Error: ${response.statusText}`);
//     }

//     const responseData = await response.json();
//     console.log('Data posted successfully:', responseData);
//   } catch (error) {
//     console.error('Error posting data:', error);
//   }
// };
export async function putCookiesItem(item, session, endpoint) {
  const cookieData = readCookiesItem(item);
  // const invitationId = JSON.parse(cookieData).id;
  const cookieDataJSON = JSON.parse(cookieData);
  console.log('cookieDataJSON:', JSON.parse(cookieData));
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({ data: cookieDataJSON })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Data posted successfully:', responseData);
  } catch (error) {
    console.error('Error posting data:', error);
  }
};


export async function putCookiesFile(item, formFile, session, endpoint) {
  const cookieData = readCookiesItem(item);
  // const invitationId = JSON.parse(cookieData).id;
  try {
    const response = await axios.put(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`,
    formFile,
    {
      headers: {
        'content-type': 'multipart/form-data',
        'Authorization': `Bearer ${session.user.accessToken}`
      }
    });
    console.log('File uploaded successfully:', response);
  } catch (error) {
    console.error('Error in file upload:', error);
  }
};

export async function getCookiesData(scope, session, endpoint) {
  console.log(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`);
  
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.accessToken}`
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Data retrieved successfully:', responseData.data.data);

    Object.keys(responseData.data.data.attributes).forEach(key => {
      if (key !== 'publishedAt' && key !== 'createdAt' && key !== 'updatedAt') {
        Cookies.set(scope + '_' + key, responseData.data.data.attributes[key]);
      }
    });
    Cookies.set(scope + '_id', responseData.data.data.id);
  } catch (error) {
    console.error('Error get data:', error);
  }
};

export async function clearCookiesData (item) {
  if (item == undefined) {
    document.cookie = 'invitation_formData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}