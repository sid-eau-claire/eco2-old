// path: src/api/passwordresettoken/routes/custom-passwordresettoken.js

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/passwordresettokens/create',
      handler: 'passwordresettoken.createResetToken',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/passwordresettokens/reset',
      handler: 'passwordresettoken.resetPassword',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};