// app/_actions/resetTokenInStrapi.ts
'use server'
import { strapiFetch } from '@/lib/strapi';

export async function generateResetToken(email: string) {
  try {
    console.log("Sending request to Strapi to generate reset token");
    console.log("Email:", email);
    const header = {
      'Content-Type': 'application/json'

    }
    const response = await strapiFetch({
      method: 'POST',
      endpoint: 'passwordresettokens',
      param: '/create',
      normalize: false,
      options: {},
      body: JSON.stringify({'data':  {'email':email} }),
      header: header
    });

    console.log("Strapi response:", response);

    if (response.status === 200) {
      return { success: true, message: response?.message, token: response?.token };
    } else {
      console.error("Error response from Strapi:", response.errorMessage);
      return { success: false, error: response.errorMessage || 'Failed to create reset token' };
    }
  } catch (error) {
    console.error('Error generating reset token:', error);
    return { success: false, error: 'An error occurred while generating the reset token.' };
  }
}



export async function resetPassword(code: string, password: string, passwordConfirmation: string) {
  try {
    console.log("Sending reset password request to Strapi for code:", code);
    const response = await strapiFetch({
      method: 'POST',
      endpoint: 'passwordresettokens',
      param: '/reset',
      normalize: false,
      options: {},
      body: JSON.stringify({ data: { code, password, passwordConfirmation } }),
    });
    console.log("Full Strapi reset password response:", JSON.stringify(response, null, 2));

    if (response.status === 200) {
      return { success: true, message: 'Password reset successfully' };
    } else {
      console.error("Error response from Strapi:", response.errorMessage);
      return { success: false, error: response.errorMessage || 'Failed to reset password' };
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: 'An error occurred while resetting the password.' };
  }
}