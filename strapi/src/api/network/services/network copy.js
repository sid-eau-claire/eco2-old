'use strict';

const { filter } = require('../../../../config/middlewares');
const rank = require('../../rank/controllers/rank');
const {  calculateSettledRevenueFromTransaction } = require('../../newcase/services/performance');


/**
 * network service
 */

// const { createCoreService } = require('@strapi/strapi').factories;

// module.exports = createCoreService('api::network.network');



const { createCoreService } = require('@strapi/strapi').factories;

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

const buildParentChildMap = (data) => {
  const map = {};
  data.forEach((network) => {
    // Accessing parentId and childId directly from the populated fields
    const parentId = network.attributes?.parentId;
    const childId = network.attributes?.childId;
    if (parentId && childId) {
      if (!map[parentId]) {
        map[parentId] = [];
      }
      map[parentId].push(childId);
    }
  });
  return map;
};


const searchHierarchy = (map, currentId, targetId, path = []) => {
  // console.log(`Searching from ${currentId} to ${targetId}, current path: ${path}`);
  if (currentId === targetId) {
    return [...path, currentId];
  }
  if (!map[currentId]) {
    return null;
  }
  for (const childId of map[currentId]) {
    const result = searchHierarchy(map, childId, targetId, [...path, currentId]);
    if (result) {
      return result;
    }
  }
  return null;
};


module.exports = createCoreService('api::network.network', ({ strapi }) =>  ({
  // Custom service method to find the hierarchy path
  async findHierarchyPath(parentId, childId) {
    // Implement the fetching and logic to determine the path here
    // This example assumes you have a method to build the parent-child map
    // and a searchHierarchy method similar to what you described earlier
    
    // Example fetching logic (adapt according to your actual data structure)
    const networks = await strapi.entityService.findMany('api::network.network', {
      populate: { parentId: true, childId: true },
    });
    
    // Convert your network data to the format expected by your logic
    const data = networks.map(network => ({
      attributes: {
        parentId: String(network?.parentId?.id), // Ensure consistent ID types
        childId: String(network?.childId?.id),
      },
    }));
    
    const parentChildMap = buildParentChildMap(data);
    // strapi.log.debug(JSON.stringify(parentChildMap, null, 2));
    // strapi.log.debug('hello')
    const hierarchyPath = searchHierarchy(parentChildMap, parentId, childId);

    return hierarchyPath ? hierarchyPath.join(" > ") : null;
  },
  async isUnderManagement(parentId, childId) {
    // Use the findHierarchyPath function to get the hierarchy path from parent to child
    const path = await this.findHierarchyPath(parentId, childId);
    // If a path exists, then child is under the management of parent, so return true
    // If no path is found, return false
    // return path !== null;
    return { underManagement: path !== null };
  }, 

  async lookupToTop(profileId) {
    const profilePath = [];
    const rankPath = [];
    const fullNamePath = [];
    const administrativePath = [];
    let currentProfileId = profileId;
    while (currentProfileId) {
      const profile = await strapi.entityService.findOne('api::profile.profile', currentProfileId, {
        populate: {
          rankId: true,   // Assuming 'rank' is the correct relation name
          administrative: true,
          parentIds: {
            populate: {
              parentId: true,
            },
          },
        },
      });
      if (!profile) break;
      profilePath.push(profile.id);
      rankPath.push(profile.rankId || null);
      fullNamePath.push(`${profile.firstName} ${profile.lastName}`);
      administrativePath.push(profile?.administrative);
      // Move up to the parent for the next iteration
      // strapi.log.debug(`Profile` + JSON.stringify(profile, null, 2));
      currentProfileId = profile?.parentIds[0]?.parentId?.id; ;
    }
    return {
      profilePath,
      rankPath,
      fullNamePath,
      administrativePath
    };
  },
  // async lookupToTops(profileId, activeOnly = 'false') {
  //   const profilePath = [];
  //   const rankPath = [];
  //   const fullNamePath = [];
  //   const administrativePath = [];
  //   const commissionSplitFractionPath = [];
  
  //   // Helper function to format and retrieve profile image URL
  //   const getProfileImageUrl = (profileImage) => {
  //     if (!profileImage) return null;
  //     return profileImage.url.startsWith('http') ? profileImage.url : `http://your-strapi-domain.com${profileImage.url}`;
  //   };
  
  //   // Helper function to check if a profile is active
  //   const isProfileActive = (profile) => {
  //     return profile.subscriberStatus !== 'Terminated';
  //   };
  
  //   // Find the rankId and rankValue for the input profile
  //   const inputProfile = await strapi.entityService.findOne('api::profile.profile', profileId, {
  //     populate: {
  //       rankId: true,
  //       profileImage: true,
  //       administrative: {
  //         populate: {
  //           blockCommission: true,
  //         }
  //       },
  //       licenseContracting: {
  //         populate: {
  //           contracted: true,
  //           dateContracted: true,
  //           contractTerminatedAt: true,
  //           subscriberStatus: true,
  //         }
  //       }
  //     }
  //   });
  
  //   // Helper function to add profile data to paths
  //   const addPath = (profile, commissionSplits, currentProfilePath, currentRankPath) => {
  //     const profileData = {
  //       id: profile.id,
  //       firstName: profile.firstName,
  //       lastName: profile.lastName,
  //       rankId: profile.rankId?.id || null,
  //       profileImage: getProfileImageUrl(profile.profileImage),
  //       contractedAt: profile.licenseContracting?.dateContracted ? new Date(profile.licenseContracting.dateContracted).toISOString().split('T')[0] : null,
  //       deactivatedAt: profile.administrative?.deactivatedAt ? new Date(profile.administrative.deactivatedAt).toISOString().split('T')[0] : null,
  //       subscriberStatus: profile.licenseContracting?.subscriberStatus || null,
  //     };
  
  //     profilePath.push([...currentProfilePath, profileData]);
  //     rankPath.push([...currentRankPath]);
  //     fullNamePath.push(`${profile.firstName} ${profile.lastName}`);
  //     administrativePath.push(profile?.administrative);
  //     commissionSplitFractionPath.push([...commissionSplits]);
  //   };
  
  //   // Recursive function to lookup all parent profiles using network collection
  //   const lookupParents = async (currentProfileId, commissionSplits, currentProfilePath, currentRankPath) => {
  //     if (!currentProfileId) return;
  
  //     const networks = await strapi.entityService.findMany('api::network.network', {
  //       filters: { childId: currentProfileId },
  //       populate: {
  //         parentId: {
  //           populate: {
  //             rankId: true,
  //             profileImage: true,
  //             administrative: {
  //               populate: {
  //                 blockCommission: true,
  //               }
  //             },
  //             licenseContracting: {
  //               populate: {
  //                 contracted: true,
  //                 dateContracted: true,
  //                 contractTerminatedAt: true,
  //                 subscriberStatus: true,
  //               }
  //             }
  //           }
  //         }
  //       }
  //     });
  
  //     if (networks.length === 0) return;
  
  //     for (const network of networks) {
  //       const parentProfile = network.parentId;
  //       if (!parentProfile) continue;
  
  //       const parentRankData = parentProfile.rankId ? { id: parentProfile.rankId.id, rankValue: parentProfile.rankId.rankValue } : null;
        
  //       // Update commission splits, profile path, and rank path for current profile
  //       const updatedCommissionSplits = [...commissionSplits, network.commissionSplitFraction];
  //       const updatedProfilePath = [...currentProfilePath, parentProfile.id];
  //       const updatedRankPath = [...currentRankPath, parentRankData];
  
  //       // Add current profile data to paths
  //       addPath(parentProfile, updatedCommissionSplits, updatedProfilePath, updatedRankPath);
  
  //       // Recurse up to the parent profile with updated lists
  //       await lookupParents(parentProfile.id, updatedCommissionSplits, updatedProfilePath, updatedRankPath);
  //     }
  //   };
  
  //   // Start recursion with initial settings
  //   await lookupParents(profileId, [], [inputProfile], []);
  
  //   // Include the original profile in the paths
  //   for (const rankPathItem of rankPath) {
  //     rankPathItem.push({ id: inputProfile?.rankId?.id, rankValue: inputProfile?.rankId?.rankValue });
  //   }
  
  //   // Function to remove terminated nodes and adjust connections
  //   const restructureHierarchy = (paths) => {
  //     return paths.map(path => {
  //       return path.filter(profile => isProfileActive(profile));
  //     }).filter(path => path.length > 0);
  //   };
  
  //   // Apply filtering if activeOnly is true
  //   if (activeOnly === 'true') {
  //     return {
  //       profilePath: restructureHierarchy(profilePath),
  //       rankPath: restructureHierarchy(rankPath),
  //       fullNamePath: fullNamePath.filter((_, index) => isProfileActive(profilePath[index][profilePath[index].length - 1])),
  //       administrativePath: administrativePath.filter((_, index) => isProfileActive(profilePath[index][profilePath[index].length - 1])),
  //       commissionSplitFractionPath: restructureHierarchy(commissionSplitFractionPath),
  //     };
  //   }
  
  //   return {
  //     profilePath,
  //     rankPath,
  //     fullNamePath,
  //     administrativePath,
  //     commissionSplitFractionPath,
  //   };
  // }, 

  async lookupToTops(profileId) {
    const profilePath = [];
    const rankPath = [];
    const fullNamePath = [];
    const administrativePath = [];
    const commissionSplitFractionPath = [];
    // Find the rankId and rankValue for the input profile
    const inputProfile = await strapi.entityService.findOne('api::profile.profile', profileId, {
      populate: {
        rankId: true,
      }})
    // JLOG(inputProfile)

    // Helper function to add profile data to paths
    const addPath = (profile, commissionSplits, currentProfilePath, currentRankPath) => {
        // Add the latest rank information to the rank path
        // const currentRankData = profile.rankId ? { id: profile.rankId.id, rankValue: profile.rankId.rankValue } : null;
        // currentRankPath.push(currentRankData);  // Push only the current profile's rank info

        profilePath.push([...currentProfilePath]);  // Save a copy of the profile path up to this profile
        rankPath.push([...currentRankPath]);  // Save a copy of the rank path up to this profile
        fullNamePath.push(`${profile.firstName} ${profile.lastName}`);
        administrativePath.push(profile?.administrative);
        commissionSplitFractionPath.push([...commissionSplits]);  // Handle commission splits similarly
    };

    // Recursive function to lookup all parent profiles using network collection
    const lookupParents = async (currentProfileId, commissionSplits, currentProfilePath, currentRankPath) => {
        if (!currentProfileId) return;
        const networks = await strapi.entityService.findMany('api::network.network', {
            filters: { childId: currentProfileId },
            populate: {
                parentId: true
            }
        });

        if (networks.length === 0) return;

        for (const network of networks) {
            const parentProfileId = network.parentId.id;
            const profile = await strapi.entityService.findOne('api::profile.profile', parentProfileId, {
                populate: {
                    rankId: true,
                    administrative: true
                }
            });
            const parentRankData = profile.rankId ? { id: profile.rankId.id, rankValue: profile.rankId.rankValue } : null;
            if (!profile) continue;

            // Update commission splits, profile path, and rank path for current profile
            const updatedCommissionSplits = [...commissionSplits, network.commissionSplitFraction];
            const updatedProfilePath = [parentProfileId, ...currentProfilePath];  // Prepend parent profile ID to the path
            const updatedRankPath = [parentRankData, ...currentRankPath];  // Copy the current rank path for the next level

            // Add current profile data to paths
            addPath(profile, updatedCommissionSplits, updatedProfilePath, updatedRankPath);

            // Recurse up to the parent profile with updated lists
            await lookupParents(parentProfileId, updatedCommissionSplits, updatedProfilePath, updatedRankPath);
        }
    };

    // Start recursion with initial settings
    await lookupParents(profileId, [], [profileId], []);
    // Include the original profile in the paths
    for (const rankPathItem of rankPath) {
      rankPathItem.push({ id: inputProfile?.rankId?.id, rankValue: inputProfile?.rankId?.rankValue })
    }
    return {
        profilePath,
        rankPath,
        fullNamePath,
        administrativePath,
        commissionSplitFractionPath,
    };
  },

  
  
  // async lookDown(profileId, activeOnly = false) {
  //   const path = [];
  //   const filters = {
  //     $or: [
  //       { licenseContracting: { subscriberStatus: { $ne: 'Terminated' } } },
  //       { licenseContracting: { subscriberStatus: { $null: true } } }
  //     ]
  //   };
  //   console.log('lookDown', activeOnly)
  //   const activeFilter = activeOnly == true ? filters : '';
  //   // Helper function to format and retrieve profile image URL
  //   const getProfileImageUrl = (profileImage) => {
  //     if (!profileImage) return null; // Return null if no image
  //     // Assuming 'url' is the key where the image URL is stored. Adjust based on your actual data structure.
  //     // Check if the URL is absolute or relative to handle accordingly
  //     return profileImage.url.startsWith('http') ? profileImage.url : `http://your-strapi-domain.com${profileImage.url}`;
  //   };
  //   // Helper function to add or update a profile in the path
  //   const addOrUpdateProfileInPath = (profile, childId = null) => {
  //     let profileEntry = path.find(entry => entry.id === profile.id);
  //     if (!profileEntry) {
  //       // Format the joinDate
  //       const joinDate = profile.createdAt ? new Date(profile.createdAt).toISOString().split('T')[0] : null;
  //       profileEntry = {
  //         id: profile.id,
  //         firstName: profile.firstName,
  //         lastName: profile.lastName,
  //         rankId: profile.rankId?.id || null,
  //         profileImage: getProfileImageUrl(profile.profileImage),
  //         // contractedAt: profile.administrative?.contractedAt ? new Date(profile.administrative.contractedAt).toISOString().split('T')[0] : null,
  //         contractedAt: profile.licenseContracting?.dateContracted ? new Date(profile.licenseContracting?.dateContracted).toISOString().split('T')[0] : null,
  //         deactivatedAt: profile.administrative?.deactivatedAt ? new Date(profile.administrative.deactivatedAt).toISOString().split('T')[0] : null,
  //         // subscriberStatus: profile.administrative?.subscriberStatus || null,
  //         subscriberStatus: profile.licenseContracting?.subscriberStatus || null,
  //         children: [],
  //       };
  //       path.push(profileEntry);
  //     }
  //     if (childId) {
  //       profileEntry.children.push(childId);
  //     }
  //   };
  //   // Recursive function to traverse the hierarchy
  //   async function traverse(profileId) {
  //     const profile = await strapi.entityService.findOne('api::profile.profile', profileId, {
  //       populate: {
  //         rankId: true,
  //         profileImage: true, // Make sure to populate the profile image
  //         childIds: {
  //           populate: {
  //             childId: true,
  //           },
  //         },
  //         administrative: {
  //           populate: {
  //             // deactivatedAt: true,
  //             // subscriberStatus: true,
  //             // contractedAt: true,
  //             blockCommission: true,
  //           }
  //         },
  //         licenseContracting: {
  //           populate: {
  //             contracted: true,
  //             dateContracted: true,
  //             contractTerminatedAt: true,
  //             subscriberStatus: true,
  //           }
  //         } 
  //       },
  //       filters: activeFilter
  //       // filters: filters
  //     });
  //     console.log('profile', profile)
  //     if (!profile) return;
  //     // Add current profile's details to the path
  //     addOrUpdateProfileInPath(profile);
  //     // If there are children, recurse for each and add them to the parent's children array
  //     if (profile.childIds && profile.childIds.length > 0) {
  //       for (const child of profile.childIds) {
  //         addOrUpdateProfileInPath(profile, child.childId.id); // Update parent with new child
  //         await traverse(child.childId.id); // Recurse down the hierarchy
  //       }
  //     }
  //   }
  //   await traverse(profileId);
  //   return { path };
  // },
  async lookDown(profileId, activeOnly = 'false') {
    const path = [];
    console.log('lookDown activeOnly', activeOnly)
  
    // Helper function to format and retrieve profile image URL
    const getProfileImageUrl = (profileImage) => {
      if (!profileImage) return null;
      return profileImage.url.startsWith('http') ? profileImage.url : `http://your-strapi-domain.com${profileImage.url}`;
    };
  
    // Helper function to add or update a profile in the path
    const addOrUpdateProfileInPath = (profile, childId = null) => {
      let profileEntry = path.find(entry => entry.id === profile.id);
      if (!profileEntry) {
        const joinDate = profile.createdAt ? new Date(profile.createdAt).toISOString().split('T')[0] : null;
        profileEntry = {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          rankId: profile.rankId?.id || null,
          profileImage: getProfileImageUrl(profile.profileImage),
          contractedAt: profile.licenseContracting?.dateContracted ? new Date(profile.licenseContracting.dateContracted).toISOString().split('T')[0] : null,
          deactivatedAt: profile.administrative?.deactivatedAt ? new Date(profile.administrative.deactivatedAt).toISOString().split('T')[0] : null,
          subscriberStatus: profile.licenseContracting?.subscriberStatus || null,
          children: [],
        };
        path.push(profileEntry);
      }
      if (childId && !profileEntry.children.includes(childId)) {
        profileEntry.children.push(childId);
      }
    };
  
    // Helper function to check if a profile is active
    const isProfileActive = (profile) => {
      return profile.subscriberStatus !== 'Terminated';
    };
  
    // Recursive function to traverse the hierarchy
    async function traverse(profileId) {
      const profile = await strapi.entityService.findOne('api::profile.profile', profileId, {
        populate: {
          rankId: true,
          profileImage: true,
          childIds: {
            populate: {
              childId: true,
            },
          },
          administrative: {
            populate: {
              blockCommission: true,
            }
          },
          licenseContracting: {
            populate: {
              contracted: true,
              dateContracted: true,
              contractTerminatedAt: true,
              subscriberStatus: true,
            }
          } 
        },
      });
  
      if (!profile) return;
  
      // Always add the current profile to the path
      addOrUpdateProfileInPath(profile);
  
      // If there are children, recurse for each child
      if (profile.childIds && profile.childIds.length > 0) {
        for (const child of profile.childIds) {
          addOrUpdateProfileInPath(profile, child.childId.id);
          await traverse(child.childId.id);
        }
      }
    }
  
    await traverse(profileId);
  
    // Function to remove terminated nodes and adjust connections
    const restructureHierarchy = (nodes) => {
      const activeNodes = nodes.filter(isProfileActive);
      const nodeMap = new Map(activeNodes.map(node => [node.id, { ...node, children: [] }]));
  
      // Function to get all active descendants of a node
      const getActiveDescendants = (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return [];
        
        let descendants = [];
        for (const childId of node.children) {
          if (nodeMap.has(childId)) {
            descendants.push(childId);
          } else {
            descendants = descendants.concat(getActiveDescendants(childId));
          }
        }
        return descendants;
      };
  
      // Rebuild the hierarchy
      for (const [id, node] of nodeMap) {
        const activeDescendants = getActiveDescendants(id);
        node.children = activeDescendants;
      }
  
      return Array.from(nodeMap.values());
    };
  
    // Apply filtering if activeOnly is true
    console.log('activeOnly', activeOnly)
    if (activeOnly  == 'true') {
      return { path: restructureHierarchy(path) };
    }
  
    return { path };
  },  
  async teamMembers(profileId) {
    const path = [];
    const profileMap = new Map();
    const rankMap = new Map();
  
    // Fetch all ranks and store them in a map for quick lookup
    const ranks = await strapi.entityService.findMany('api::rank.rank', {
      fields: ['id', 'name', 'rankValue'] // Include rankValue in the fields to fetch
    });
    ranks.forEach(rank => {
      rankMap.set(rank.id, { name: rank.name, rankValue: rank.rankValue });
    });
  
    const addOrUpdateProfileInPath = (profile, parentId = null) => {
      let profileEntry = path.find(entry => entry.id === profile.id);
      if (!profileEntry) {
        // Format the joinDate
        const joinDate = profile.createdAt ? new Date(profile.createdAt).toISOString().split('T')[0] : null;
        profileEntry = {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          rankName: rankMap.get(profile.rankId?.id)?.name || null,
          subscriberStatus: profile.licenseContracting?.subscriberStatus || null,
          contracted: profile.licenseContracting?.contracted || false,
          contractedAt: profile.licenseContracting?.dateContracted ? new Date(profile.licenseContracting.dateContracted).toISOString().split('T')[0] : null,
          subscribedPlan: profile.subscriptionSetting?.planId?.name || null,
          parent: parentId === profileId ? "Direct report" : (parentId ? profileMap.get(parentId) : null)
        };
        path.push(profileEntry);
        // Add to profileMap
        profileMap.set(profile.id, `${profile.firstName} ${profile.lastName}`);
      }
      // if (childId) {
      //   profileEntry.children.push(childId);
      // }
    };
  
    // Recursive function to traverse the hierarchy
    async function traverse(profileId, parentId) {
      const profile = await strapi.entityService.findOne('api::profile.profile', profileId, {
        populate: {
          rankId: true,
          // profileImage: true, // Make sure to populate the profile image
          childIds: {
            populate: {
              childId: true,
            },
          },
          administrative: {
            populate: {
              deactivatedAt: true,
            }
          },
          licenseContracting: {
            populate: {
              contracted: true,
              dateContracted: true,
              subscriberStatus: true,
            }
          },
          subscriptionSetting: {
            populate: {
              planId: true,
            }
          }
        },
      });
      if (!profile) return;
      
      // Check rankValue before proceeding with traversal
      const profileRankValue = rankMap.get(profile.rankId?.id)?.rankValue;
      if (profileRankValue >= 2000 && parentId != null) return;
  
      // Add current profile's details to the path
      addOrUpdateProfileInPath(profile, parentId);
      
      // If there are children, recurse for each and add them to the parent's children array
      if (profile.childIds && profile.childIds.length > 0) {
        for (const child of profile.childIds) {
          await traverse(child.childId.id, profile.id); // Recurse down the hierarchy
        }
      }
    }
  
    await traverse(profileId, null);
    return { path };
  },
  
  async  fetchNetworkGraph(profileId, activeOnly = false) {
    // Fetch the hierarchical data starting from the given profileId
    // strapi.log.debug(`Fetching network graph for profile ID: ${profileId}`);
    // const lookDownResult = await lookDown(profileId);
    // function shortenName(name, maxLength = 6) {
    //   let [namePart1, namePart2] = name.split(' ');
    //   return namePart1.length > maxLength ? namePart1.substring(0, maxLength) + '..' : namePart1;
    // }
    // console.log('show fetchNetworkGraapy', activeOnly)
    const lookDownResult =  await strapi.service('api::network.network').lookDown(profileId, activeOnly);

    // strapi.log.debug(`Look down result: ${JSON.stringify(lookDownResult, null, 2)}`);
    const nodes = [];
    const edges = [];

    // Helper function to process each profile path segment
    const processSegment = (segment) => {
        const { id, firstName, lastName, rankId, profileImage, joinDate, children, contractedAt, deactivatedAt, subscriberStatus } = segment;
        
        // Add the current profile as a node
        // Sent Rank color
        let color = 'green';
        let fontColor = 'white';
        let size = 1;
        let hidden = false;
        if (rankId === 5 || rankId === 8) {
          color = 'blue';
        }
        // if (subscriberStatus == 1) {
        //   color = 'yellow';
        //   fontColor = 'black';
        // }
        if (subscriberStatus == 'Terminated') {
          color = 'grey';
        }
        if (rankId == 5 || rankId == 8) {
          size = 5 
        } else if (rankId ==7 || rankId == 4) {
          size = 4
        } else if (rankId ==3 || rankId ==6 ) {
          size = 3
        } else if (rankId == 2) {
          size = 2
        } else if (rankId == 1 || rankId == 11) {
          size = 1
        }
        const initial = firstName.charAt(0) + lastName.charAt(0);
        nodes.push({
            id: id,
            label: `${initial}`, // Adjust this as needed for your graph's labeling requirements
            title: `${firstName} ${lastName}\n(${contractedAt})`, // Example, including join date in the title tooltip
            rankId: rankId,
            profileImage: profileImage, // Make sure this URL is absolute if provided
            contractedAt,
            deactivatedAt,
            subscriberStatus,
            // color: rankId === 5 || rankId === 8 ? 'red' : 'green', // Example coloring logic
            color: color,
            font: {color: fontColor, size: 12 * size, face: 'Courier New, monospace'},
            hidden: hidden
        });
        
        // Add edges from the current profile to each of its children
        children.forEach(childId => {
            edges.push({
                from: id,
                to: childId,
            });
        });
    };

    // Process each segment in the path to build nodes and edges
    lookDownResult.path.forEach(processSegment);
    // return { nodes, edges };
    return {data: { nodes, edges},meta: {} };
  },
  async  agencyNetwork(profileId,  activeOnly = 'true') {
    const { profilePath, rankPath, fullNamePath, administrativePath, commissionSplitFractionPath } = await this.lookupToTops(Number(profileId), activeOnly);
    // Check if the profileId rankValue is 2000, if so, return an empty array
    // if (rankPath[0][rankPath[0].length - 1]?.rankValue == 2000) {
    //   return [];
    // }
    const formattedProfiles = [];
    for (let i = 0; i < profilePath.length; i++) {
      // Check if the profile's rankId is 5 or 8, if so, break the loop to stop processing
      const currentRankValue = rankPath[i][0]?.rankValue;
      const currentRankId = rankPath[i]?.id;
      // Assuming administrative details are in the same order as profiles and their ranks
      const adminDetails = administrativePath[i];
      formattedProfiles.push({
        id: profilePath[i][0],
        rankId: currentRankId,
        escrowPersonal: adminDetails?.escrowPersonal || null,
        escrowPersonalHoldPercent: adminDetails?.escrowPersonalHoldPercent || null,
        escrowAgency: adminDetails?.escrowAgency || null,
        escrowAgencyHoldPercent: adminDetails?.escrowAgencyHoldPercent || null,
        escrowGeneration: adminDetails?.escrowGeneration || null,
        escrowGenerationHoldPercent: adminDetails?.escrowGenerationHoldPercent || null,
        blockCommission: adminDetails?.blockCommission || false,
        deactivate: adminDetails?.deactivate || false,
        commissionSplitFraction: commissionSplitFractionPath[i] || null,
        profilePath: profilePath[i],
        rankPath: rankPath[i],
      });
      if (currentRankValue == 2000) {
        break
      }      
    }
    return formattedProfiles;
  },
  async generationNetwork(profileId,  activeOnly = 'true') {
    const { profilePath, rankPath, fullNamePath, administrativePath, commissionSplitFractionPath } = await this.lookupToTops(Number(profileId), activeOnly);
    const formattedProfiles = [];
    if (rankPath[0] == undefined){
      return [];
    }
    let generationLevel = 1;
    // JLOG(profilePath)
    for (let i = 0; i < profilePath.length ; i++) {
      // Only count generation staff
      if (rankPath[i]?.[0]?.rankValue != 2000) {
        continue;
      }
      const adminDetails = administrativePath[i];
      formattedProfiles.push({
        id: profilePath[i][0],
        firstName: fullNamePath[i].split(' ')[0], // Assuming fullNamePath is also retrieved from lookupToTop
        rankId: rankPath[i]?.id,
        escrowPersonal: adminDetails?.escrowPersonal || null,
        escrowPersonalHoldPercent: adminDetails?.escrowPersonalHoldPercent || null,
        escrowAgency: adminDetails?.escrowAgency || null,
        escrowAgencyHoldPercent: adminDetails?.escrowAgencyHoldPercent || null,
        escrowGeneration: adminDetails?.escrowGeneration || null,
        escrowGenerationHoldPercent: adminDetails?.escrowGenerationHoldPercent || null,
        blockCommission: adminDetails?.blockCommission || false,
        deactivate: adminDetails?.deactivate || false,
        generation: generationLevel,
        commissionSplitFraction: commissionSplitFractionPath[i] || null,
      });
      generationLevel++
    }
    return formattedProfiles;
  },
  // async teamContributionForPromotion(profileId, activeOnly = 'false') {
  //   const result = [];
  
  //   // Helper function to check if a profile is active
  //   const isProfileActive = (profile) => {
  //     return profile.licenseContracting?.subscriberStatus !== 'Terminated';
  //   };
  
  //   // Helper function to create a simplified profile object
  //   const createProfileObject = (profile) => {
  //     return {
  //       id: profile.id,
  //       fullName: `${profile.firstName} ${profile.lastName}`
  //     };
  //   };
  
  //   // Function to get children profiles
  //   const getChildrenProfiles = async (parentId) => {
  //     const parent = await strapi.entityService.findOne('api::profile.profile', parentId, {
  //       populate: {
  //         childIds: {
  //           populate: {
  //             childId: {
  //               populate: {
  //                 licenseContracting: {
  //                   fields: ['subscriberStatus']
  //                 }
  //               }
  //             },
  //           },
  //         },
  //       },
  //     });
  
  //     if (!parent || !parent.childIds) return [];
  
  //     return parent.childIds.map(child => child.childId);
  //   };
  
  //   // Get first level children
  //   const firstLevelChildren = await getChildrenProfiles(profileId);
  
  //   // Process each first level child
  //   for (const firstLevelChild of firstLevelChildren) {
  //     if (activeOnly === 'true' && !isProfileActive(firstLevelChild)) continue;
  
  //     const firstLevelChildObj = createProfileObject(firstLevelChild);
  //     const secondLevelChildren = await getChildrenProfiles(firstLevelChild.id);
  
  //     const childrenArray = secondLevelChildren
  //       .filter(child => activeOnly !== 'true' || isProfileActive(child))
  //       .map(createProfileObject);
  
  //     result.push([firstLevelChildObj, ...childrenArray]);
  //   }
  
  //   return result;
  // },
  async teamContributionForPromotion(profileId, activeOnly = 'false') {
    const result = [];

    // Helper function to check if a profile is active
    const isProfileActive = (profile) => {
      return profile.licenseContracting?.subscriberStatus !== 'Terminated';
    };

    // Helper function to get date ranges
    const getDateRanges = () => {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      return {
        currentMonth: {
          startDate: currentMonth,
          endDate: now
        },
        lastMonth: {
          startDate: lastMonth,
          endDate: new Date(currentMonth.getTime() - 1)
        },
        twoMonthsAgo: {
          startDate: twoMonthsAgo,
          endDate: new Date(lastMonth.getTime() - 1)
        },
        openEnd: {
          startDate: new Date(0), // Beginning of time
          endDate: now
        }
      };
    };

    // Helper function to create a profile object with revenue data
    const createProfileObject = async (profile) => {
      const dateRanges = getDateRanges();

      const [currentMonthRevenue, lastMonthRevenue, twoMonthAgoRevenue, openEndRevenue] = await Promise.all([
        calculateSettledRevenueFromTransaction(profile.id, dateRanges.currentMonth.startDate, dateRanges.currentMonth.endDate),
        calculateSettledRevenueFromTransaction(profile.id, dateRanges.lastMonth.startDate, dateRanges.lastMonth.endDate),
        calculateSettledRevenueFromTransaction(profile.id, dateRanges.twoMonthsAgo.startDate, dateRanges.twoMonthsAgo.endDate),
        calculateSettledRevenueFromTransaction(profile.id, dateRanges.openEnd.startDate, dateRanges.openEnd.endDate)
      ]);

      return {
        id: profile.id,
        fullName: `${profile.firstName} ${profile.lastName}`,
        currentMonthRevenue: currentMonthRevenue.total,
        lastMonthRevenue: lastMonthRevenue.total,
        twoMonthAgoRevenue: twoMonthAgoRevenue.total,
        openEndRevenue: openEndRevenue.total
      };
    };

    // Function to get children profiles
    const getChildrenProfiles = async (parentId) => {
      const parent = await strapi.entityService.findOne('api::profile.profile', parentId, {
        populate: {
          childIds: {
            populate: {
              childId: {
                populate: {
                  licenseContracting: {
                    fields: ['subscriberStatus']
                  }
                }
              },
            },
          },
        },
      });

      if (!parent || !parent.childIds) return [];

      return parent.childIds.map(child => child.childId);
    };

    // Get first level children
    const firstLevelChildren = await getChildrenProfiles(profileId);

    // Process each first level child
    for (const firstLevelChild of firstLevelChildren) {
      if (activeOnly === 'true' && !isProfileActive(firstLevelChild)) continue;

      const firstLevelChildObj = await createProfileObject(firstLevelChild);
      const secondLevelChildren = await getChildrenProfiles(firstLevelChild.id);

      const childrenArray = await Promise.all(
        secondLevelChildren
          .filter(child => activeOnly !== 'true' || isProfileActive(child))
          .map(createProfileObject)
      );

      result.push([firstLevelChildObj, ...childrenArray]);
    }

    return result;
  },
  
}));
