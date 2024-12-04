'use strict';
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async getokr(ctx) {
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

      // Aggregate target data
      const noCoreApp = targets.reduce((acc, target) => acc + (target.noCoreApp || 0), 0);
      const coreMPE = targets.reduce((acc, target) => acc + (target.coreMPE || 0), 0);
      const noInvestmentApp = targets.reduce((acc, target) => acc + (target.noInvestmentApp || 0), 0);
      const investmentAUM = targets.reduce((acc, target) => acc + (target.investmentAUM || 0), 0);
      const noSettledRevenue = targets.reduce((acc, target) => acc + (target.noSettledRevenue || 0), 0);
      const settledRevenue = targets.reduce((acc, target) => acc + (target.settledRevenue || 0), 0);
      const noOfLicensed = targets.reduce((acc, target) => acc + (target.noOfLicensed || 0), 0);
      const noOfSubscription = targets.reduce((acc, target) => acc + (target.noOfSubscription || 0), 0);
      const status = targets[0]?.status || 'Not Set';

      // Part II: Split cases for all types
      const allCases = await strapi.entityService.findMany('api::newcase.newcase', {
        filters: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
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

      // Use business cases data to find the insurance, investment, and settled OKR
      const insuranceCases = allCases.filter(nc => nc.caseType === 'Insurance' && nc.splitAgents.some(sa => sa.profileId.id == agentId));
      const investmentCases = allCases.filter(nc => nc.caseType === 'Investment' && nc.splitAgents.some(sa => sa.profileId.id == agentId));
      const settledRevenueCases = allCases.filter(nc => nc.status === 'Paid Settled' && nc.splitAgents.some(sa => sa.profileId.id == agentId));

      // Calculate the total effective number of cases
      let effectiveNumberOfInsuranceCases = 0;
      insuranceCases.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          effectiveNumberOfInsuranceCases += splitAgent.splitingPercentage / 100;
        }
      });

      let effectiveNumberOfInvestmentCases = 0;
      investmentCases.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          effectiveNumberOfInvestmentCases += splitAgent.splitingPercentage / 100;
        }
      });

      let effectiveNumberOfSettledRevenueCases = 0;
      settledRevenueCases.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          effectiveNumberOfSettledRevenueCases += splitAgent.splitingPercentage / 100;
        }
      });

      // Fetch team members data
      const teamMembers = await strapi.service('api::network.network').teamMembers(agentId);
      JLOG(teamMembers);  // Log the team members for debugging

      // Calculate team building metrics
      const totalLicensed = teamMembers?.path.filter(member => 
        member.contracted === true && 
        new Date(member.contractedAt) >= new Date(startDate) && 
        new Date(member.contractedAt) <= new Date(endDate)
      ).length;

      const totalSubscription = teamMembers?.path.filter(member => member.subscribedPlan !== null).length;

      // Aggregate results
      const result = {
        insurance: {
          numberOfCases: effectiveNumberOfInsuranceCases,
          totalEstFieldRevenue: 0,
          totalAnnualPremium: 0,
          totalCoverageFaceAmount: 0,
          noCoreApp,
          coreMPE,
          cases: []
        },
        investment: {
          numberOfCases: effectiveNumberOfInvestmentCases,
          totalEstFieldRevenue: 0,
          totalAnnualAUM: 0,
          noInvestmentApp,
          investmentAUM,
          cases: []
        },
        settledRevenue: {
          numberOfCases: effectiveNumberOfSettledRevenueCases,
          totalEstFieldRevenue: 0,
          noSettledRevenue,
          settledRevenue,
          cases: []
        },
        teamBuilding: {
          totalLicensed,
          totalSubscription,
          noOfLicensed,
          noOfSubscription,
          cases: []
        },
        status: status
      };

      // Calculate totals for split insurance cases
      insuranceCases.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          const splitPercentage = splitAgent.splitingPercentage / 100;
          result.insurance.totalEstFieldRevenue += caseItem.totalEstFieldRevenue * splitPercentage;
          if (caseItem?.monthlyBillingPremium && caseItem?.monthlyBillingPremium > 0) {
            result.insurance.totalAnnualPremium += caseItem.monthlyBillingPremium * 12 * splitPercentage;
          } else {
            result.insurance.totalAnnualPremium += caseItem.totalAnnualPremium * splitPercentage;
          }
          result.insurance.totalCoverageFaceAmount += caseItem.totalCoverageFaceAmount * splitPercentage;
          result.insurance.cases.push(caseItem.id);
        }
      });

      // Calculate totals for split investment cases
      investmentCases.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          const splitPercentage = splitAgent.splitingPercentage / 100;
          result.investment.totalEstFieldRevenue += caseItem.totalEstFieldRevenue * splitPercentage;
          result.investment.totalAnnualAUM += (caseItem.totalAnnualAUM || 0) * splitPercentage;
          result.investment.cases.push(caseItem.id);
        }
      });

      // Calculate totals for split settled revenue cases
      settledRevenueCases.forEach(caseItem => {
        const splitAgent = caseItem.splitAgents.find(agent => agent.profileId.id == agentId);
        if (splitAgent) {
          const splitPercentage = splitAgent.splitingPercentage / 100;
          result.settledRevenue.totalEstFieldRevenue += caseItem.totalEstFieldRevenue * splitPercentage;
          result.settledRevenue.cases.push(caseItem.id);
        }
      });

      // JLOG(result);  // Log the final result for debugging
      return { data: [result], meta: { count: 1 } };

    } catch (error) {
      strapi.log.error('Error in getokr:', error);
      return ctx.internalServerError('Internal Server Error');
    }
  }
};
