// path: src/extensions/users-permissions/strapi-server.js
module.exports = plugin => {
  const sanitizeOutput = (user) => {
    const {
      password, resetPasswordToken, confirmationToken, ...sanitizedUser
    } = user; // be careful, you need to omit other private attributes yourself
    return sanitizedUser;
  };

  plugin.controllers.user.me = async (ctx) => {
    console.log(ctx.state.user)
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      ctx.state.user.id,
      { populate: ['role', 'profile'] }
    );

    ctx.body = sanitizeOutput(user);
  };

  plugin.controllers.user.find = async (ctx) => {
    const users = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      { ...ctx.params, ...ctx.query, populate: ['role', 'profile'] }
    );

    ctx.body = users.map(user => sanitizeOutput(user));
  };

  // plugin.controllers.user.email = async (ctx) => {
  //   const users = await strapi.entityService.findMany(
  //     'plugin::users-permissions.user',
  //     // { ...ctx.params, populate: ['role', 'profile', 'invitations',  'inviteUser'] }
  //     ctx.query
  //   );
  //   ctx.body = users.map(user => sanitizeOutput(user));
  // };
  
  // plugin.routes['content-api'].routes.push({
  //   method: 'GET',
  //   path: '/user/email',
  //   handler: 'user.email',
  //   config: {
  //     prefix: '',
  //     policies: []
  //   }
  // })

  return plugin;
};