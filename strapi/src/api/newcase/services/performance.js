const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

const updateMonthlyMetric = async (id, { transacting }) => {
  const createdAt = new Date(); // Assuming createdAt is the current date for the metrics update
  const yearMonth = createdAt.getFullYear() * 100 + (createdAt.getMonth() + 1);

  const newCases = await strapi.entityService.findMany('api::newcase.newcase', {
    filters: {
      id: id,
      createdAt: {
        $gte: new Date(createdAt.getFullYear(), createdAt.getMonth(), 1),
        $lt: new Date(createdAt.getFullYear(), createdAt.getMonth() + 1, 1),
      },
    },
    transacting,
  });

  const totalNoOfCases = newCases.length;
  const totalEstFieldRevenue = newCases.reduce((total, newCase) => total + newCase.totalEstFieldRevenue, 0);

};

const fetchNewCases = async (profileId, startDate, endDate, { transacting }) => {
  const newCases = await strapi.db.query('api::newcase.newcase').findMany({
    where: {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    populate: {
      splitAgents: {
        populate: {
          profileId: {
            select: ['id']
          }
        }
      },
    },
    transacting
  });

  return newCases.filter(newCase =>
    newCase.splitAgents.some(splitAgent => splitAgent.profileId.id == profileId)
  );
};


const fetchNewCasesSettled = async (profileId, startDate, endDate, { transacting }) => {
  // JLOG({ profileId, startDate, endDate })
  const newCases = await strapi.db.query('api::newcase.newcase').findMany({
    where: {
      settledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    populate: {
      splitAgents: {
        populate: {
          profileId: {
            select: ['id']
          }
        }
      },
    },
    transacting
  });
  // JLOG(newCases);
  return newCases.filter(newCase =>
    newCase.splitAgents.some(splitAgent => splitAgent.profileId.id === profileId)
  );
};



const calculateMetricsSubmitted = (newCases, profileId) => {
  let totalNoOfCases = 0;
  let totalEstFieldRevenue = 0;

  newCases.forEach(newCase => {
    newCase.splitAgents.forEach(splitAgent => {
      if (splitAgent.profileId.id === profileId) {
        const splitingPercentage = splitAgent.splitingPercentage / 100;
        totalEstFieldRevenue += newCase.totalEstFieldRevenue * splitingPercentage;
        totalNoOfCases += 1 * splitingPercentage;
      }
    });
  });

  return {
    totalNoOfCases,
    totalEstFieldRevenue
  };
};

const calculateMetricsInTheMill = (newCases, profileId) => {
  const statuses = [
    'Pending Review', 
    'UW/Processing', 
    'UW/Approved', 
    'Pending Pay'
  ];
  let totalNoOfCaseInTheMill = 0;
  let totalEstFieldRevenueInTheMill = 0;
  newCases.forEach(newCase => {
    if (statuses.includes(newCase.status)) {
      newCase.splitAgents.forEach(splitAgent => {
        if (splitAgent.profileId.id === profileId) {
          const splitingPercentage = splitAgent.splitingPercentage / 100;
          totalEstFieldRevenueInTheMill += newCase.totalEstFieldRevenue * splitingPercentage;
          totalNoOfCaseInTheMill += 1 * splitingPercentage;
        }
      });
    }
  });
  return {
    totalNoOfCaseInTheMill,
    totalEstFieldRevenueInTheMill
  };
};

const calculateNumberOfCaseSettled = (newCases, profileId) => {
  let totalNoOfSettled = 0;
  // Calculate the total number of settled cases
  newCases.forEach(newCase => {
      newCase.splitAgents.forEach(splitAgent => {
        if (splitAgent.profileId.id === profileId) {
          const splitingPercentage = splitAgent.splitingPercentage / 100;
          totalNoOfSettled  += 1 * splitingPercentage;
        }
      });
  });

  // Calculate the total estimated field revenue for settled cases
  return {
    totalNoOfSettled
  };
};

const calculateSettledRevenueFromTransaction = async (profileId, startDate, endDate) => {
  try {
    // Fetch the account associated with the profileId
    const profile = await strapi.entityService.findOne('api::profile.profile', profileId, {
      populate: ['accountId'],
    });

    if (!profile || !profile.accountId) {
      throw new Error('Profile or associated account not found');
    }

    // Define the query for fetching transactions
    const query = {
      filters: {
        accountId: profile.accountId.id,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        type: 'commission',
      },
      populate: ['statementLog'],
    };

    // Fetch transactions
    const transactions = await strapi.entityService.findMany('api::accounttransaction.accounttransaction', query);

    // Initialize result object
    const result = {
      total: 0,
      monthlyBreakdown: Array(12).fill(0),
    };

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      const monthIndex = transactionDate.getMonth(); // getMonth() returns 0-11

      transaction.statementLog.forEach(log => {
        if (log.source === 'Personal') {
          const revenue = (log.fieldRevenue || 0) + (log.teamFieldRevenue || 0);
          result.total += revenue;
          result.monthlyBreakdown[monthIndex] += revenue;
        }
      });
    });

    // Round all values to 2 decimal places
    result.total = parseFloat(result.total.toFixed(2));
    result.monthlyBreakdown = result.monthlyBreakdown.map(value => parseFloat(value.toFixed(2)));

    return result;
  } catch (error) {
    console.error('Error in calculateSettledRevenueFromTransaction:', error);
    throw error;
  }
}

// const fetchMonthlyMetric = async (profileId, yearMonth, metricName, { transacting }) => {
//   // Assuming yearMonth is in YYYYMM format
//   const year = Math.floor(yearMonth / 100); // Extract the year part
//   const month = yearMonth % 100; // Extract the month part

//   // For monthly metric, we only need to fetch for the specific yearMonth
//   const settledFieldRevenue = await strapi.entityService.findMany('api::monthly-metric.monthly-metric', {
//     filters: {
//       profileId: profileId,
//       yearMonth: yearMonth,
//       metricName: metricName
//     },
//     fields: ['id', 'yearMonth', 'metricName', 'metricValue'],
//     populate: {
//       profileId: {
//         fields: ['id']
//       }
//     },
//     transacting
//   });

//   return settledFieldRevenue;
// };

// const fetchYTDMetric = async (profileId, yearMonth, metricName, { transacting }) => {
//   // Assuming yearMonth is in YYYYMM format
//   const year = Math.floor(yearMonth / 100); // Extract the year part

//   // Define startYearMonth as January of the specified year
//   const startYearMonth = year * 100 + 1; // e.g., 202401

//   // Define endYearMonth as the provided yearMonth
//   const endYearMonth = yearMonth; // e.g., 202406

//   const settledFieldRevenue = await strapi.entityService.findMany('api::monthly-metric.monthly-metric', {
//     filters: {
//       profileId: profileId,
//       yearMonth: {
//         $gte: startYearMonth,
//         $lte: endYearMonth,
//       },
//       metricName: metricName
//     },
//     fields: ['id', 'yearMonth', 'metricName', 'metricValue',],
//     populate: {
//       profileId: {
//         fields: ['id']
//       }
//     },
//     transacting
//   });

//   return settledFieldRevenue;
// };


const calculatePersonalMonthlyMetric = async (profileId, yearMonth, { transacting }) => {
  try {
    const year = parseInt(yearMonth.substring(0, 4), 10);
    const month = parseInt(yearMonth.substring(4, 6), 10);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const newCases = await fetchNewCases(profileId, startDate, endDate, { transacting });
    const metrics = calculateMetricsSubmitted(newCases, profileId);
    const inTheMillMetrics = calculateMetricsInTheMill(newCases, profileId);

    const settledCases = await fetchNewCasesSettled(profileId, startDate, endDate, { transacting });
    const settledMetrics = calculateNumberOfCaseSettled(settledCases, profileId);
    const settledRevenueFromTransaction = await calculateSettledRevenueFromTransaction(profileId, startDate, endDate);

    // const settledFieldRevenue = await fetchMonthlyMetric(profileId, yearMonth, 'personalFieldRevenue', { transacting });

    const monthData = {
      Pending_Review: 0,
      UW_Processing: 0,
      UW_Approved: 0,
      Pending_Pay: 0,
      Paid_Settled: 0,
      Not_Proceeded_With: 0,
      Declined_Postponed: 0,
      Lapse_Withdrawn: 0,
      Settled_Revenue: 0,
      name: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
      cases: []
    };

    newCases.forEach(newCase => {
      const status = newCase.status.replace(/[\s/]/g, '_');
      if (monthData[status] !== undefined && status !== 'Settled_Revenue') {
        const splitAgentIndex = newCase.splitAgents.findIndex(splitAgent => splitAgent.profileId.id === profileId);
        const splitingPercentage = newCase.splitAgents[splitAgentIndex].splitingPercentage / 100;
        monthData[status] += newCase.totalEstFieldRevenue * splitingPercentage || 0;
        monthData.cases.push(newCase.id);
      }
    });

    return {
      ...settledMetrics,
      ...metrics,
      ...inTheMillMetrics,
      // settledFieldRevenue,
      settledRevenueFromTransaction,
      newCases,
      monthData
    };
  } catch (error) {
    console.error('Error calculating monthly metrics:', error);
    throw error;
  }
}


const calculatePersonalYTDMetric = async (profileId, yearMonth, { transacting }) => {
  try {
    const year = parseInt(yearMonth.substring(0, 4), 10);
    const month = parseInt(yearMonth.substring(4, 6), 10);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const newCases = await fetchNewCases(profileId, startDate, endDate, { transacting });
    // JLOG(newCases);

    const metrics = calculateMetricsSubmitted(newCases, profileId);
    const inTheMillMetrics = calculateMetricsInTheMill(newCases, profileId);
    // Calculate new case figures for settled cases
    const settledCases = await fetchNewCasesSettled(profileId, startDate, endDate, { transacting });
    const settledMetrics = calculateNumberOfCaseSettled(settledCases, profileId);
    const settledRevenueFromTransaction = await calculateSettledRevenueFromTransaction(profileId, startDate, endDate);

    // Get opportunity records
    const opportunities = await strapi.entityService.findMany('api::opportunity.opportunity', {
      filters: {
        profileId: profileId,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      },
      transacting
    });
    JLOG(opportunities);
    // Calculate opportunity metrics
    let totalNoOfOpportunity = opportunities.length;
    let totalOpportunityEstFieldRevenue = opportunities.reduce((sum, opportunity) => {
      return sum + (parseFloat(opportunity.estAmount) || 0);
    }, 0);   

    // Initialize months array
    const months = Array.from({ length: 12 }, (_, i) => ({
      Pending_Review: 0,
      UW_Processing: 0,
      UW_Approved: 0,
      Pending_Pay: 0,
      Paid_Settled: 0,
      Not_Proceeded_With: 0,
      Declined_Postponed: 0,
      Lapse_Withdrawn: 0,
      Settled_Revenue: 0,
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      cases: []
    }));

    // Process metrics for each month
    newCases.forEach(newCase => {
      const monthIndex = new Date(newCase.createdAt).getMonth();
      // const status = newCase.status.replace(/ /g, '_'); // Convert spaces to underscores for keys
      const status = newCase.status.replace(/[\s/]/g, '_');
      if (months[monthIndex][status] !== undefined && months[monthIndex][status] !== 'Settled_Revenue' ) {
        // Find the splitAgent index based on the profileId and newCase record
        const splitAgentIndex = newCase.splitAgents.findIndex(splitAgent => splitAgent.profileId.id === profileId);
        const splitingPercentage = newCase.splitAgents[splitAgentIndex].splitingPercentage / 100;
        months[monthIndex][status] += newCase.totalEstFieldRevenue * splitingPercentage || 0;
        months[monthIndex].cases.push(newCase.id);
      }
    });
    return {
      ...settledMetrics,
      ...metrics,
      ...inTheMillMetrics,
      // settledFieldRevenue,
      settledRevenueFromTransaction,
      newCases,
      totalNoOfOpportunity,
      totalOpportunityEstFieldRevenue
      // months
    };
  } catch (error) {
    console.error('Error calculating YTD metrics:', error);
    throw error;
  }
};


const calculateTeamYTDMetric = async (profileId, yearMonth, { transacting }) => {
  try {
    // Step 1: Get the team members path using the teamMembers function
    const { path } = await strapi.services['api::network.network'].teamMembers(profileId);

    // Step 2: Remove the first item which is the input profileId
    const filteredPath = path.filter(member => member.id !== profileId);

    // Step 3: Initialize an array to hold the results and variables for the totals
    const results = [];
    let totalNoOfSettled = 0;
    let totalNoOfCases = 0;
    let totalEstFieldRevenue = 0;
    let totalNoOfCaseInTheMill = 0;
    let totalEstFieldRevenueInTheMill = 0;
    let totalNoOfOpportunity = 0;
    let totalOpportunityEstFieldRevenue

    // let totalTeamFieldRevenue = 0;

    // Step 4: Loop through the filtered path array and calculate metrics for each member
    for (const member of filteredPath) {
      const metrics = await calculatePersonalYTDMetric(member.id, yearMonth, { transacting });

      // Accumulate the total values
      totalNoOfSettled += metrics.totalNoOfSettled || 0;
      totalNoOfCases += metrics.totalNoOfCases || 0;
      totalEstFieldRevenue += metrics.totalEstFieldRevenue || 0;
      totalNoOfCaseInTheMill += metrics.totalNoOfCaseInTheMill || 0;
      totalEstFieldRevenueInTheMill += metrics.totalEstFieldRevenueInTheMill || 0;
      totalNoOfOpportunity += metrics.totalNoOfOpportunity || 0;
      totalOpportunityEstFieldRevenue += metrics.totalOpportunityEstFieldRevenue || 0;

      results.push({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        rankName: member.rankName,
        subscriberStatus: member.subscriberStatus,
        parent: member.parent,
        ...metrics,
      });
    }

    // Step 6: Return the results object with the total values and months array
    return {
      teamMembers: results,
      totalNoOfSettled,
      totalNoOfCases,
      totalEstFieldRevenue,
      // totalTeamFieldRevenue,
      totalNoOfCaseInTheMill,
      totalEstFieldRevenueInTheMill,
      totalNoOfOpportunity,
      totalOpportunityEstFieldRevenue
      // months
    };
  } catch (error) {
    console.error('Error calculating team YTD metrics:', error);
    throw error;
  }
};

module.exports = {
  updateMonthlyMetric,
  calculatePersonalMonthlyMetric,
  calculatePersonalYTDMetric,
  calculateSettledRevenueFromTransaction,
  calculateTeamYTDMetric
};
