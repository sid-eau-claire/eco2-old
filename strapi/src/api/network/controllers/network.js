'use strict';

/**
 * network controller
 */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::network.network');
// activeOnly will check the profile.licenseContracting.subscriberStatus?
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::network.network', ({ strapi }) =>  ({
  // Custom controller to find the hierarchy path
  async findPath(ctx) {
    try {
      const { parentId, childId } = ctx.query;
      
      // Ensure both parentId and childId are provided
      if (!parentId || !childId) {
        return ctx.badRequest('Missing parentId or childId');
      }

      // Call the custom service method to find the path
      const path = await strapi.service('api::network.network').findHierarchyPath(parentId, childId);

      // Respond with the path or a not found message
      ctx.body = path ? { path } : { message: 'Path not found' };
    } catch (error) {
      ctx.body = error;
    }
  },
  async isUnderManagement(ctx) {
    try {
      const { parentId, childId } = ctx.query;
      
      // Ensure both parentId and childId are provided
      if (!parentId || !childId) {
        return ctx.badRequest('Missing parentId or childId');
      }

      // Call the custom service method to find the path
      const result = await strapi.service('api::network.network').isUnderManagement(parentId, childId);
      // Respond with the path or a not found message
      ctx.body = result
    } catch (error) {
      ctx.body = error;
    }
  },  
  async lookupToTop(ctx) {
    try {
      const profileId = ctx.query.profileId; // Get profileId from query parameters
      if (!profileId) {
        return ctx.badRequest('Profile ID is required');
      }

      const result = await strapi.service('api::network.network').lookupToTop(profileId);

      ctx.body = result;
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError('An error occurred during the lookup');
    }
  },
  async lookupToTops(ctx) {
    try {
      const profileId = ctx.query.profileId;
      if (!profileId) {
        return ctx.badRequest('Profile ID is required');
      }
  
      const result = await strapi.service('api::network.network').lookupToTops(Number(profileId));
      ctx.body = result;
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError('An error occurred during the lookup');
    }
  },
  async teamMembers(ctx) {
    try {
      const profileId = ctx.query.profileId;
      if (!profileId) {
        return ctx.badRequest('Profile ID is required');
      }
  
      const result = await strapi.service('api::network.network').teamMembers(profileId);
      ctx.body = result;
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError('An error occurred during the lookup');
    }
  },  
  async lookDown(ctx) {
    try {
      // const profileId = ctx.query.profileId;
      const {profileId, activeOnly} = ctx.query;
      if (!profileId) {
        return ctx.badRequest('Profile ID is required');
      }
  
      const result = await strapi.service('api::network.network').lookDown(profileId, activeOnly);
      ctx.body = result;
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError('An error occurred during the lookup');
    }
  },
  async fetchNetworkGraph(ctx) {
    const { profileId, activeOnly } = ctx.query;
    // console.log('fetchNetworkGraph controller', profileId, activeOnly)
    // console.log(typeof(activeOnly))
    if (!profileId) {
      return ctx.badRequest('Profile ID is required');
    }
  
    try {
      const graphData = await strapi.service('api::network.network').fetchNetworkGraph(profileId, activeOnly);
      ctx.body = graphData;
    } catch (error) {
      ctx.body = error;
      ctx.internalServerError('An error occurred');
    }
  },
  async agencyNetwork(ctx) {
    // const { profileId } = ctx.query;
    const { profileId, activeOnly } = ctx.query;
  
    if (!profileId) {
      return ctx.badRequest('Profile ID is required');
    }
  
    try {
      const graphData = await strapi.service('api::network.network').agencyNetwork(profileId, activeOnly);
      ctx.body = graphData;
    } catch (error) {
      ctx.body = error;
      ctx.internalServerError('An error occurred');
    }
  },
  async generationNetwork(ctx) {
    // const { profileId } = ctx.query;
    const { profileId, activeOnly } = ctx.query;
  
    if (!profileId) {
      return ctx.badRequest('Profile ID is required');
    }
  
    try {
      const graphData = await strapi.service('api::network.network').generationNetwork(Number(profileId, activeOnly));
      ctx.body = graphData;
    } catch (error) {
      ctx.body = error;
      ctx.internalServerError('An error occurred');
    }
  },
  async teamContributionForPromotion(ctx) {
    try {
      // const profileId = ctx.query.profileId;
      const {profileId, activeOnly} = ctx.query;
      if (!profileId) {
        return ctx.badRequest('Profile ID is required');
      }
  
      const result = await strapi.service('api::network.network').teamContributionForPromotion(profileId, activeOnly);
      ctx.body = result;
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError('An error occurred during the lookup');
    }
  },
  async personalContributionForPromotion(ctx) {
    try {
      // const profileId = ctx.query.profileId;
      const {profileId, activeOnly} = ctx.query;
      if (!profileId) {
        return ctx.badRequest('Profile ID is required');
      }
  
      const result = await strapi.service('api::network.network').personalContributionForPromotion(profileId, activeOnly);
      ctx.body = result;
    } catch (err) {
      ctx.body = err;
      return ctx.internalServerError('An error occurred during the lookup');
    }
  },  
}));

