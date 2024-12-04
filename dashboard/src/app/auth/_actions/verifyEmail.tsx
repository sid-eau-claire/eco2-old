export const verifyEmailCode = (email: string, verificationCode: string) => {
  console.log('simulate email notification sent')
  var fetch_url = `${process.env.STRAPI_BACKEND_URL}/auth/email-verification`;
  var params = {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      email: email,
      code: verificationCode
    })
  }
  return fetch(fetch_url, params)
    .then(response => response.json())
    .then(data => {
      return data
    })
    .catch(error => {
      console.error('Error:', error);
    });
}