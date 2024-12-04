'use strict';

/**
 * commissionlog router
 */
module.exports = {
  routes: [
    {
      "method": "GET",
      "path": "/pki/getokrinsurance",
      "handler": "getokrinsurance.getokrinsurance",
    },
  ],
};
