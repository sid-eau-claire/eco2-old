'use server'
import {normalize} from '@/lib/format'
import {isMe, canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { strapiFetch } from '@/lib/strapi';

// export const getCarrier = async (carrier: string) => {
//   try {
//     const url = `${process.env.STRAPI_BACKEND_URL}/api/carriers?fields=id&fields=carrierName&filters[carrierName]=${carrier}`;
//     console.log(url)
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
//       },
//       next: {revalidate: 60, tags: ['carriers']}
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const json = await response.json();
//     const data = await normalize(json);
//     // console.log(data[0])
//     return data[0];
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

export const getCarrier = async (carrier: string) => {
  const method = 'GET';
  const endpoint = 'carriers';
  const param = `?fields=id&fields=carrierName&filters[carrierName]=${encodeURIComponent(carrier)}`;
  const normalize = true;
  const options = {'cache': 'no-cache' };

  const { data, status, errorMessage } = await strapiFetch({
    method,
    endpoint,
    param,
    normalize,
    options
  });
  if (status !== 200) {
    console.error(`HTTP error! status: ${status}`, errorMessage);
    return null;
  }
  return data[0];
};

// export const getCarriers = async () => {
//   const endpoint = 'carriers';
//   const param = '?fields=id&fields=carrierName&sort=order:asc';
//   const options = {
//     next: { revalidate: 60, tags: ['carriers'] } // Assuming you have middleware to handle these
//   };
//   const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
//   return response.data;
// };


export const getCarriers = async () => {
  const endpoint = 'carriers';
  const filters = 'filters[deactivatedAt][$null]=true';
  const fields = 'fields=id&fields=carrierName';
  // const sort = 'sort=order:asc';
  const sort = 'sort=carrierName:asc';
  let allCarriers: any[]  = [];
  let page = 1;
  let totalCount = 0;

  do {
    const param = `?${filters}&${fields}&${sort}&pagination[page]=${page}&pagination[pageSize]=25`;
    const options = {
      'cache': 'no-cache',
    };
    const response = await strapiFetch({
      method: 'GET',
      endpoint,
      param,
      normalize: true,
      options
    });
    if (response.data) {
      allCarriers = allCarriers.concat(response.data);
      totalCount = response.meta.pagination.pageCount; // Assuming the API provides total pages info
    }
    page++;
  } while (page <= totalCount);
  return allCarriers;
};


function convertProfilesToFormattedArray(profiles: any[]) {
  return profiles.map(profile => ({
    name: `${profile?.firstName?.trim().toUpperCase()} ${profile?.lastName?.trim().toUpperCase()}`,
    id: profile.id
  }));
}

// export const getAdvisorNameList = async () => {
//   let records: any[] = [];
//   let start = 0;
//   const limit = 100; // Fetch in batches of 100
//   if (!await isMe(['Superuser'])) {
//     redirect('/dashboard');
//   }
//   try {
//     while (true) {
//       const url = `${process.env.STRAPI_BACKEND_URL}/api/profiles?fields=id&fields=firstName&fields=lastName&pagination[start]=${start}&pagination[limit]=${limit}`;
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
//         },
//         next: {revalidate: 60, tags: ['profiles']}
//       });
//       const json = await response.json();

//       records = records.concat(json.data);

//       // Check if we've fetched all records
//       if (json.data.length < limit) {
//         break;
//       }

//       start += limit; // Prepare the start for the next batch
//     }
//     // console.log(records)
//     const profiles = await normalize(records);
//     // console.log(profiles)
//     // console.log(convertProfilesToFormattedArray(profiles))
//     return convertProfilesToFormattedArray(profiles);
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

// export const getAdvisorNameList = async () => {
//   const endpoint = 'profiles/advisorlist';
//   const param = '';
//   const options = {
//     method: 'GET',
//     next: { revalidate: 60, tags: ['profiles'] } // Assuming you have middleware to handle these
//   };
//   const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: false, options });
//   console.log(response)
//   return response.data;
// };

export const getAdvisorNameList = async () => {
  try {
    const responses = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/profiles/advisorlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
      },
      next: {revalidate: 60, tags: ['profiles']}
    });
    const responseData = await responses.json();
    return responseData;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const getAccountsWithNegativeBalance = async () => {
  const endpoint = 'accounts';
  const sort = 'sort=balance:desc';
  const filterParam = 'filters[balance][$lt]=0&filters[balance][$notNull]=true';
  const populateParam = 'populate=profileId'; // Populating the related profileId

  let allAccounts: any[] = [];
  let page = 1;
  let totalCount = 0;

  do {
    const param = `?${filterParam}&${sort}&${populateParam}&pagination[page]=${page}&pagination[pageSize]=25`;
    const options = {
      'cache': 'no-cache',
    };
    const response = await strapiFetch({
      method: 'GET',
      endpoint,
      param,
      normalize: true,
      options,
    });
    if (response.data) {
      allAccounts = allAccounts.concat(response.data);
      totalCount = response.meta.pagination.pageCount; // Assuming the API provides total pages info
    }
    page++;
  } while (page <= totalCount);

  // Extract profile firstName and lastName for each account
  const accountsWithProfiles = allAccounts.map(account => {
    const profile = account.profileId;
    if (profile) {
      account.firstName = profile.firstName;
      account.lastName = profile.lastName;
    }
    return account;
  });

  return accountsWithProfiles;
};

export const getAccountsWithPositiveEscrowBalance = async () => {
  const endpoint = 'accounts';
  const sort = 'sort=hold:desc';
  const filterParam = 'filters[hold][$gt]=0&filters[hold][$notNull]=true';
  const populateParam = 'populate=profileId'; // Populating the related profileId

  let allAccounts: any[] = [];
  let page = 1;
  let totalCount = 0;

  do {
    const param = `?${filterParam}&${sort}&${populateParam}&pagination[page]=${page}&pagination[pageSize]=25`;
    const options = {
      'cache': 'no-cache',
    };
    const response = await strapiFetch({
      method: 'GET',
      endpoint,
      param,
      normalize: true,
      options,
    });
    if (response.data) {
      allAccounts = allAccounts.concat(response.data);
      totalCount = response.meta.pagination.pageCount; // Assuming the API provides total pages info
    }
    page++;
  } while (page <= totalCount);

  // Extract profile firstName and lastName for each account
  const accountsWithProfiles = allAccounts.map(account => {
    const profile = account.profileId;
    if (profile) {
      account.firstName = profile.firstName;
      account.lastName = profile.lastName;
    }
    return account;
  });

  return accountsWithProfiles;
};


export const getAccountsWithPositiveEscrow = async () => {
  const endpoint = 'accounts';
  const sort = 'sort=hold:desc';
  const filterParam = 'filters[hold][$gt]=0&filters[hold][$notNull]=true';

  let allAccounts: any[]  = [];
  let page = 1;
  let totalCount = 0;

  do {
    const param = `?${filterParam}&${sort}&pagination[page]=${page}&pagination[pageSize]=25`;
    const options = {
      'cache': 'no-cache',
    };
    const response = await strapiFetch({
      method: 'GET',
      endpoint,
      param,
      normalize: true,
      options
    });
    if (response.data) {
      allAccounts = allAccounts.concat(response.data);
      totalCount = response.meta.pagination.pageCount; // Assuming the API provides total pages info
    }
    page++;
  } while (page <= totalCount);
  return allAccounts;
};
