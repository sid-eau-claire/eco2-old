'use server'

import { strapiFetch } from '@/lib/strapi';
import { canAccess } from '@/lib/isAuth';
import { redirect } from 'next/navigation';
import { fetchAdvisorPayHistory } from './payments';

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
}

interface PaymentHistory {
  careerEarnings: number;
  rolling3Months: number;
}

interface AdvancementData {
  profileId: number;
  firstName: string;
  lastName: string;
  careerEarnings: number;
  rolling3Months: number;
}

export const fetchRanks = async () => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({
    method: 'GET', 
    endpoint: 'ranks', 
    param: '', 
    normalize: true, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}

export const fetchTeamMembers = async (profileId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({
    method: 'GET', 
    endpoint: 'networks/teamMembers', 
    param: '?profileId=' + profileId, 
    normalize: false, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}




interface AdvancementData {
  profileId: number;
  firstName: string;
  lastName: string;
  careerEarnings: number;
  rolling3Months: number;
}

// export const fetchDataForAdvancement = async (profileId: string): Promise<AdvancementData> => {
//   if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
//     redirect('/dashboard/error');
//   }

//   try {
//     // Fetch payment history for the specified profileId
//     const payHistoryResponse = await fetchAdvisorPayHistory(profileId);
//     const payHistory = payHistoryResponse.data[0] || { careerEarnings: 0, rolling3Months: 0 };

//     // Fetch profile information (assuming there's a function to do this)
//     const profileInfo = await fetchProfileInfo(profileId);

//     // Compile the advancement data
//     const advancementData: AdvancementData = {
//       profileId: parseInt(profileId),
//       firstName: profileInfo.firstName,
//       lastName: profileInfo.lastName,
//       careerEarnings: payHistory.careerEarnings,
//       rolling3Months: payHistory.rolling3Months,
//     };

//     return advancementData;
//   } catch (error) {
//     console.error('Error in fetchDataForAdvancement:', error);
//     throw new Error('Failed to fetch advancement data');
//   }
// };

// // This function needs to be implemented to fetch profile information
// async function fetchProfileInfo(profileId: string) {
//   // Implementation depends on your API structure
//   // This is a placeholder
//   return {
//     firstName: 'John',
//     lastName: 'Doe'
//   };
// }

export const fetchPersonalContributionForPromotion = async (profileId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({
    method: 'GET', 
    endpoint: 'networks/personalContributionForPromotion', 
    param: '?profileId=' + profileId, 
    normalize: false, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}


export const fetchTeamContributionForPromotion = async (profileId: string) => {
  if (!await canAccess(['Superuser', 'Poweruser', 'Advisor'])) {
    redirect('/dashboard/error');
  }
  const response = await strapiFetch({
    method: 'GET', 
    endpoint: 'networks/teamContributionForPromotion', 
    param: '?profileId=' + profileId, 
    normalize: false, 
    options: {
      'cache': 'no-cache',
    } 
  });
  return response;
}


