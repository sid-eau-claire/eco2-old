'use server'

import { strapiFetch } from '@/lib/strapi';
import { accessWithAuth } from '@/lib/isAuth';

export const getNotifications = async (page: number = 1, pageSize: number = 10) => {
  const session = await accessWithAuth();
  
  if (!session?.user?.data?.id) {
    throw new Error('User not authenticated');
  }

  const endpoint = 'notifications';
  const header = {
    'Content-Type': 'application/json'
  };
  const option = {'cache': 'no-cache'};
  const queryParams = new URLSearchParams({
    'filters[profileId][id][$eq]': session.user.data.id,
    'sort': 'createdAt:desc',
    'populate': '*',
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString()
  });

  console.log('queryParams', queryParams.toString());
  console.log('endpoint', `${endpoint}?${queryParams.toString()}`);

  const response = await strapiFetch({
    method: 'GET',
    endpoint: `${endpoint}`,
    param: `?${queryParams.toString()}`,
    normalize: true,
    options: option,
    header: header
  });

  console.log('response', response);
  return response;
};

export const markNotificationsAsRead = async (notificationIds: number[]) => {
  try {
    const session = await accessWithAuth();
    
    if (!session?.user?.data?.id) {
      throw new Error('User not authenticated');
    }

    const endpoint = 'notifications';
    const header = {
      'Content-Type': 'application/json'
    };
    notificationIds.map(id => {
      const response = strapiFetch({
        method: 'PUT',
        endpoint: endpoint,
        param: `/${id}`,
        normalize: true,
        options: {
          body: JSON.stringify({
            'data': {
              'isRead': true
            }
          })
        },
        header: header
      });
    })
    return {};
  } catch (error) {
    console.error('Error in markNotificationsAsRead:', error);
    throw error;
  }
};