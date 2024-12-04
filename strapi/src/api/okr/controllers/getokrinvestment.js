'use strict';
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async getokrinvestment(ctx) {
    const { agentId, startDate, endDate } = ctx.query;

    // Validate input
    if (!agentId || !startDate || !endDate) {
      return ctx.badRequest('Missing required parameters');
    }

    try {
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

      // Aggregate target data for investments
      const noInvestmentApp = targets.reduce((acc, target) => acc + (target.noInvestmentApp || 0), 0);
      const investmentAUM = targets.reduce((acc, target) => acc + (target.investmentAUM || 0), 0);

      // Part I: Direct investments
      const directInvestments = await strapi.entityService.findMany('api::newcase.newcase', {
        filters: {
          writingAgentId: agentId,
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          splitAgents: {
            $null: true  // This checks for cases where there are no split agents
          },
          caseType: 'Investment'
        },
        populate: ['categoryId', 'feeTypeId']
      });
      
      // Part II: Split investments
      const allInvestments = await strapi.entityService.findMany('api::newcase.newcase', {
        filters: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          caseType: 'Investment'
        },
        populate: {
          splitAgents: {
            populate: {
              profileId: {
                select: ['id']
              }
            }
          },
          categoryId: {
            select: ['id']
          },
          feeTypeId: {
            select: ['id']
          }
        }
        // populate: ['splitAgents', 'categoryId', 'feeTypeId']
      });
      const splitInvestments = allInvestments.filter(inv => inv.splitAgents.some(sa => sa.profileId.id == agentId));
      let effectiveNumberOfCases = 0;
      splitInvestments.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          effectiveNumberOfCases += splitAgent.splitingPercentage / 100;
        }
      });
      
      // Aggregate results
      const result = {
        numberOfInvestments: directInvestments.length + effectiveNumberOfCases,
        // totalLumpSumDeposit: 0,
        // totalRecurringDeposit: 0,
        totalEstFieldRevenue: 0,
        totalAnnualAUM: 0,
        noInvestmentApp,  // Appended from target data
        investmentAUM,    // Appended from target data
        investments: []
      };

      // Calculate totals for direct investments
      // result.totalLumpSumDeposit += inv.lumpSumDeposit || 0;
      // result.totalRecurringDeposit += inv.reccuringDeposit || 0;
      directInvestments.forEach(inv => {
        result.totalAnnualAUM += inv.totalAnnualAUM || 0;
        result.totalEstFieldRevenue += inv.totalEstFieldRevenue;
        result.investments.push(inv.id);
      });

      // Calculate totals for split investments
      splitInvestments.forEach(inv => {
        const splitAgent = inv.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          const splitPercentage = splitAgent.splitingPercentage / 100;
          // result.totalLumpSumDeposit += (inv.lumpSumDeposit || 0) * splitPercentage;
          // result.totalRecurringDeposit += (inv.reccuringDeposit || 0) * splitPercentage;
          result.totalAnnualAUM += (inv.totalAnnualAUM || 0) * splitPercentage;
          result.totalEstFieldRevenue += (inv.totalEstFieldRevenue || 0) * splitPercentage;
        }
        result.investments.push(inv.id);
      });

      JLOG(result);  // Log the final result for debugging
      return {'data': [result], meta: { count: 1 }};
    } catch (error) {
      strapi.log.error('Error in getokrinvestment:', error);
      return ctx.internalServerError('Internal Server Error');
    }
  }
};
