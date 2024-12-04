// path: src/api/paymentperiod/routes/custom-paymentperiod.js

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/paymentperiods/getadvisorpayhistory',
      handler: 'paymentperiod.getAdvisorPayHistory',
    },
    {
      method: 'GET',
      path: '/paymentperiods/getadvisorpaymentperiods',
      handler: 'paymentperiod.getAdvisorPaymentPeriods',
    },
    {
      method: 'GET',
      path: '/paymentperiods/getadvisordataforpromotions',
      handler: 'paymentperiod.getAdvisorDataForPromotions',
    },    
    {
      method: 'POST',
      path: '/paymentperiods/createadvisorpaymentmonthlymetric',
      handler: 'paymentperiod.createAdvisorPaymentMonthlyMetric',
    },
  ],
};
