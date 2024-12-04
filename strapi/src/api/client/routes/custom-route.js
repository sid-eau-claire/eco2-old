'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/clients/merge-records',
      handler: 'client.merge',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/clients/updateClientFromCits',
      handler: 'client.updateFromCits',
      config: {
        policies: [],
        middlewares: [],
      },
    },    
  ],
};