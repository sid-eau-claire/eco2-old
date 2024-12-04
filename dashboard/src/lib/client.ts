import { normalize } from '@/lib/format';
export function getStrapiURL() {
  return process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
}

export function getStrapiMedia(url: string | null) {
  if (url == null) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${getStrapiURL()}${url}`;
}

export const strapiFetch = async ({method, endpoint, param, noramlize, options} : {method: string, endpoint: string, param: string, noramlize: boolean, options: any}) => {
  try {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      },
    }
    console.log('start')
    console.log(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}/${param}`)
    console.log('end')
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/${endpoint}/${param}`, 
      {...defaultOptions, ...options}
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (noramlize) {
      const data = await response.json();
      return normalize(data);
    } else {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return {error: error}
  }
}