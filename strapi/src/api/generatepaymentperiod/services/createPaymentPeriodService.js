const paymentCalculation = require('./calculatePayments');
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  createPaymentPeriodService: async (payPeriodDate) => {
    JLOG('createPaymentPeriodService ' + payPeriodDate);
    return strapi.db.transaction(async (trx) => {
      try {
        // Step 1: Update settings.isSettling to true
        await strapi.entityService.update('api::setting.setting', 1, {
          data: {
            isSettling: true
          }
        }, { session: trx });

        // Get payments from the existing service
        const payments = await paymentCalculation.calculatePayments();
        if (!payments || payments.length === 0) {
          throw new Error('No payments to process');
        }

        // Create a payment period with account IDs
        let paymentPeriod = await strapi.entityService.create('api::paymentperiod.paymentperiod', {
          data: {
            payPeriodDate,
            accountIds: payments.map(payment => payment.accountId),
            advisorRevenue: []  // Ensure it is initialized as an empty array
          }
        }, { session: trx });

        // Ensure advisorRevenue is initialized correctly
        paymentPeriod.advisorRevenue = paymentPeriod.advisorRevenue || [];      

        // Process each payment to update accounts and create transactions
        let totalSettledPayment = 0;
        for (const payment of payments) {
          const accountTransactions = [];
          totalSettledPayment += payment.totalPayment;
          // Create account transaction for each settled payment
          const accountTransaction = await strapi.entityService.create('api::accounttransaction.accounttransaction', {
            data: {
              type: 'payroll',
              accountId: payment.accountId,
              amount: payment.totalPayment,
              newBalance: 0,  // Assuming balance update
              paymentPeriodId: paymentPeriod.id
            }
          }, { session: trx });

          accountTransactions.push(accountTransaction);

          // Update the account balance
          await strapi.entityService.update('api::account.account', payment.accountId, {
            data: {
              balance: 0  // Assuming balance update
            }
          }, { session: trx });

          // Fetch child profiles via their linked profiles and then get accounts from those profiles
          const accountWithProfile = await strapi.entityService.findOne('api::account.account', payment.accountId, {
            populate: { profileId: true } // Ensure to populate the profileId field
          }, { session: trx });
          
          if (!accountWithProfile || !accountWithProfile.profileId) {
            throw new Error("Profile not found for the given account");
          }
          
          const parentProfile = accountWithProfile.profileId;
          
          // Now continue with your logic using parentProfile.id
          const childNetworks = await strapi.entityService.findMany('api::network.network', {
            filters: { parentId: parentProfile.id },
            populate: { childId: true }
          }, { session: trx });
          // Convert child profiles to child account IDs
          let childAccountIds = [];
          for (const network of childNetworks) {
            if (network.childId) {
              const childAccount = await strapi.entityService.findOne('api::profile.profile', network.childId.id, {
                populate: {
                  accountId: true // This ensures that the accountId relationship is populated
                },
                session: trx
              });
              // JLOG(childAccount)
              if (childAccount && childAccount.accountId) {
                childAccountIds.push(childAccount.accountId);
              }
            }
          }

          // Gather all transaction IDs, including those already related to the payment
          let allTransactionIds = payment.relatedTransactions.map(t => t.id);
          allTransactionIds.push(...accountTransactions.map(t => t.id));

          //Update transaction with paymentPeriodId
          for (const transactionId of allTransactionIds) {
            await strapi.entityService.update('api::accounttransaction.accounttransaction', transactionId, {
                data: {
                    paymentPeriodId: paymentPeriod.id
                }
            }, { session: trx });
          }
          
          // Calculate fieldRevenue and teamFieldRevenue on agent per payment period level
          let personalFieldRevenue = 0;
          let teamFieldRevenue = 0;
          const agencyTransactions = await strapi.entityService.findMany('api::accounttransaction.accounttransaction', {
            filters: {
              id: { $in: allTransactionIds },
              type: 'commission'
            },
            populate: {
              statementLog: {
                populate: {
                  logId: {
                    populate: {
                      carrierId: {
                        fields: ['id']
                      }
                    }
                  }
                }
              }
            }
          }, { session: trx });

          for (const tx of agencyTransactions) {
            personalFieldRevenue += tx.statementLog.reduce((acc, statementLog) => {
              if (statementLog.source == 'Personal' 
                && statementLog.logId.policyAccountFund != null
                && statementLog.logId.carrierId != null 
                && statementLog.logId.policyAccountFund?.length > 0) {
                return acc + statementLog.fieldRevenue;
              }
              return acc;
            } , 0);
          }
          // Update business case for revenue
          // for (const tx of agencyTransactions) {
          //   for ( const statementLog of tx.statementLog) {
          //     if (statementLog.source == 'Personal' 
          //       && statementLog.logId.policyAccountFund != null
          //       && statementLog.logId.carrierId != null 
          //       && statementLog.logId.policyAccountFund?.length > 0) {
          //     const newCases = await strapi.entityService.findMany('api::newcase.newcase', {
          //       filters: {
          //         $and: [
          //           {
          //             'appInfo.policyAccountNumber': { $ne: null }
          //           },
          //           {
          //             'appInfo.policyAccountNumber': { $ne: '' },
          //           },
          //           {
          //             'appInfo.policyAccountNumber': { $notContains: ' ' }  // Exclude spaces
          //           },
          //           {
          //             'appInfo.policyAccountNumber': { $notContains: '/' }  // Exclude forward slashes
          //           },
          //           {
          //             'appInfo.policyAccountNumber': statementLog.logId.policyAccountFund,
          //           },
          //           {
          //             'appInfo.carrierId.id': statementLog.logId.carrierId.id
          //           }
          //         ]
          //       },
          //       populate: { 
          //         appInfo: {
          //           populate: {
          //             carrierId: {
          //               fields: ['id']
          //             },
          //           }
          //         }, 
          //         commissionLogEntriesIds: true
          //       }
          //     }, { session: trx });  // Note: Ensure your Strapi setup supports transactions
            
          //     console.log(`Found ${newCases.length} matching newCases`);
            
          //     if (newCases.length > 0 && newCases[0]?.appInfo && newCases[0].appInfo?.policyAccountNumber == statementLog.logId.policyAccountFund) {
          //       const newCase = newCases[0];  // Take the first match
          //       console.log('Matched newCase:', JSON.stringify({
          //         id: newCase.id,
          //         policyAccountNumber: newCase.appInfo?.policyAccountNumber,
          //         carrierId: newCase.appInfo?.carrierId?.id
          //       }, null, 2));
            
          //       let updateData = {
          //         // status: 'Paid Settled',
          //         settledDate: statementLog.logId.transactionDate
          //       };
            
          //       if (!newCase.commissionLogEntriesIds.map(cle => cle.id).includes(statementLog.logId.id)) {
          //         updateData.commissionLogEntriesIds = [...newCase.commissionLogEntriesIds, statementLog.logId];
          //       }
            
          //       try {
          //         await strapi.entityService.update('api::newcase.newcase', newCase.id, {
          //           data: updateData
          //         }, { session: trx });
          //         console.log(`Updated newCase with id ${newCase.id}`);
          //       } catch (error) {
          //         console.error(`Error updating newCase with id ${newCase.id}:`, error);
          //       }
          //     } else {
          //       console.log('No matching newCase found for the given criteria');
          //     }
          //       // JLOG(statementLog)
          //       // JLOG(statementLog.fieldRevenue)
  
          //       personalFieldRevenue += statementLog.fieldRevenue || 0;
          //     }
          //     if (statementLog.source === 'Agency') {
          //       teamFieldRevenue += statementLog.teamFieldRevenue || 0;
          //     }
          //   }
          // }
          
          // Append advisor revenue details directly into the payment period's advisorRevenue array
          paymentPeriod.advisorRevenue.push({
            accountId: payment.accountId,
            fieldRevenue: personalFieldRevenue,
            TRXIds: allTransactionIds,
            FLAgentIds: childAccountIds,
            teamFieldRevenue: teamFieldRevenue  // Added field for teamFieldRevenue
          });

        }
        // Finalize updating the payment period with all transaction IDs and advisorRevenues
        await strapi.entityService.update('api::paymentperiod.paymentperiod', paymentPeriod.id, {
          data: {
            advisorRevenue: paymentPeriod.advisorRevenue,  // This now includes all updates
            totalSettledPayment: totalSettledPayment
          }
        }, { session: trx });

        // Generate the monthly metrics records
        const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
        await strapi.service('api::paymentperiod.advisorpayhistory').createAdvisorPaymentMonthlyMetric(yearMonth, 
          { session: trx }
        );

        // Delete all records in paymentperiodpreview collection type
        await strapi.entityService.deleteMany('api::paymentperiodpreview.paymentperiodpreview', {
          filters: {}
        }, { session: trx });

        // Step 3: Update settings.isSettling back to false
        await strapi.entityService.update('api::setting.setting', 1, {
          data: {
            isSettling: false
          }
        }, { session: trx });

        return paymentPeriod;
      } catch (error) {
        // If an error occurs, ensure isSettling is set back to false
        await strapi.entityService.update('api::setting.setting', 1, {
          data: {
            isSettling: false
          }
        }, { session: trx });
        throw error; // Re-throw the error to be handled by the caller
      }
    });
  }
};