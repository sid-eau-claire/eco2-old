
'use server'
import { strapiFetch } from '@/lib/strapi';
import {accessWithAuth} from '@/lib/isAuth';

export const getComments = async (collectionType: string, id: string) => {
  // console.log('collectionType', collectionType);
  // console.log('id', id);
  const session = await accessWithAuth();
  console.log('session', session  )
  const endpoint =  `comments/api::${collectionType}.${collectionType}:${id}`
  const header = {
    'Content-Type': 'application/json'
  }
  const response =  await strapiFetch({
    method: 'GET',
    endpoint: endpoint,
    param: 'flat',
    normalize: false,
    options: {},
    header: header
  });
  // console.log('response', response);
  return response;
};

export const postComment = async (
  collectionType: string, 
  id: string, 
  commentData: { content: string, user: string, title?: string },
  link: string = '',
  notify: boolean = false,
  recipientIds: number[] = []
) => {
  // console.log('commentData', commentData);
  // console.log('collectionType', collectionType);
  // console.log('id', id);

  const session = await accessWithAuth();
  // console.log('session', session);
  const header = {
    'Content-Type': 'application/json'
  };
  const endpoint =  `comments/api::${collectionType}.${collectionType}:${id}`
  const body = {
    // data: {
      content: commentData.content,
      author: {
        id: session?.user?.data?.id,
        name: session?.user?.data?.username,
        email: session?.user?.data?.username,
      },
  };
  const options = {
    cache: 'no-cache'
  }
  const response = await strapiFetch({
    method: 'POST',
    endpoint: endpoint,
    param: '',
    normalize: false,
    options: options,
    body: JSON.stringify(body),
    header: header
  });
  if (notify) {
    const header = {
      'Content-Type': 'application/json'
    };
    const endpoint =  `notifications`
    const options = {cache: 'no-cache'}
    recipientIds.forEach(async (recipientId) => {
      const body = {
        data: {
          title: commentData?.title || 'New Comment',
          message: commentData.content,
          link: link,
          profileId: recipientId,
          read: false
        }
      };
      await strapiFetch({
        method: 'POST',
        endpoint: endpoint,
        param: '',
        normalize: false,
        options: options,
        body: JSON.stringify(body),
        header: header
      });
    })
  }
  return response;
};
