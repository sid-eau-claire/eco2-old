'use strict';

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async createAdvisorPaymentMonthlyMetric(yearMonth) {
    const year = parseInt(yearMonth.slice(0, 4), 10);
    const month = parseInt(yearMonth.slice(4, 6), 10) - 1;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const paymentPeriods = await strapi.db.query('api::paymentperiod.paymentperiod').findMany({
      where: {
        payPeriodDate: {
          $gte: startDate,
          $lte: endDate
        },
      },
      populate: {
        advisorRevenue: {
          populate: {
            TRXIds: true,
            accountId: {
              populate: {
                profileId: true
              }
            }
          }
        }
      }
    });
    // JLOG(paymentPeriods);
    const advisorPayrollAmounts = {};
    const advisorFieldRevenueAmount = {};
    const advisorTeamFieldRevenueAmount = {};
    paymentPeriods.forEach(period => {
      period.advisorRevenue.forEach(revenue => {
        const { accountId, TRXIds, fieldRevenue, teamFieldRevenue } = revenue;
        
        // Calculate payroll amounts
        const payrollAmounts = TRXIds
          .filter(trx => trx.type === 'payroll')
          .map(trx => trx.amount)
          .reduce((acc, amount) => acc + parseFloat(amount), 0);

        if (payrollAmounts > 0) {
          const profileId = accountId.profileId.id;
          if (!advisorPayrollAmounts[profileId]) {
            advisorPayrollAmounts[profileId] = 0;
          }
          advisorPayrollAmounts[profileId] += payrollAmounts;
        }

        // Calculate field revenue amounts
        if (fieldRevenue > 0) {
          const profileId = accountId.profileId.id;
          if (!advisorFieldRevenueAmount[profileId]) {
            advisorFieldRevenueAmount[profileId] = 0;
          }
          advisorFieldRevenueAmount[profileId] += parseFloat(fieldRevenue);
        }

        // Calculate team field revenue amounts
        if (teamFieldRevenue > 0) {
          const profileId = accountId.profileId.id;
          if (!advisorTeamFieldRevenueAmount[profileId]) {
            advisorTeamFieldRevenueAmount[profileId] = 0;
          }
          advisorTeamFieldRevenueAmount[profileId] += parseFloat(teamFieldRevenue);
        }
      });
    });

    // Create monthly metrics for payrollAmount
    const monthlyPayrollMetrics = Object.keys(advisorPayrollAmounts).map(profileId => ({
      profileId,
      yearMonth,
      metricName: 'payrollAmount',
      metricValue: advisorPayrollAmounts[profileId]
    }));

    // Create monthly metrics for personalFieldRevenue
    const monthlyFieldRevenueMetrics = Object.keys(advisorFieldRevenueAmount).map(profileId => ({
      profileId,
      yearMonth,
      metricName: 'personalFieldRevenue',
      metricValue: advisorFieldRevenueAmount[profileId]
    }));

    // Create monthly metrics for teamFieldRevenue
    const monthlyTeamFieldRevenueMetrics = Object.keys(advisorTeamFieldRevenueAmount).map(profileId => ({
      profileId,
      yearMonth,
      metricName: 'teamFieldRevenue',
      metricValue: advisorTeamFieldRevenueAmount[profileId]
    }));

    const monthlyMetrics = [
      ...monthlyPayrollMetrics, 
      ...monthlyFieldRevenueMetrics, 
      ...monthlyTeamFieldRevenueMetrics
    ];
    JLOG(monthlyMetrics);

    for (const metric of monthlyMetrics) {
      // Check if the record already exists
      const existingMetric = await strapi.db.query('api::monthly-metric.monthly-metric').findOne({
        where: {
          profileId: metric.profileId,
          yearMonth: metric.yearMonth,
          metricName: metric.metricName
        }
      });

      if (!existingMetric) {
        await strapi.db.query('api::monthly-metric.monthly-metric').create({
          data: metric
        });
      } else {
        await strapi.db.query('api::monthly-metric.monthly-metric').update({
          where: { id: existingMetric.id },
          data: {
            metricValue: metric.metricValue,
          },
        });
      }
    }

    return { message: 'Advisor payroll and field revenue history created successfully' };
  },

  async getAdvisorPayHistory(profileId) {
    const account = await strapi.db.query('api::account.account').findOne({
      where: { profileId },
      select: ['id']
    });
    if (!account) {
      throw new Error('Account not found');
    }

    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const careerStart = new Date('1970-01-01');
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const previousYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    const periods = {
      monthToDate: [currentMonthStart, today],
      yearToDate: [startOfYear, today],
      rolling12Months: [oneYearAgo, today],
      rolling3Months: [threeMonthsAgo, today],
      careerEarnings: [careerStart, today],
      previousMonthToDate: [previousMonthStart, previousMonthEnd],
      previousYearToDate: [previousYearStart, previousYearEnd],
      previousRolling12Months: [new Date(oneYearAgo.getFullYear() - 1, oneYearAgo.getMonth(), oneYearAgo.getDate()), oneYearAgo]
    };

    const results = {};

    for (const [key, [start, end]] of Object.entries(periods)) {
      const paymentPeriods = await strapi.db.query('api::paymentperiod.paymentperiod').findMany({
        where: {
          payPeriodDate: {
            $gte: start,
            $lte: end
          },
        },
        populate: {
          advisorRevenue: {
            populate: {
              TRXIds: true,
              accountId: true
            }
          }
        }
      });

      const filteredPaymentPeriods = paymentPeriods.filter(period =>
        period.advisorRevenue.some(revenue => revenue.accountId.id == account.id)
      );

      const payrollAmounts = filteredPaymentPeriods.flatMap(period =>
        (period.advisorRevenue || [])
          .filter(rev => rev.accountId.id === account.id)
          .flatMap(rev => (rev.TRXIds || [])
            .filter(trx => trx.type === 'payroll')
            .map(trx => trx.amount)
          )
      );

      results[key] = payrollAmounts.reduce((acc, amount) => acc + parseFloat(amount), 0);
    }

    return { data: [results], meta: { count: Object.keys(results).length } };
  }
};
