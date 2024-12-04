module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/newcases/createInTheMillHistory',
      handler: 'newcase.createInTheMillHistory',
    },
    // {
    //   method: 'POST',
    //   path: '/newcases/calculateMonthlyMetric',
    //   handler: 'newcase.calculateMonthlyMetric', 
    // },
    {
      method: 'POST',
      path: '/newcases/calculatePersonalYTDMetric',
      handler: 'newcase.calculatePersonalYTDMetric', 
    },
    {
      method: 'POST',
      path: '/newcases/calculatePersonalYTDMetric',
      handler: 'newcase.calculatePersonalYTDMetric', 
    },
    {
      method: 'POST',
      path: '/newcases/calculateTeamYTDMetric',
      handler: 'newcase.calculateTeamYTDMetric', 
    }
  ],
};
