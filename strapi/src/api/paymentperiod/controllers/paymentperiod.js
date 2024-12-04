'use strict';


const { sanitizeEntity } = require('@strapi/utils').sanitize;
const { createCoreController } = require('@strapi/strapi').factories;
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = createCoreController('api::paymentperiod.paymentperiod', ({ strapi }) =>  ({
  async createAdvisorPaymentMonthlyMetric(ctx) {
    const { yearMonth } = ctx.request.body.data;
    if (!yearMonth || !/^\d{6}$/.test(yearMonth)) {
      return ctx.badRequest('Year month value is missing or in incorrect format (YYYYMM)');
    }
    try {
      const result = await strapi.service('api::paymentperiod.advisorpayhistory').createAdvisorPaymentMonthlyMetric(yearMonth);
      ctx.send(result);
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },
  async getAdvisorPayHistory(ctx) {
    const profileId = ctx.query.profileId;
    if (!profileId) {
      return ctx.badRequest('Profile ID is missing');
    }

    try {
      const result = await strapi.service('api::paymentperiod.advisorpayhistory').getAdvisorPayHistory(profileId);
      ctx.send(result);
    } catch (err) {
      ctx.throw(500, err.message);
    }
  },
  async getAdvisorPaymentPeriods(ctx) {
    const profileId = ctx.query.profileId;
    const startDate = ctx.query.startDate;
    const endDate = ctx.query.endDate;
    if (!profileId) {
      return ctx.badRequest('Profile ID is required');
    }

    try {
      JLOG({ profileId, startDate, endDate }); // Detailed logging of inputs
      const service = strapi.service('api::paymentperiod.advisorpaymentperiod');
      if (!service) {
        strapi.log.error('Service not found');
        throw new Error('Service not found');
      }
      const result = await service.getAdvisorPaymentPeriods(profileId, startDate, endDate, ctx.query);
      const sanitizedEntities = await this.sanitizeOutput(result.data, ctx);
      return {
        data: sanitizedEntities,
        meta: result.meta,
      };
    } catch (err) {
      strapi.log.error('getPayment error:', err);
      return ctx.internalServerError('Internal Server Error', { error: err.message });
    }
  },
  async getAdvisorDataForPromotions(ctx) {
    // return { message: 'Not implemented'}
    const profileId = ctx.query.profileId
    if (!profileId) {
      return ctx.badRequest('Profile ID is required');
    }    

    try {
      const data = await strapi.service('api::paymentperiod.advisorpaymentperiod').getAdvisorDataForPromotions(profileId);
      ctx.send(data);
    } catch (error) {
      ctx.throw(400, error.message);
    }
  },  
}));

