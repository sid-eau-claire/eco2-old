const rank = require("../../rank/controllers/rank");

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

function referenceAgency(entry) {
  const { profilePath, rankPath } = entry;
  // Consider the first item as the current item
  const currentProfileId = profilePath[0];
  const currentRank = rankPath[0];
  // Ignore the 2000 rule if it's the first item
  let highestRank = null;
  for (let i = 1; i < rankPath.length; i++) {
      const rank = rankPath[i];
      if (!highestRank || (rank.rankValue > highestRank.rankValue && !(rank.rankValue === 2000 && i !== 0))) {
          highestRank = { ...rank, profileId: profilePath[i], index: i };
      }
  }
  // If there is no highest rank found and the first rank is 2000, return the first item as reference node
  if (!highestRank && currentRank.rankValue === 2000) {
      return { ...currentRank, profileId: currentProfileId, index: 0, tie: false, firstLevelTie: true };
  }
  // Return null for specific conditions
  if (!highestRank || highestRank.rankValue > currentRank.rankValue) {
      return null;
  }
  // Check for ties
  if (highestRank.rankValue === currentRank.rankValue) {
      let hasIntermediateSameRank = false;
      for (let i = highestRank.index + 1; i < profilePath.indexOf(currentProfileId); i++) {
          if (rankPath[i].rankValue === highestRank.rankValue) {
              hasIntermediateSameRank = true;
              break;
          }
      }

      if (hasIntermediateSameRank) {
          return null;
      } else {
          return { ...highestRank, tie: true, firstLevelTie: false };
      }
  }
  // Return the highest rank if it's valid and less than the current rank
  if (highestRank.rankValue <= currentRank.rankValue) {
      return { ...highestRank, profileId: profilePath[highestRank.index] };
  }
  return null;
  //sample return
  // {
  //   "id": 5,
  //   "rankValue": 2000,
  //   "profileId": 5,
  //   "index": 0,
  //   "tie": false,
  //   "firstLevelTie": true
  // }  
}

const calculatePersonalCommission = async (RankCode, agent, entry, commissionDistributionSettings, splitPercentage) => {
  try {
    // JLOG(entry);
    // Step 1: Find the profile using entry.writingAgentId
    let commission = 0
    let escrow = 0
    const profile = agent;

    // Step 2: Find its rankId.id and rank code
    const rankId = profile.rankId.id;
    // const level = profile.rankId.rankCode;

    // Step 3: Find the commission percentage by the rankId.id
    let commissionPercentage = commissionDistributionSettings.rankOverrides.find(ro => ro.rankId.id === rankId)?.override || 0;

    // Step 4: If administrative override is set, use it
    if (agent.administrative && 
      agent.administrative.overrideCommission && 
      agent.administrative.commissionOverridePercent && 
      /^\d{1,2}(\.\d{1,2})?$/.test(agent.administrative.commissionOverridePercent)) {
      commissionPercentage = agent.administrative.commissionOverridePercent;
    }

    // Step 5: Determine the corporate margin percent
    let corporateMarginPercent;
    switch (entry.productCategory) {
      case 'Investments':
        corporateMarginPercent = commissionDistributionSettings.generalSettings.find(setting => setting.name === 'corporateMarginPercentInvestment').value;
        break;
      case 'Affiliates':
        corporateMarginPercent = commissionDistributionSettings.generalSettings.find(setting => setting.name === 'corporateMarginPercentAffiliates').value;
        break;
      default:
        corporateMarginPercent = commissionDistributionSettings.generalSettings.find(setting => setting.name === 'corporateMarginPercentDefault').value;
    }
    
    // Step 6: Calculate the fieldRevenue
    const fieldRevenue = entry.postMarkupRevenue * (1 - (corporateMarginPercent / 100))  * (splitPercentage / 100);
    // const fieldRevenue = entry.receivedRevenue * (1 - (corporateMarginPercent / 100));

    // Step 7: Calculate the commission
    commission = fieldRevenue * (commissionPercentage / 100) 

    // Step 8: Check if Personal Escrow is enabled or not
    if (agent.administrative && agent.administrative.personalEscrow && agent.administrative.personalEscrow == true) {
      escrow = commission * (agent.administrative.personalEscrowPercentage / 100);
      commission = commission - escrow; 
    }
    
    // Step 9: If this is large case
    let largeCase = false;
    // JLOG(commissionDistributionSettings);
    let largeCaseThreshold = commissionDistributionSettings.largeCaseSettings.find(setting => setting.name === 'largeCaseThreshold').value;
    let firstMonthCommission = commissionDistributionSettings.largeCaseSettings.find(setting => setting.name === 'firstMonthCommission').value;
    if (commission > largeCaseThreshold) {
      escrow = commission - firstMonthCommission
      commission = firstMonthCommission
      largeCase = true;
    }


    // Step 10: Return the object
    return {
      source: 'Personal',
      logId: entry.id,
      generation: 0,
      level: RankCode(rankId),
      levelPercentage: commissionPercentage,
      fieldRevenue: fieldRevenue,
      commission: commission,
      escrow: escrow,
      calculation: {
        'rankId': rankId, 
        'commissionPercentage': commissionPercentage, 
        'corporateMarginPercent': corporateMarginPercent,
        'escrowPersonalPercent': agent.administrative?.personalEscrowPercentage | 0,
        'largeCase': largeCase,
      }
    };

  } catch (error) {
    // Handle any errors
    strapi.log.error("Error calculating personal commission:", error);
    throw error;
  }
};

// // Expose the function for use
// module.exports = {
//   calculatePersonalCommission,
// };

function calculateAgencyCommission(rankCode, splitPercentage, agency, personalCommission, commissionDistributionSettings) {
  let referenceRankOverride = 0;
  let agentRankOverride = 0;
  let deltaPercentage = 0;
  let agencyId = agency.id;
  let agencyRankId = agency.rankPath[0].id;
  let rootCommissionSplitFraction = 1;
  let commission = 0;
  let escrow = 0;
  // 1. Find the rank id as the start point for delta calculation
  const reference = referenceAgency(agency);
  if (reference == null) {
    return null
  }
  // JLOG(commissionDistributionSettings.rankOverrides)
  // Find the override percentage for the current rank ID
  const referenceRankOverrideObj = commissionDistributionSettings.rankOverrides.find(override => override.rankId.id === reference.id);
  if (referenceRankOverrideObj) {
      referenceRankOverride = referenceRankOverrideObj.override;
  }

  // Find the override percentage for the agent's rank ID
  const agentRankOverrideObj = commissionDistributionSettings.rankOverrides.find(override => override.rankId.id === agencyRankId );
  // strapi.log.debug(`Agent rank override object: ${JSON.stringify(agentRankOverrideObj)}`);
  if (agentRankOverrideObj) {
      agentRankOverride = agentRankOverrideObj.override;
  }

  // Calculate the delta of the commission percentages
  deltaPercentage = agentRankOverride - referenceRankOverride;
  if (reference.tie && reference.firstLevelTie) {
    deltaPercentage = commissionDistributionSettings.generalSettings.find(setting => setting.name === 'rankTieBorrowPercent').value / 100;
  } else if (reference.tie && !reference.firstLevelTie) {
    deltaPercentage = deltaPercentage - (commissionDistributionSettings.generalSettings.find(setting => setting.name === 'rankTieBorrowPercent').value / 100);
  }
  for (const rootSplitFraction of agency.commissionSplitFraction) {
    rootCommissionSplitFraction = rootCommissionSplitFraction * rootSplitFraction;
  }

  // If you are MP level the agent and the first agency are the same rank
  if (agency.rankPath.length > 2 && agency.rankPath[agency.rankPath.length - 1].rankValue === agency.rankPath[agency.rankPath.length - 2].rankValue) {
    deltaPercentage = deltaPercentage - 2
  }
  // finalCommissionSplitFraction = 1
  deltaPercentage = deltaPercentage * rootCommissionSplitFraction
  // strapi.log.debug(`Delta percentage: ${deltaPercentage}`);

  // Calculate the commission based on the personal commission and delta percentage
  commission = personalCommission.fieldRevenue * (splitPercentage / 100 ) * (deltaPercentage / 100);
  if ( agency.escrowAgency ) {
    commission = commission * (1 - (agency.agencyEscrowPercentage / 100))
    escrow = commission * (agency.agencyEscrowPercentage / 100)
  }
  // 3. Output the result in the specified format
  const result = {
      "source": "Agency",
      "logId": personalCommission.logId,
      "generation": 0,
      "levelPercentage": deltaPercentage,
      "level": rankCode(agency.rankPath[agency.rankPath.length - 1].id),
      "fieldRevenue": personalCommission.fieldRevenue,
      "teamFieldRevenue": personalCommission.fieldRevenue * (splitPercentage / 100) * (rootCommissionSplitFraction),
      "commission": commission,
      "escrow": escrow,
      "calculation": {
        agentRankId: agencyRankId,
        agentRankOverride: agentRankOverride,
        tie: reference.tie,
        firstLevelTie: reference.firstLevelTie,
        referenceAgent: reference,
        referenceRankOverride: referenceRankOverride,
        splitPercentage: splitPercentage,
        rootCommissionSplitFraction: rootCommissionSplitFraction,
        commissionSplitFraction: agency.commissionSplitFraction,
        escrowAgency: agency?.escrowAgency || false,
        escrowAgencyPercent: agency?.agencyEscrowPercentage || 0,
      }
  };

  return result;
}
function calculateGenerationCommission(rankCode, generation, generationOverrides, personalCommission, splitPercentage) {
  // Lookup the generation percentage override based on the generation count
  // strapi.log.debug(`Generation: ${generation.Overrides}`)
  let rootCommissionSplitFraction = 1;
  let generationOverride = 0;
  let commission = 0
  let escrow = 0
  if (generation.id == personalCommission.agentId) {
    return null
  }
  // JLOG(generations)
  const currentRankOverrideObj = generationOverrides.find(override => override.level === generation.generation);
  if (currentRankOverrideObj) {
    generationOverride = currentRankOverrideObj.value;
  }
  for (const rootSplitFraction of generation.commissionSplitFraction) {
    rootCommissionSplitFraction = rootCommissionSplitFraction * rootSplitFraction 
  }
 
  // Calculate the commission based on the field revenue, split percentage, and generation override
  commission = personalCommission.fieldRevenue * (splitPercentage / 100) * (generationOverride / 100) * rootCommissionSplitFraction;
  if (generation.escrowGeneration) {
    commission = commission * (1 - (generation.generationEscrowPercentage / 100))
    escrow = commission * (generation.generationEscrowPercentage / 100)
  }


  // Prepare the result object with the calculated commission and other relevant details
  const result = {
    "source": "Generational",
    "logId": personalCommission.logId,
    "generation": generation.generation,
    "levelPercentage": generationOverride,
    "level": "MP",
    "fieldRevenue": personalCommission.fieldRevenue,
    "commission": commission,
    "escrow": escrow, 
    "calculation": {
      "generationId": generation.id,
      "generationRankId": generation.rankId,
      "generationOverride": generationOverride,
      "splitPercentage": splitPercentage,
      "rootCommissionSplitFraction": rootCommissionSplitFraction,
      "commissionSplitFraction": generation.commissionSplitFraction,
      "escrowGeneration": generation.escrowGeneration,
      "escrowGenerationPercent": generation.generationEscrowPercentage,
    }
  };
  return result;
}


module.exports = {
  calculatePersonalCommission,
  calculateAgencyCommission,
  calculateGenerationCommission
};

