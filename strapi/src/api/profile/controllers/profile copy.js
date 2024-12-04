'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { sanitize } = require('@strapi/utils');

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));
module.exports = createCoreController('api::profile.profile', {
  async create(ctx) {
    let entity;
    const knex = strapi.db.connection;
    // Start a transaction
    await knex.transaction(async trx => {
      try {
        // Use the core services to create a profile
        entity = await strapi.entityService.create('api::profile.profile', {
          data: ctx.request.body,
          populate: ['currentAccount', 'escrowAccount'], // Make sure to populate these fields
        }, { trx });

        // Create the current account
        const currentAccount = await strapi.entityService.create('api::account.account', {
          data: {
            name: 'Current Account for ' + entity.id,
            type: 'operational', // or other default value
          },
        }, { trx });

        // Create the escrow account
        const escrowAccount = await strapi.entityService.create('api::account.account', {
          data: {
            name: 'Escrow Account for ' + entity.id,
            type: 'escrow', // or other default value
          },
        }, { trx });

        // Update the profile with related account ids
        entity = await strapi.entityService.update('api::profile.profile', entity.id, {
          data: {
            currentAccountId: currentAccount.id,
            escrowAccountId: escrowAccount.id,
          },
          populate: ['currentAccount', 'escrowAccount'],
        }, { trx });

      } catch (error) {
        trx.rollback();
        throw error; // Transaction rollback and throw to be caught by Strapi's error handler
      }
    });
    return this.transformResponse(entity);
  },
  async linkAccounts(ctx) {
    const knex = strapi.db.connection;

    await knex.transaction(async trx => {
      try {
        // Fetch profiles that do not have linked accounts
        const profiles = await strapi.entityService.findMany('api::profile.profile', {
          filters: { currentAccountId: null, escrowAccountId: null },
          limit: -1, // You might want to remove or adjust the limit for large datasets
        }, { trx }); // Pass transaction object to adhere to the transaction

        for (const profile of profiles) {
          const { id } = profile;
          // Create current account
          const currentAccount = await strapi.entityService.create('api::account.account', {
            data: {
              name: `Current Account for ${id}`,
              type: 'operational',
            }
          }, { trx });

          // Create escrow account
          const escrowAccount = await strapi.entityService.create('api::account.account', {
            data: {
              name: `Escrow Account for ${id}`,
              type: 'escrow',
            }
          }, { trx });

          // Link accounts to the profile
          await strapi.entityService.update('api::profile.profile', id, {
            data: {
              currentAccountId: currentAccount.id,
              escrowAccountId: escrowAccount.id,
            },
          }, { trx });
        }

        // If everything goes well, send a success response
        ctx.send({ message: 'Accounts linked successfully' });

      } catch (error) {
        // Handle errors, possibly log them and send a failure response
        ctx.throw(400, 'Failed to link accounts', { error });
      }
    });
  },
  async createMyProfile(ctx) {
    console.log(ctx.request.body)
    const user = ctx.state.user;
    // Check if the user already has a profile
    const existingProfile = await strapi.entityService.findMany('api::profile.profile', {
      filters: { owner: user.id },
    });
    
    if (existingProfile.length > 0) {
      // If profile exists, update it
      
      // console.log(ctx.request.body)
      const profileId = existingProfile[0].id;
      const updatedProfile = await strapi.entityService.update('api::profile.profile', profileId, {
        data: {
          owner: user.id,
          ...ctx.request.body.data
          // Other profile data
        },
      });
      return updatedProfile;
    } else {
      // If profile does not exist, create a new one
      const newProfile = await super.create(ctx);
      const updatedProfile = await strapi.entityService.update('api::profile.profile', newProfile.data.id, {
        data: {
          owner: user.id,
          ...ctx.request.body.data
          // Other profile data
        },
      });
      return updatedProfile;
    }
  },
  

  // async updateMyProfile(ctx) {
  //   const user = ctx.state.user;
  //   const existingProfile = await strapi.entityService.findMany('api::profile.profile', {
  //     filters: { owner: user.id },
  //   });
  //   if (existingProfile.length > 0) {
  //     const profileId = existingProfile[0].id;
  //     const requestToken = ctx.request.url.split('/')
  //     const requestTokenId = requestToken[requestToken.length - 1]
  //     console.log(ctx.request.url)
  //     if (requestTokenId ==  profileId) {
  //       console.log('find the profile for user to update')
  //       return super.update(ctx, profileId)
  //     }
  //   }
  //   return ''
  // },
  async updateMyProfile(ctx) {
    const requestToken = ctx.request.url.split('/');
    const requestTokenId = requestToken[requestToken.length - 1];
    const existingProfile = await strapi.entityService.findMany('api::profile.profile', {
      filters: { owner: requestTokenId },
      populate: ['profileImage'], // Populate the profile image relation to access it
    });
    JLOG(existingProfile)
    if (existingProfile.length > 0) {
      const profileId = existingProfile[0].id;
      const profileImageId = existingProfile[0].profileImage?.id;
      if (requestTokenId == profileId) {
        strapi.log.debug('Find the profile for user to update');
        // Check if the profile image exists and remove it
        if (profileImageId) {
          strapi.log.debug('Removing existing profile image with id:', profileImageId);
          await strapi.entityService.delete('plugin::upload.file', profileImageId);
        }
        return super.update(ctx, profileId);
      }
    }
    return '';
  },
  

  async findMyProfile(ctx) {
    const user = ctx.state.user;
    const existingProfile = await strapi.entityService.findMany('api::profile.profile', {
      filters: { owner: user.id },
    });
    const model = strapi.getModel('api::profile.profile');
    const sanitizedResult = await sanitize.contentAPI.output(existingProfile, model);

    // console.log('start')
    // console.log(existingProfile)
    // console.log('end')
    if (existingProfile.length == 1) {
      return this.transformResponse(sanitizedResult[0]);
    } else {
      return ''
    }
    // return super.find(ctx);

  },
  async advisorList(ctx) {
    try {
      // Directly using Strapi Entity Service if not using a custom service layer
      const data = await strapi.entityService.findMany('api::profile.profile', {
        fields: ['id', 'firstName', 'middleName', 'lastName', 'referralCode'], // Specify the fields you want
        filters: {}, // Add filters as needed
        sort: { firstName: 'ASC' }, // Sorting options
      });

      ctx.body = data.map(({ id, firstName, middleName, lastName, referralCode }) => ({
        id,
        firstName,
        middleName,
        lastName,
        referralCode
      }));
    } catch (err) {
      ctx.body = err;
    }
  },

});
