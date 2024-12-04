'use strict';

/**
 * commissionlog router
 */
module.exports = {
  routes: [
    {
      "method": "GET",
      "path": "/okr/getokrinsurance",
      "handler": "getokrinsurance.getokrinsurance",
    },
    {
      "method": "GET",
      "path": "/okr/getokrinvestment",
      "handler": "getokrinvestment.getokrinvestment",
    },    
    {
      "method": "GET",
      "path": "/okr/getokrsettledrevenue",
      "handler": "getokrsettledrevenue.getokrsettledrevenue",
    },
    {
      "method": "GET",
      "path": "/okr/getokr",
      "handler": "getokr.getokr",
    }       
  ],
};
