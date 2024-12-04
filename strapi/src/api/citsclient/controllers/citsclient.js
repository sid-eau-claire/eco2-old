// File: ./src/api/citsclient/controllers/citsclient.js

'use strict';

/**
 * citsclient controller
 */
const { createCoreController } = require('@strapi/strapi').factories;
const customService = require('../services/citsclient-custom');

module.exports = createCoreController('api::citsclient.citsclient', ({ strapi }) => ({
  async createOrUpdateClient(ctx) {
    console.log('Entering createOrUpdateClient controller method');
    try {
      console.log('Calling process function from custom service');
      const result = await customService.process();
      console.log('Process function result:', result);

      ctx.body = {
        data: {
          created: result.created,
          updated: result.updated,
          createdClients: result.createdClients
        }
      };
      ctx.status = 200;
      console.log('Response sent successfully');
    } catch (err) {
      console.error('Error in createOrUpdateClient:', err);
      ctx.body = { 
        error: {
          message: err.message || 'An error occurred while processing clients',
          details: err.details || {}
        }
      };
      ctx.status = 500;
    }
  },
}));