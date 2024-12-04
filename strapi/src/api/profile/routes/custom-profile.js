module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/myprofile',
      handler: 'profile.createMyProfile',
    },
    {
      method: 'GET',
      path: '/myprofile',
      handler: 'profile.findMyProfile', 
    },
    {
      method: 'PUT',
      path: '/myprofile/:id',
      handler: 'profile.updateMyProfile', 
    },
    {
      method: 'GET',
      path: '/profiles/advisorlist',
      handler: 'profile.advisorList',
    },
    {
      method: 'POST',
      path: '/profiles/linkaccounts',
      handler: 'profile.linkAccounts',
      config: {
        policies: [],
        middlewares: [],
      },
    }    
  ],
};
