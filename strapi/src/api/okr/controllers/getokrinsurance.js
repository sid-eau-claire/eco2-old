'use strict';
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async getokrinsurance(ctx) {
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
    const noCoreApp = targets.reduce((acc, target) => acc + (target.noCoreApp || 0), 0);
    const coreMPE = targets.reduce((acc, target) => acc + (target.coreMPE || 0), 0);

    // Part I: Direct cases
    const directCases = await strapi.entityService.findMany('api::newcase.newcase', {
      filters: {
        writingAgentId: agentId,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        splitAgents: {
          $null: true  // This checks for cases where the splitAgents array is empty
        },
        caseType: 'Insurance'
      },
      populate: ['splitAgents']  // Make sure to populate this to access in Part II
    });
    // JLOG(directCases);  // Log the direct cases for debugging
    // Part II: Split cases
    const allCases = await strapi.entityService.findMany('api::newcase.newcase', {
      filters: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        caseType: 'Insurance'
      },
      // populate: ['splitAgents']
      populate: {
        splitAgents: {
          populate: {
            profileId: {
              fields: ['id']
            }
          }
        }
      }
    });
    // JLOG(agentId)
    // JLOG(allCases);  // Log all cases for debugging
    const splitCases = allCases.filter(nc => nc.splitAgents.some(sa => sa.profileId.id == agentId));
    // Calculate the total effective number of cases by loop thro' splitCases and then sumation of all splitingPercentage
    let effectiveNumberOfCases = 0;
    splitCases.forEach(caseItem => {
      const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
      if (splitAgent) {
        effectiveNumberOfCases += splitAgent.splitingPercentage / 100;
      }
    });
    // JLOG(splitCases);  // Log the split cases for debugging 
    // Aggregate results
    const result = {
      numberOfCases: directCases.length + effectiveNumberOfCases,
      totalEstFieldRevenue: 0,
      totalAnnualPremium: 0,
      totalCoverageFaceAmount: 0,
      noCoreApp,  // Append aggregated noCoreApp from targets for the month
      coreMPE,    // Append aggregated coreMPE from targets for the month
      cases: []
    };

    // Calculate totals for direct cases
    directCases.forEach(caseItem => {
      result.totalEstFieldRevenue += caseItem.totalEstFieldRevenue;
      if (caseItem?.monthlyBillingPremium && caseItem?.monthlyBillingPremium > 0) {
        result.totalAnnualPremium += caseItem.monthlyBillingPremium * 12;
      } else {
        result.totalAnnualPremium += caseItem.totalAnnualPremium;
      }
      result.totalCoverageFaceAmount += caseItem.totalCoverageFaceAmount;
      result.cases.push(caseItem.id);
    });

    // Calculate totals for split cases
    splitCases.forEach(caseItem => {
      // JLOG(caseItem)
      const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
      if (splitAgent) {
        const splitPercentage = splitAgent.splitingPercentage / 100;
        result.totalEstFieldRevenue += caseItem.totalEstFieldRevenue * splitPercentage;
        if (caseItem?.monthlyBillingPremium && caseItem?.monthlyBillingPremium > 0) {
          result.totalAnnualPremium += caseItem.monthlyBillingPremium * 12 * splitPercentage;
        } else {
          result.totalAnnualPremium += caseItem.totalAnnualPremium * splitPercentage;
        }
        result.totalCoverageFaceAmount += caseItem.totalCoverageFaceAmount * splitPercentage;
      }
      result.cases.push(caseItem.id);
    });

    // JLOG(result);  // Log the final result for debugging
    return {'data': [result], meta: { count: 1 }};
  }
};
