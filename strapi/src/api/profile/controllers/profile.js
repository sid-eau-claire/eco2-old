'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { sanitize } = require('@strapi/utils');

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));
module.exports = createCoreController('api::profile.profile', {
  async create(ctx) {
    const knex = strapi.db.connection;
    let entity;

    // Start a transaction
    await knex.transaction(async trx => {
      try {
        // Use the super.create to create a profile within the transaction
        entity = await super.create(ctx, { transacting: trx });

        console.log('Profile created:', entity);

        // Ensure that the profile creation was successful
        const profileId = entity.data.id;
        if (!profileId) {
          throw new Error('Profile creation failed.');
        }

        // Create the current account within the same transaction
        const currentAccount = await strapi.entityService.create('api::account.account', {
          data: {
            name: 'Current Account for ' + profileId,
            type: 'advisor', // or other default value
          },
        }, { transacting: trx });

        console.log('Current Account created:', currentAccount);

        // Ensure that the account creation was successful
        if (!currentAccount || !currentAccount.id) {
          throw new Error('Current account creation failed.');
        }

        // Update the profile with related account id within the same transaction
        entity = await strapi.entityService.update('api::profile.profile', profileId, {
          data: {
            accountId: currentAccount.id,
          },
          // populate: ['currentAccount'],
        }, { transacting: trx });

        console.log('Profile updated with account ID:', entity);

        // Commit the transaction
        await trx.commit();

      } catch (error) {
        await trx.rollback();
        console.error('Transaction failed:', error);
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
          filters: { accountId: { $null: true } },
          limit: -1, // Adjust the limit for large datasets if necessary
        }, { transacting: trx });

        for (const profile of profiles) {
          const { id } = profile;

          // Create current account within the same transaction
          const currentAccount = await strapi.entityService.create('api::account.account', {
            data: {
              name: `Current Account for ${id}`,
              type: 'advisor',
              created_at: new Date(),
              updated_at: new Date(),
            },
          }, { transacting: trx });

          console.log('Current Account created for profile ID:', id, currentAccount);

          // Ensure the account creation was successful
          if (!currentAccount || !currentAccount.id) {
            throw new Error(`Current account creation failed for profile ID: ${id}`);
          }

          // Update the profile with the related account ID within the same transaction
          await strapi.entityService.update('api::profile.profile', id, {
            data: {
              accountId: currentAccount.id,
            },
          }, { transacting: trx });

          console.log('Profile updated with account ID for profile ID:', id);
        }

        // If everything goes well, commit the transaction and send a success response
        await trx.commit();
        ctx.send({ message: 'Accounts linked successfully' });

      } catch (error) {
        // Rollback the transaction in case of an error
        await trx.rollback();
        console.error('Transaction failed:', error);
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
