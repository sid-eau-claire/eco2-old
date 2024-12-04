'use strict';

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async getAdvisorPaymentPeriods(profileId, startDate, endDate, query) {
    const account = await strapi.db.query('api::account.account').findOne({
      where: { profileId },
      select: ['id'],
    });

    if (!account) {
      throw new Error('Account not found for the provided profileId');
    }

    const filters = { accountIds: account.id };

    if (startDate && endDate) {
      filters.payPeriodDate = { $gte: startDate, $lte: endDate };
    }

    const { page, pageSize, ...queryFilters } = query;
    const entities = await strapi.entityService.findPage('api::paymentperiod.paymentperiod', {
      filters: { ...filters, ...queryFilters },
      populate: {
        advisorRevenue: {
          populate: {
            FLAgentIds: true,
            TRXIds: {
              populate: {
                statementLog: {
                  populate: { logId: true },
                },
              },
            },
            accountId: true,
          },
        },
      },
      pagination: { page: page ? parseInt(page, 10) : 1, pageSize: pageSize ? parseInt(pageSize, 10) : 10 },
    });

    const processedEntities = entities.results.map(entity => {
      const matchingAdvisorRevenue = entity.advisorRevenue.find(revenue => revenue.accountId.id == account.id);

      if (matchingAdvisorRevenue) {
        entity.payment = {
          fieldRevenue: matchingAdvisorRevenue.fieldRevenue,
          teamFieldRevenue: matchingAdvisorRevenue.teamFieldRevenue,
          FLAgentIds: matchingAdvisorRevenue.FLAgentIds,
          TRXIds: matchingAdvisorRevenue.TRXIds,
        };
      } else {
        entity.payment = null;
      }

      delete entity.advisorRevenue;
      return entity;
    });

    return {
      data: processedEntities,
      meta: entities.pagination,
    };
  },
  async getAdvisorDataForPromotions(profileId) {
    // Fetch the account corresponding to the provided profileId
    const account = await strapi.db.query('api::account.account').findOne({
      where: { profileId },
      select: ['id'],
    });

    if (!account) {
      throw new Error('Account not found for the provided profileId');
    }

    // Fetch all payment periods for the account without filtering by date or query
    const entities = await strapi.entityService.findMany('api::paymentperiod.paymentperiod', {
      filters: { accountIds: account.id },
      populate: {
        advisorRevenue: {
          populate: {
            FLAgentIds: true,
            TRXIds: {
              populate: {
                statementLog: {
                  populate: { logId: true },
                },
              },
            },
            accountId: true,
          },
        },
      },
    });

    // Initialize result structure
    let fieldRevenue = 0;
    let teamFieldRevenue = 0;
    const teamMembers = new Map();

    entities.forEach(entity => {
      entity.advisorRevenue.forEach(revenue => {
        if (revenue.accountId.id === account.id) {
          fieldRevenue += parseFloat(revenue.fieldRevenue) || 0;
          teamFieldRevenue += parseFloat(revenue.teamFieldRevenue) || 0;
          
          revenue.FLAgentIds.forEach(agent => {
            const agentId = agent.id;

            // Check if agentId exists as one of the items in the advisorRevenue array
            const matchingRevenue = entity.advisorRevenue.find(r => r.accountId.id === agentId);

            if (matchingRevenue) {
              if (teamMembers.has(agentId)) {
                const member = teamMembers.get(agentId);
                member.fieldRevenue += parseFloat(matchingRevenue.fieldRevenue) || 0;
                member.teamFieldRevenue += parseFloat(matchingRevenue.teamFieldRevenue) || 0;
              } else {
                teamMembers.set(agentId, {
                  accountId: agentId,
                  profileId: agent.profileId,
                  // name: `${agent.profileId.firstName} ${agent.profileId.lastName}`,
                  fieldRevenue: parseFloat(matchingRevenue.fieldRevenue) || 0,
                  teamFieldRevenue: parseFloat(matchingRevenue.teamFieldRevenue) || 0,
                });
              }
            }
          });
        }
      });
    });

    return {
      fieldRevenue,
      teamFieldRevenue,
      teamMembers: Array.from(teamMembers.values()),
    };
  },
};
