
'use server'

export const profileExisted = async (email: string) => {
  let response: Response|null = null;
  let responseData = null;
  console.log(`${process.env.STRAPI_BACKEND_URL}/api/users?filters[email][$eq]=${email}`)
  try {
    response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/users?filters[email][$eq]=${email}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      }
    });
    if (response !== null) {
      responseData = await response.json();
    }
    if (responseData.length > 0 && responseData[0].email == email) {
      return true
    }
    console.log('responseData', responseData)
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
  try {
    response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/invitations?filters[inviteEmail][$eq]=${email}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      }
    });
    if (response !== null) {
      responseData = await response.json();
    }
    console.log('responseData', responseData)
    if (responseData.data.length > 0 && responseData.data[0].attributes.inviteEmail == email) {
      return true
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
  return false
}