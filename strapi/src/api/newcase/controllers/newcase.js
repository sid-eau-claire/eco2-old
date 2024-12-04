// 'use strict';

// /**
//  * newcase controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::newcase.newcase');
// const updateMonthlyMetric = require('../services/updateMonthlyMetric');
// const calculateMonthlyMetric = require('../services/updateMonthlyMetric');
'use strict';

const { updateMonthlyMetric, calculatePersonalMonthlyMetric, calculatePersonalYTDMetric, calculateTeamYTDMetric, } = require('../services/performance');


const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));
const { format, parseISO } = require('date-fns');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::newcase.newcase', ({ strapi }) => ({
  async create(ctx) {
    const { createdAt, updatedAt } = ctx.request.body.data || {};

    if (createdAt || updatedAt) {
      // Logic for handling createdAt and updatedAt (for migration)
      return strapi.db.transaction(async trx => {
        const { createdAt, updatedAt, ...restData } = ctx.request.body.data;
        ctx.request.body.data = restData;
        const response = await super.create(ctx, { transacting: trx });
        const { id } = response.data;

        await strapi.db.query('api::newcase.newcase').update({
          where: { id },
          data: {
            createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
            updatedAt: updatedAt ? new Date(updatedAt).toISOString() : undefined
          },
          transacting: trx
        });

        if (createdAt) response.data.attributes.createdAt = new Date(createdAt).toISOString();
        if (updatedAt) response.data.attributes.updatedAt = new Date(updatedAt).toISOString();
        return response;
      });
    } else {
      // Default logic for handling multi-file form data
      return strapi.db.transaction(async trx => {
        const response = await super.create(ctx, { transacting: trx });
        return response;
      });
    }
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { updatedAt } = ctx.request.body.data || {};

    if (updatedAt) {
      // Logic for handling updatedAt (for migration)
      return strapi.db.transaction(async trx => {
        const { updatedAt, ...restData } = ctx.request.body.data;
        ctx.request.body.data = restData;
        const response = await super.update(ctx, { transacting: trx });

        await strapi.db.query('api::newcase.newcase').update({
          where: { id },
          data: {
            updatedAt: updatedAt ? new Date(updatedAt).toISOString() : undefined
          },
          transacting: trx
        });

        if (updatedAt) response.data.attributes.updatedAt = new Date(updatedAt).toISOString();
        return response;
      });
    } else {
      // Default logic for handling multi-file form data
      const existingEntity = await strapi.entityService.findOne('api::newcase.newcase', id, {
        populate: { applicationDocuments: true, illustrationDocuments: true },
      });

      const response = await super.update(ctx);

      if ((ctx.request?.files?.applicationDocuments || ctx.request?.files?.illustrationDocuments) && 
          (existingEntity?.applicationDocuments || existingEntity?.illustrationDocuments)) {
        const filesToDelete = [
          ...(existingEntity.applicationDocuments || []),
          ...(existingEntity.illustrationDocuments || []),
        ];
        await Promise.all(filesToDelete.map(file => strapi.plugins['upload'].services.upload.remove(file)));
      }

      return response;
    }
  },
  async delete(ctx) {
    const { id } = ctx.params;
    
    // Find the entity to get the media fields before deletion
    const entity = await strapi.entityService.findOne('api::newcase.newcase', id, {
      populate: { applicationDocuments: true, illustrationDocuments: true }
    });
    // Delete associated media files if they exist
    const filesToDelete = [
      ...(entity.applicationDocuments || []),
      ...(entity.illustrationDocuments || []),
    ];
    await Promise.all(filesToDelete.map(file => strapi.plugins['upload'].services.upload.remove(file)));
    // Proceed with the deletion of the newcase itself
    const response = await super.delete(ctx);
    return response;
  },
  // Year end for In the Mill
  async createInTheMillHistory(ctx) {
    try {
      const { year } = ctx.request.body?.data;
      if (!year) {
        return ctx.badRequest('Year parameter is missing');
      }
  
      // Define the yearMonth value for December of the given year
      const yearMonth = parseInt(`${year}12`);
  
      // Define the statuses to filter 'newcases'
      const statuses = [
        'Pending Review', 
        'UW/Processing', 
        'UW/Approved', 
        'Pending Pay'
      ];
  
      // Retrieve all 'newcase' records with specified statuses
      const newcases = await strapi.entityService.findMany('api::newcase.newcase', {
        filters: { status: { $in: statuses } },
        populate: ['writingAgentId', 'splitAgents.profileId']
      });
  
      // Reduce the cases to summarize totalEstFieldRevenue per advisor
      const advisorSummary = newcases.reduce((acc, caseItem) => {
        const totalRevenue = parseFloat(caseItem.totalEstFieldRevenue) || 0;
  
        // Check if the writingAgentId is also in the splitAgents array
        const splitAgentIds = caseItem.splitAgents?.map(agent => agent.profileId.id) || [];
        const isWritingAgentAlsoSplitAgent = splitAgentIds.includes(caseItem.writingAgentId?.id);
  
        // Handle writing agent revenue if they are not also a split agent
        if (caseItem.writingAgentId && !isWritingAgentAlsoSplitAgent) {
          const advisorId = caseItem.writingAgentId.id;
          if (!acc[advisorId]) {
            acc[advisorId] = {
              count: 0,
              totalRevenue: 0
            };
          }
          acc[advisorId].count += 1;
          acc[advisorId].totalRevenue += totalRevenue;
        }
  
        // Handle split agents revenue
        if (caseItem.splitAgents) {
          caseItem.splitAgents.forEach(splitAgent => {
            const splitAdvisorId = splitAgent.profileId.id;
            const splitPercentage = parseFloat(splitAgent.splitingPercentage) / 100;
            const splitRevenue = totalRevenue * splitPercentage;
  
            if (!acc[splitAdvisorId]) {
              acc[splitAdvisorId] = {
                count: 0,
                totalRevenue: 0
              };
            }
            acc[splitAdvisorId].count += splitPercentage;
            acc[splitAdvisorId].totalRevenue += splitRevenue;
          });
        }
  
        return acc;
      }, {});
  
      // Write summarized data to 'monthly_metrics'
      for (const [profileId, data] of Object.entries(advisorSummary)) {
        // Check if a record already exists
        const existingRecord = await strapi.entityService.findMany('api::monthly-metric.monthly-metric', {
          filters: {
            profileId,
            yearMonth,
            metricName: 'inTheMillYearEnd'
          }
        });
  
        if (existingRecord.length > 0) {
          // Update existing record
          await strapi.entityService.update('api::monthly-metric.monthly-metric', existingRecord[0].id, {
            data: {
              metricValue: data.totalRevenue
            }
          });
        } else {
          // Create new record
          await strapi.entityService.create('api::monthly-metric.monthly-metric', {
            data: {
              profileId,
              yearMonth,
              metricName: 'inTheMillYearEnd',
              metricValue: data.totalRevenue
            }
          });
        }
      }
  
      // Return a success response
      ctx.body = { message: 'Year-end summary created successfully' };
    } catch (error) {
      // Handle possible errors
      ctx.internalServerError('An error occurred while creating the year-end summary.', { error });
    }
  },
  async calculatePersonalMonthlyMetric(ctx) {
    return strapi.db.transaction(async trx => {
      const profileId = ctx.request?.body?.data?.profileId;
      const yearMonth = ctx.request?.body?.data?.yearMonth;
      const response = await calculatePersonalMonthlyMetric(profileId, yearMonth?.toString(), { transacting: trx });
      return { data: [response], meta: {} };
    });
  },
  async calculatePersonalYTDMetric(ctx) {
    return strapi.db.transaction(async trx => {
      const profileId = ctx.request?.body?.data?.profileId;
      const yearMonth = ctx.request?.body?.data?.yearMonth;
      const response = await calculatePersonalYTDMetric(profileId, yearMonth?.toString(), { transacting: trx });
      return { data: [response], meta: {} };
    });
  },
  async calculateTeamYTDMetric(ctx) {
    // JLOG(ctx)
    // JLOG(ctx.request?.body?.data)
    return strapi.db.transaction(async trx => {
      const profileId = ctx.request?.body?.data?.profileId;
      const yearMonth = ctx.request?.body?.data?.yearMonth;
      const response = await calculateTeamYTDMetric(profileId, yearMonth?.toString(), { transacting: trx });
      return { data: [response], meta: {} };
    });
  }    
}));

