'use server'

import { strapiFetch } from '@/lib/strapi';
import { revalidateTag } from 'next/cache';
import { sendNotification } from '@/lib/strapi';
import { accessWithAuth } from '@/lib/isAuth';

interface TargetData {
  profileId: number;
  year: number;
  month: number;
  noCoreApp: number;
  coreMPE: number;
  noInvestmentApp: number;
  investmentAUM: number;
  noSettledRevenue: number;
  settleRevenue: number;
  noOfSubscription: number;
  noOfLicensed: number;
  status: string;
}

export const getTarget = async (profileId: string, year: number) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    cache: 'no-cache'
  };
  try {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: `advisortargets`,
      param: `?filters[profileId][$eq]=${profileId}&filters[year][$eq]=${year}&pagination[limit]=12`,
      normalize: false,
      options: options,
      header: headers
    });
    console.log(JSON.stringify(response));
    return response.data; // Adjust based on Strapi response structure
  } catch (error) {
    console.error('Error retrieving target data:', error);
    throw error; // Rethrow the error after logging it
  }
};

// export const updateTarget = async (targetId: number, targetData: any) => {
//   const headers = {
//     'Content-Type': 'application/json'
//   };
//   const options = {
//     next: { tags: ['advisortargets'] },
//     cache: 'no-cache'
//   };
//   console.log('targetData', targetData);
//   const response = await strapiFetch({
//     method: 'PUT',
//     endpoint: `advisortargets/${targetId}`,
//     param: '',
//     normalize: false,
//     options: options,
//     body: JSON.stringify({ data: targetData }),
//     header: headers
//   });
//   console.log(JSON.stringify(response));
//   revalidateTag('advisortargets');
//   return response;
// };

export const updateTarget = async (targetId: number, targetData: any) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['advisortargets'] },
    cache: 'no-cache'
  };

  try {
    console.log('targetData', targetData);
    const response = await strapiFetch({
      method: 'PUT',
      endpoint: `advisortargets/${targetId}`,
      param: '',
      normalize: false,
      options: options,
      body: JSON.stringify({ data: targetData }),
      header: headers
    });
    console.log(JSON.stringify(response));
    revalidateTag('advisortargets');

    // Send notification
    const session = await accessWithAuth();
    const fullName = session.user.data.profile.firstName + ' ' + session.user.data.profile.lastName;

    // Get the target details to include month and year in the notification
    const targetDetails = await strapiFetch({
      method: 'GET',
      endpoint: `advisortargets/${targetId}`,
      param: '?populate=MPProfileId',
      normalize: false,
      options: options,
      header: headers
    });

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const targetMonth = monthNames[targetDetails.data.attributes.month - 1];
    const targetYear = targetDetails.data.attributes.year;
    const MPAgentId = targetDetails.data.attributes.MPProfileId.data.id;

    let notificationTitle, notificationMessage;
    if (targetData.status === 'Approved') {
      notificationTitle = `Target Approved`;
      notificationMessage = `Your OKR target for ${targetMonth} ${targetYear} has been approved by ${fullName}.`;
    } else if (targetData.status === 'Reject') {
      notificationTitle = `Target Rejected`;
      notificationMessage = `Your OKR target for ${targetMonth} ${targetYear} has been rejected by ${fullName}. Please review and resubmit.`;
    } else {
      notificationTitle = `Target Updated`;
      notificationMessage = `The OKR target for ${targetMonth} ${targetYear} has been updated by ${fullName} and is waiting for approval.`;
    }

    await sendNotification({
      recipientIds: [MPAgentId],
      title: notificationTitle,
      message: notificationMessage,
      link: `/dashboard/mybusiness/performance/${MPAgentId}`
    });

    return response;
  } catch (error) {
    console.error('Error in updateTarget:', error);
    throw error;
  }
};

export const createTarget = async (targetData: TargetData) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['advisortargets'] },
    cache: 'no-cache'
  };
  try {
    // Find the Agency managing partner profile ID
    const response = await strapiFetch({
      method: 'GET',
      endpoint: `networks/agencynetwork`,
      param: `?profileId=${targetData.profileId}`,
      normalize: false,
      options: options,
      header: headers
    });
    const keys = Object.keys(response);
    const lastKey = keys[keys.length - 2]; // -2 to skip the "status" key
    const MPAgentId = response[lastKey].id;
    console.log('Agency network response:', MPAgentId);

    // Check if a record already exists
    const existingTargets = await getTarget(targetData.profileId.toString(), targetData.year);
    const existingTarget = existingTargets.find((target: any) => target.attributes.month === targetData.month);

    let result;
    if (existingTarget) {
      // If the record exists, update it
      console.log('Updating existing target');
      result = await updateTarget(existingTarget.id, {...targetData, status: 'Waiting for Approval'});
      console.log('Update response:', JSON.stringify(result));
    } else {
      // If the record doesn't exist, create a new one
      console.log('Creating new target');
      result = await strapiFetch({
        method: 'POST',
        endpoint: 'advisortargets',
        param: '',
        normalize: false,
        options: options,
        body: JSON.stringify({ data: {...targetData, status: 'Waiting for Approval', MPProfileId: MPAgentId} }),
        header: headers
      });
      console.log('Create response:', JSON.stringify(result));
      revalidateTag('advisortargets');
    }

    // Send notification to the advisor's manager
    const session = await accessWithAuth();
    // const currentProfileId = session.user.data.profile.id;
    const fullName = session.user.data.profile.firstName + ' ' + session.user.data.profile.lastName;  
    // convert targetData.month to month name
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const targetMonth = monthNames[targetData.month - 1];

    await sendNotification({
      recipientIds: [MPAgentId],
      title: `New Target Submitted for Approval`,
      message: `OKR target for ${targetMonth} ${targetData.year} has been submitted by ${fullName} and is waiting for your approval.`,
      // link: `/dashboard/targets/${targetData.profileId}`
      link: `/dashboard/mybusiness/performance/${MPAgentId}`
    });

    return result;
  } catch (error) {
    console.error('Error in createTarget:', error);
    throw error;
  }
};

export const deleteTarget = async (profileId: string, year: number, month: number) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    next: { tags: ['advisortargets'] },  // Adjust this tag based on your middleware setup
    cache: 'no-cache'
  };

  // Fetch the existing target ID to delete
  const response = await strapiFetch({
    method: 'GET',
    endpoint: `advisortargets`,
    param: `?filters[profileId][$eq]=${profileId}&filters[year][$eq]=${year}&filters[month][$eq]=${month}`,
    normalize: false,
    options: options,
    header: headers
  });

  const target = response.data && response.data.length ? response.data[0] : null;
  if (target) {
    const targetId = target.id;
    await strapiFetch({
      method: 'DELETE',
      endpoint: `advisortargets/${targetId}`,
      param: '',
      normalize: false,
      options: options,
      header: headers
    });
    revalidateTag('advisortargets');  // Ensure the cache is revalidated for this tag
  }
};


// export const targetForApproved = async () => {
//   const session = await accessWithAuth();
//   const profileId = await session?.user?.data?.profile?.id;
//   const headers = {
//     'Content-Type': 'application/json'
//   };
//   const options = {
//     cache: 'no-cache'
//   };
//   // console.log('profileId', profileId);
//   // Find all team members for agency network
//   const memberResponse = await strapiFetch({
//     method: 'GET',
//     endpoint: `networks/teamMembers`,
//     param: `?profileId=${profileId}`,
//     normalize: false,
//     options: options,
//     header: headers
//   });
//   return memberResponse;

// }


export const targetForApproved = async () => {
  const session = await accessWithAuth();
  const profileId = await session?.user?.data?.profile?.id;
  const headers = {
    'Content-Type': 'application/json'
  };
  const options = {
    cache: 'no-cache'
  };

  // Find all team members for agency network
  const memberResponse = await strapiFetch({
    method: 'GET',
    endpoint: `networks/teamMembers`,
    param: `?profileId=${profileId}`,
    normalize: false,
    options: options,
    header: headers
  });

  // Generate profileIdList array
  const profileIdList = memberResponse.path.map((member:any) => member.id);

  // Query advisorTarget records for all profileIds
  const advisorTargetResponse = await strapiFetch({
    method: 'GET',
    endpoint: 'advisortargets',
    param: `?populate[profileId]=id&populate[MPProfileId]=id&filters[MPProfileId][id]=${profileId}`,
    normalize: true,
    options: options,
    header: headers
  });
  const advisorTarget = advisorTargetResponse?.data;


  return { memberResponse, advisorTarget: advisorTarget };
};

export const approveTarget = async (targetId: number) => {
  const targetData = {
    status: 'Approved'
  };
  return updateTarget(targetId, targetData);
};

export const rejectTarget = async (targetId: number) => {
  const targetData = {
    status: 'Reject'
  };
  return updateTarget(targetId, targetData);
};
