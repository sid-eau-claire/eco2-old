'use strict';

// Path: /api/network/services/network.js

// async function findHierarchyPath(startProfileId) {
//   // Logic to construct the hierarchy path
//   // This is a simplified version. You'll need to adjust it based on your data model.
//   const hierarchy = [];
//   let currentId = startProfileId;

//   while (currentId) {
//     const network = await strapi.entityService.findOne("api::network.network", currentId, {
//       populate: ['parentId'],
//     });
    
//     if (!network || !network.parentId) break;

//     hierarchy.push(network.parentId.id);
//     currentId = network.parentId.id;
//   }

//   return hierarchy;
// }

// module.exports = {
//   findHierarchyPath,
// };



// async function findReportingLineToManager(profileId) {
//   const hierarchyPath = await strapi.services.network.findHierarchyPath(profileId);
//   const reportingLine = [];

//   for (const id of hierarchyPath) {
//     const profileDetails = await strapi.entityService.findOne("api::profile.profile", id, {
//       populate: { rankId: true },
//     });

//     // Using optional chaining to safely access `rank.id` and check if it's one of the target values
//     if (profileDetails && [5, 8].includes(profileDetails.rankId)) {
//       reportingLine.push({
//         profileId: profileDetails.id,
//         rankId: profileDetails.rankId,
//       });
//       // Stop the loop once the first manager is found
//       break;
//     }
//   }

//   return reportingLine;
// }

// module.exports = {
//   findReportingLineToManager,
// };
