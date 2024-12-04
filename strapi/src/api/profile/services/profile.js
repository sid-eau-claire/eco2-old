'use strict';

/**
 * profile service
 */

const { createCoreService } = require('@strapi/strapi').factories;

// module.exports = createCoreService('api::profile.profile');


// module.exports = createCoreService('api::network.network', ({ strapi }) =>  ({
//   async findAdvisors() {
//     const entities = await strapi.entityService.findMany('api::profile.profile', {
//       fields: ['id', 'firstName', 'middleName', 'lastName'], // Specify the fields you want
//       filters: {}, // Add filters as needed
//       sort: { firstName: 'ASC' }, // Sorting options
//     });
//     return entities;
//   },

// }));
module.exports = createCoreService('api::profile.profile', ({ strapi }) => ({
  /**
   * Method to find advisor profiles with specific fields and sorting.
   * 
   * @returns The list of advisor profiles.
   */
  async findAdvisors() {
    const entities = await strapi.entityService.findMany('api::profile.profile', {
      fields: ['id', 'firstName', 'middleName', 'lastName'], // Specify the fields you want to retrieve
      filters: {}, // Add filters here if you want to filter the results
      sort: { firstName: 'ASC' }, // Sorting options
    });
    return entities;
  },
  
}));