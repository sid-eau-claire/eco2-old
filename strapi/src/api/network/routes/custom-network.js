module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/networks/findpath',
      handler: 'network.findPath',
    },
    {
      method: 'GET',
      path: '/networks/isUnderManagement',
      handler: 'network.isUnderManagement',
    },    
    {
      method: 'GET',
      path: '/networks/lookuptotop',
      handler: 'network.lookupToTop',
    },
    {
      method: 'GET',
      path: '/networks/lookuptotops',
      handler: 'network.lookupToTops',
    },
    {
      method: 'GET',
      path: '/networks/teamMembers',
      handler: 'network.teamMembers',
    },    
    {
      method: 'GET',
      path: '/networks/lookdown',
      handler: 'network.lookDown',
    },
    {
      method: 'GET',
      path: '/networks/fetchnetworkgraph',
      handler: 'network.fetchNetworkGraph',
    },
    {
      method: 'GET',
      path: '/networks/agencynetwork',
      handler: 'network.agencyNetwork',
    },
    {
      method: 'GET',
      path: '/networks/generationnetwork',
      handler: 'network.generationNetwork',
    },
    {
      method: 'GET',
      path: '/networks/teamContributionForPromotion',
      handler: 'network.teamContributionForPromotion',
    },
    {
      method: 'GET',
      path: '/networks/personalContributionForPromotion',
      handler: 'network.personalContributionForPromotion',
    },    

  ],
};
