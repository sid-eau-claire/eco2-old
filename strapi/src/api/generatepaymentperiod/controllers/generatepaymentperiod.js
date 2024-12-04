'use strict';

const rank = require("../../rank/controllers/rank");
const { calculatePersonalCommission, calculateAgencyCommission, calculateGenerationCommission } = require('../services/commissionCalculator');
const { createPaymentPreviewRecords} = require('../services/createPaymentPreviewRecords');
const {  createCommissionTransaction } = require('../services/commissionTransaction');
const { calculatePayments } = require('../services/calculatePayments');
const { createPaymentPeriodService } = require('../services/createPaymentPeriodService');
const { deletePaymentPeriodService } = require('../services/deletePaymentPeriodService');

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async commissionTransaction(ctx) {
    // Check if a process is already running
    const currentSettings = await strapi.entityService.findMany('api::setting.setting', {
      fields: ['isGeneratingPayroll'],
      populate: { },
    });
    if (currentSettings.isGeneratingPayroll) {
      return ctx.send({ message: 'A payroll generation process is already running', error: 'Process already running' }, 409);
    }

    const { db } = strapi;
    // Start a new transaction
    const trx = await db.transaction();
    try {
      // Check if a process is already running
      // const currentSettings = await strapi.entityService.findMany('api::setting.setting', {
      //   fields: ['isGeneratingPayroll'],
      //   populate: { },
      // });
      // if (currentSettings.isGeneratingPayroll) {
      //   await trx.rollback();
      //   return ctx.send({ message: 'A payroll generation process is already running', error: 'Process already running' }, 409);
      // }
      // Set isGeneratingPayroll to true
      await strapi.entityService.update('api::setting.setting', currentSettings.id, {
        data: { isGeneratingPayroll: true },
        transaction: trx,
      });
      // Calculate payment preview
      const previews = await this.calculatePaymentPreview(ctx);
      if (previews == null) {
        await trx.rollback();
        return ctx.send({ message: 'No commission logs found', error: 'No commission logs found' }, 200);
      }
      // Create commission transaction
      const result = await createCommissionTransaction(previews.paymentPeriodPreview, previews.paymentsPreview, previews.commissionLogs);
      if (result?.status === 'error') {
        await trx.rollback();
        return ctx.send({ message: 'Create transaction failed', error: 'Create transaction failed', detail: result }, 400);
      }
      // Log the result
      JLOG(result);
      // Set isGeneratingPayroll back to false
      await strapi.entityService.update('api::setting.setting', currentSettings.id, {
        data: { isGeneratingPayroll: false },
        transaction: trx,
      });
      // Commit the transaction
      await trx.commit();
      return ctx.send({ message: 'Commission transaction created', status: 'success' }, 200);
    } catch (error) {
      // If any error occurs, rollback the transaction
      await trx.rollback();
      console.error('Error in commissionTransaction:', error);
      return ctx.send({ message: 'An error occurred during the commission transaction process', error: error.message }, 500);
    }
  },
  async generatePaymentPreview(ctx) {
    const previews = await this.calculatePaymentPreview(ctx);
    // If no commission logs are found, return an error message.  
    if ( previews == null) {
      ctx.send({ message: 'No commission logs found', error: 'No commission logs found' }, 200);
      return
    }
    const result = await createPaymentPreviewRecords(previews.paymentPeriodPreview, previews.paymentsPreview);
    if ( result == null) {
      ctx.send({ message: 'No commission logs found', error: 'No commission logs found' }, 200);
    }
    return previews;
  },
  async calculatePaymentPreview(ctx) {
    // Define required services, similar to the original function.
    const commissionLogService = strapi.service('api::commissionlog.commissionlog');
    const commissionDistributionService = strapi.service('api::commissiondistribution.commissiondistribution');
    const rankService = strapi.service('api::rank.rank');
    const networkService = strapi.service('api::network.network');
    try {
      // Step 1: Fetch commission distribution settings, similar to the original function.
      const commissionDistributionSettingsResult = await commissionDistributionService.find({
        filters: { isActive: true },
        populate: {
          generalSettings: true,
          rankOverrides: {
            populate: {
              rankId: true,
            }
          },
          generationOverrides: true,
          largeCaseSettings: true
        },
      });
      const commissionDistributionSettings = commissionDistributionSettingsResult.results[0];
      const ranks = await rankService.find();

      // Utility functions to get rank values and codes, similar to the original.
      const rankValue = (rankId) => ranks.results.find(rank => rank.id === rankId).rankValue;
      const rankCode = (rankId) => ranks.results.find(rank => rank.id === rankId).rankCode;

      // Step 2: Fetch all commission logs not linked to a payment period.
      const commissionLogs = await strapi.entityService.findMany('api::commissionlog.commissionlog', {
        filters: {
          payrollStatus: {
            $in: ['Current Pay Run']
          }
        },
        populate: {
          paymentPeriodId: true,
          commissionLogEntryIds: {
            populate: {
              writingAgentId: {
                populate: { account: true, rankId: true, administrative: true }
              },
              splitAgent1Id: {
                populate: { account: true, rankId: true, administrative: true }
              },
              splitAgent2Id: {
                populate: { account: true, rankId: true, administrative: true }
              },
              splitAgent3Id: {
                populate: { account: true, rankId: true, administrative: true }
              },
            },
          },
        },
        limit: -1 // Set to -1 to remove the limit and fetch all records
      });
      
      // JLOG(commissionLogs)
      if (!commissionLogs || commissionLogs.length === 0) {
        return null
      }
      let paymentsMap = new Map();
      //step 8: Generate commission
      strapi.log.debug('Step 8: Generate commission')
      // strapi.log.debug(commissionLogs.commissionLogEntries)
      // JLOG(commissionLogs)
      let totalCommissionDeposited = 0;
      let fieldPayDate = null
      for (const commissionLog of commissionLogs) {
        totalCommissionDeposited += commissionLog.deposit;
        if (fieldPayDate == null) {
          fieldPayDate = commissionLog.fieldPayDate;
        }
        for (const entry of commissionLog.commissionLogEntryIds) {
          const agentIds = [
            {agent: entry.writingAgentId, splitPercentage: entry.writingAgentPercentage},
            {agent: entry.splitAgent1Id, splitPercentage: entry.splitAgent1Percentage},
            {agent: entry.splitAgent2Id, splitPercentage: entry.splitAgent2Percentage},
            {agent: entry.splitAgent3Id, splitPercentage: entry.splitAgent3Percentage},
          ]
          for ( const {agent, splitPercentage} of agentIds) {
            if (!agent ||  !splitPercentage || !agent.id) {
            } else {
              // Determine if the agent is deactivated
              if (agent.administrative?.deactivate) {
                continue; // Skip this agent as instructed
              }
              // Determine personalCommission
              let personalCommission = null
              personalCommission = await calculatePersonalCommission(rankCode, agent, entry, commissionDistributionSettings, splitPercentage);
              if (personalCommission == null || personalCommission.commission == null) {
                throw new Error(`personalCommission is null for ${agent.id}`)
              }
              // Find existing payment info for the profile
              if (!paymentsMap.has(agent.id)) {
                // If there's no existing entry for this agent, create one
                paymentsMap.set(agent.id, {
                    profileId: agent.id,
                    totalPersonalAmount: personalCommission.commission,
                    totalAgencyAmount: 0,
                    totalGenerationAmount: 0,
                    totalFieldRevenue: personalCommission.fieldRevenue,
                    totalTeamFieldRevenue: 0,
                    totalEscrowAmount: 0,
                    statementLog: [personalCommission]
                });
              } else {
                  // If an entry exists, update it
                  let paymentInfo = paymentsMap.get(agent.id);
                  paymentInfo.totalPersonalAmount += personalCommission.commission;
                  paymentInfo.totalEscrowAmount += personalCommission.escrow;
                  paymentInfo.totalFieldRevenue += personalCommission.fieldRevenue;
                  paymentInfo.statementLog.push(personalCommission);
                  paymentsMap.set(agent.id, paymentInfo);
              }
              // Step 9: Generate commission for Agency for network.
              // JLOG(agent)
              // JLOG(agent.rankId.rankValue)
              if (agent.rankId.rankValue < 2000) {
                const agencies = await networkService.agencyNetwork(agent.id);
                for (const agency of agencies) {
                  // Check if the agency is deactivated
                  if (agency.administrative?.deactivate) {
                    continue; // Skip this agent as instructed
                  }
                  let agencyCommission = null;
                  agencyCommission = await calculateAgencyCommission(rankCode, splitPercentage, agency, personalCommission, commissionDistributionSettings);
                  if (agencyCommission == null) {
                    continue
                  }
                  if (!paymentsMap.has(agency.id)) {
                    // If there's no existing entry for this agency, create one
                    paymentsMap.set(agency.id, {
                    profileId: agency.id,
                    totalPersonalAmount: 0,
                    totalAgencyAmount: agencyCommission.commission,
                    totalGenerationAmount: 0,
                    totalFieldRevenue: 0,
                    totalTeamFieldRevenue: 0,
                    totalEscrowAmount: 0,
                    statementLog: [agencyCommission]
                    });
                    // JLOG(agencyCommission)
                  } else {
                    let apaymentInfo = paymentsMap.get(agency.id);
                    apaymentInfo.totalTeamFieldRevenue += agencyCommission.totalFieldRevenue;
                    apaymentInfo.totalAgencyAmount += agencyCommission.commission;
                    apaymentInfo.totalEscrowAmount += agencyCommission.escrow;
                    apaymentInfo.statementLog.push(agencyCommission);
                    paymentsMap.set(agency.id, apaymentInfo);                  
                  }
                }
              }
              // Step 10: Generate commission for Generation for network.
              if (agent.rankId.rankValue == 2000) {
                const generations = await networkService.generationNetwork(agent.id);
                if (generations.length > 0 ) {
                  for (const generation of generations) {
                    // If the agent is the MP
                    if (generation.id == agent.id) {
                      continue;
                    }
                    let generationCommission = null;
                    generationCommission = await calculateGenerationCommission(rankCode,generation, commissionDistributionSettings.generationOverrides,  personalCommission, splitPercentage);
                    // if (agent.id == 370 ){
                    //   JLOG(generation)
                    //   JLOG(generationCommission)
                    //   return
                    // }
                    if (generationCommission == null) {
                      throw new Error(`generationCommission is null for ${generation.id})` );
                    }
                    // JLOG(generationCommission)
                    if (!paymentsMap.has(generation.id)) {
                      // If there's no existing entry for this generation, create one
                      paymentsMap.set(generation.id, {
                          profileId: generation.id,
                          totalPersonalAmount: 0,
                          totalAgencyAmount: 0,
                          totalGenerationAmount: generationCommission.commission,
                          totalFieldRevenue: 0,
                          totalTeamFieldRevenue: 0,
                          statementLog: [generationCommission]
                      });
                    } else {
                        // If an entry exists, update it
                        let gpaymentInfo = paymentsMap.get(generation.id);
                        gpaymentInfo.totalGenerationAmount += generationCommission?.commission || 0;
                        gpaymentInfo.statementLog.push(generationCommission);
                        paymentsMap.set(generation.id, gpaymentInfo);
                    } 
                  }
                  // JLOG(paymentsMap)
                  // if (agent.id == 370) {
                  //   return
  
                  // }
                }
              }
            }
          }
        }
      }
      // To prepare the paymentPreview and paymentPeriodPreview records
      let paymentsPreview = Array.from(paymentsMap.values());
      // JLOG(paymentsPreview)
      let paymentPeriodPreview = null
      let commissionLogsInPaymentPeriod = []
      let paymentPeriodPersonalAmount = 0;
      let paymentPeriodAgencyAmount = 0;
      let paymentPeriodGenerationAmount = 0;
      let paymentPeriodEscrowAmount = 0;
      for (const paymentInfo of paymentsPreview) {
        paymentPeriodPersonalAmount += isNaN(paymentInfo?.totalPersonalAmount) ? 0 : paymentInfo.totalPersonalAmount;
        paymentPeriodAgencyAmount += isNaN(paymentInfo?.totalAgencyAmount) ? 0 : paymentInfo.totalAgencyAmount;
        paymentPeriodGenerationAmount += isNaN(paymentInfo?.totalGenerationAmount) ? 0 : paymentInfo.totalGenerationAmount;
        paymentPeriodEscrowAmount += isNaN(paymentInfo?.totalEscrowAmount) ? 0 : paymentInfo.totalEscrowAmount;
      }
      for (const commissionLog of commissionLogs) {
        commissionLogsInPaymentPeriod.push(commissionLog.id);
      }
      paymentPeriodPreview = {
        payPeriodDate: fieldPayDate,
        totalPersonalAmount: paymentPeriodPersonalAmount,
        totalAgencyAmount: paymentPeriodAgencyAmount,
        totalGenerationAmount: paymentPeriodGenerationAmount,
        totalEscrowAmount: paymentPeriodEscrowAmount,
        commissionLogs: commissionLogsInPaymentPeriod,
        totalCommissionDeposited: totalCommissionDeposited,
      };
      JLOG('paymentPeriodPreview')
      JLOG(paymentPeriodPreview)
      JLOG(paymentsPreview)
      JLOG('paymentPeriodPreview End')
      // Send the calculated payments preview as a response.
      return { paymentPeriodPreview, paymentsPreview, commissionLogs }
    } catch (error) {
      return { message: 'Operation failed', error: error.message, stack: error.stack.split('\n'), details: error.details };
    }
  },
  async calculatePayments(ctx) {
    // JLOG('calculatePayment')
    const profileId = ctx?.query?.profileId || null;
    try {
      const result = await calculatePayments(profileId);
      // JLOG(result)
      ctx.body = {
        data: result,
        pagination: {
          page: 1,
          pageSize: 5000,
          pageCount: 1,
          total: result.length,
        }
      }
    } catch (err) {
      ctx.body = err;
      ctx.status = 500;
    }
  },
  async createPaymentPeriod(ctx) {
    const { db } = strapi;
    // Start a new transaction
    const trx = await db.transaction();
    // Check if a process is already running
    const currentSettings = await strapi.entityService.findMany('api::setting.setting', {
      fields: ['id', 'isSettling'],
      populate: { },
    });
    if (currentSettings.isSettling) {
      // await trx.rollback();
      return ctx.send({ message: 'A Settling process is already running', error: 'Process already running' }, 409);
    }
    try {
      const content = JSON.parse(ctx.request.body);
      const data = content.data;
      // Set isSettling to true
      await strapi.entityService.update('api::setting.setting', currentSettings.id, {
        data: { isSettling: true },
        transaction: trx,
      });
      // Perform the main operation
      const result = await createPaymentPeriodService(data?.payPeriodDate);
      // If everything is successful, commit the transaction
      await trx.commit();
      return ctx.send({ message: 'Payment period created successfully', data: result }, 200);
    } catch (error) {
      // If any error occurs, rollback the transaction
      await trx.rollback();
      return ctx.throw(500, error.message);
    } finally {
      // Always set isSettling back to false, even if an error occurred
      try {
        const currentSettings = await strapi.entityService.findMany('api::setting.setting', {
          fields: ['id'],
          populate: { }, 
        });
        await strapi.entityService.update('api::setting.setting', currentSettings.id, {
          data: { isSettling: false },
        });
      } catch (finallyError) {
        console.error('Error resetting isSettling flag:', finallyError);
      }
    }
  },
  async deletePaymentPeriod(ctx) {
    const { id } = ctx.params;
    try {
      const deletedPaymentPeriod = await strapi.services.paymentperiod.deletePaymentPeriodAndReverseTransactions(id);
      return ctx.send({ message: 'Payment period deleted and transactions reversed.', data: deletedPaymentPeriod });
    } catch (error) {
      return ctx.badRequest('Error deleting payment period', { error });
    }
  }  
};
