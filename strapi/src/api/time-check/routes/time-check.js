// File: api/time-check/routes/time-check.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/time-check',
      handler: 'time-check.index',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};