// {
//   "routes": [
//     {
//       "method": "POST",
//       "path": "/api/citsclient/createOrUpdateClient",
//       "handler": "citsclient.createOrUpdateClient",
//       "config": {
//         "policies": []
//       }
//     }
//   ]
// }

'use strict';

module.exports = {
  routes: [
    {
      "method": "POST",
      "path": "/citsclients/createOrUpdateClient",
      "handler": "citsclient.createOrUpdateClient",
      "config": {
        "policies": []
      }
    }   
  ],
};