'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = createCoreController('api::client.client', ({ strapi }) => ({
  async updateFromCits(ctx) {
    const { clientId, citsClientData } = ctx.request.body;

    if (!clientId || !citsClientData) {
      return ctx.badRequest('Client ID and CITS client data are required');
    }

    try {
      const result = await strapi.service('api::client.client').updateClientFromCits(
        clientId,
        citsClientData
      );
      
      ctx.body = result;
    } catch (error) {
      ctx.badRequest('Update from CITS failed', { moreDetails: error.message });
    }
  },

  // Keeping the existing merge function
  async merge(ctx) {
    const { consolidatedRecordId, recordIds, consolidatedRecord, author } = ctx.request.body.data;
    
    if (!author || !author.id) {
      return ctx.badRequest('Author information is missing or invalid');
    }
    
    try {
      const result = await strapi.service('api::client.client').mergeClients(
        consolidatedRecordId,
        recordIds,
        consolidatedRecord,
        author
      );
      
      ctx.body = result;
    } catch (error) {
      ctx.badRequest('Merging failed', { moreDetails: error.message });
    }
  },
}));