// File: app/_actions/citsClient.js

'use server'
import { strapiFetch } from '@/lib/strapi';

export async function loadCitsClientData() {
  try {
    const response = await strapiFetch({
      method: 'POST',
      endpoint: 'citsclients/createOrUpdateClient',
      normalize: false,
      param: '',
      body: JSON.stringify({}),
      options: { cache: 'no-store' }
    });
    console.log('Strapi response:', response);

    if (response.status !== 200) {
      throw new Error(response.errorMessage || 'An error occurred while processing clients');
    }

    if (!response.data) {
      throw new Error('Invalid response format from server');
    }

    return {
      created: response.data.created,
      updated: response.data.updated,
      skipped: response.data.skipped,
      noChangeSkipped: response.data.noChangeSkipped,
      createdClients: response.data.createdClients
    };
  } catch (error) {
    console.error('Error in loadCitsClientData:', error);
    throw error; // Re-throw the error to be caught by the client
  }
}