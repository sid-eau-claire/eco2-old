'use strict';
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async getokrsettledrevenue(ctx) {
    const { agentId, startDate, endDate } = ctx.query;

    // Validate input
    if (!agentId || !startDate || !endDate) {
      return ctx.badRequest('Missing required parameters');
    }
    
    // Calculate the relevant month and year from startDate
    const startMonth = new Date(startDate).getMonth() + 1; // getMonth() is zero-based
    const currentYear = new Date(startDate).getFullYear();

    // Fetch the targets for the advisor for the specific month and year
    const targets = await strapi.entityService.findMany('api::advisortarget.advisortarget', {
      filters: {
        profileId: agentId,
        year: currentYear,
        month: startMonth
      }
    });

    // Aggregate target data
    const noSettledRevenue = targets.reduce((acc, target) => acc + (target.noSettledRevenue || 0), 0);
    const settledRevenue = targets.reduce((acc, target) => acc + (target.settledRevenue || 0), 0);   

    // Part I: Direct cases
    const directCases = await strapi.entityService.findMany('api::newcase.newcase', {
      filters: {
        writingAgentId: agentId,
        settledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        status: 'Paid Settled',
        splitAgents: {
          $null: true  // This checks for cases where the splitAgents array is empty
        },
      },
      populate: ['splitAgents']  // Make sure to populate this to access in Part II
    });

    // Part II: Split cases
    const allCases = await strapi.entityService.findMany('api::newcase.newcase', {
      filters: {
        settledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        status: 'Paid Settled',        
      },
      populate: {
        splitAgents: {
          populate: {
            profileId: {
              select: ['id']
            }
          }
        }
      }
    });
    const splitCases = allCases.filter(nc => nc.splitAgents.some(sa => sa.profileId.id == agentId));
    // Calculate the total effective number of cases by loop thro' splitCases and then sumation of all splitingPercentage
    let effectiveNumberOfCases = 0;
    splitCases.forEach(caseItem => {
      const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
      if (splitAgent) {
        effectiveNumberOfCases += splitAgent.splitingPercentage / 100;
      }
    });
    
    // Aggregate results
    const result = {
      actualNoSettledRevenue: directCases.length + effectiveNumberOfCases,
      actualSettledRevenue: 0,
      noSettledRevenue,  // Append aggregated noCoreApp from targets for the month
      settledRevenue,    // Append aggregated coreMPE from targets for the month
      settledRevenueCases: []
    };

    // Calculate totals for direct cases
    directCases.forEach(caseItem => {
      result.actualSettledRevenue += caseItem.totalEstFieldRevenue;
      result.settledRevenueCases.push(caseItem.id);
    });

    // Calculate totals for split cases
    splitCases.forEach(caseItem => {
      const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
      if (splitAgent) {
        const splitPercentage = splitAgent.splitingPercentage / 100;
        result.actualSettledRevenue += caseItem.totalEstFieldRevenue * splitPercentage;
      }
      result.settledRevenueCases.push(caseItem.id);
    });
    JLOG(result);  // Log the final result for debugging
    return {'data': [result], meta: { count: 1 }};
  }
};
