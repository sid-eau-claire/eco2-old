import { strapiFetch } from "@/lib/strapi";

export const getProfiles = async () => {
  const endpoint = 'profiles';
  const options = {
    cache: 'no-cache',
  };
  let allProfiles: any[] = [];
  let page = 1;
  let pageCount = 0;
  do {
    const param = `?populate[profileImage]=*&populate[rankId][fields][0]=name&populate[rankId][fields][1]=rankValue` 
                + `&pagination[page]=${page}&pagination[pageSize]=100`
                + `&populate[administrative][fields][0]=deactivate`
                + `&populate[administrative][fields][1]=blockLogin`
                + `&populate[administrative][fields][2]=blockCommission`
                + `&populate[subscriptionSetting][populate][planId][fields][1]=name`
                + `&populate[licenseContracting][fields][0]=subscriberStatus`
                + `&populate[licenseContracting][fields][1]=contracted`
                + `&populate[licenseContracting][fields][2]=dateContracted`
                + `&populate[licenseContracting][fields][3]=contractTerminateAt`
    const response = await strapiFetch({ method: 'GET', endpoint, param, normalize: true, options });
    allProfiles = allProfiles.concat(response.data);
    pageCount = response.meta.pagination.pageCount;
    page++;
  } while (page <= pageCount);
  // console.log(JSON.stringify(allFeeTypes));
  return allProfiles;
};
