'use strict';

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

async function createCommissionTransaction(paymentPeriodPreview, paymentsPreview, commissionLogs) {
  try {
    // Start a transaction
    await strapi.db.transaction(async (trx) => {
      try {
        for (const payment of paymentsPreview) {
          // Find the accountId based on profileId
          const account = await strapi.db.query('api::account.account').findOne({
            where: { profileId: payment.profileId },
          });

          if (!account) {
            strapi.log.error(`No account found for profileId: ${payment.profileId.id}`);
            continue;
          }
          const accountTransaction = await strapi.entityService.create('api::accounttransaction.accounttransaction', {
            data: {
              accountId: account.id,
              amount: (payment.totalAgencyAmount  || 0) + (payment.totalPersonalAmount  || 0) + (payment.totalGenerationAmount || 0),
              newBalance: account.balance + (payment.totalAgencyAmount  || 0) + (payment.totalPersonalAmount  || 0) + (payment.totalGenerationAmount  || 0),
              amountHold: payment.totalEscrowAmount || 0,
              newHoldBalance: account.hold + (payment.totalEscrowAmount  || 0),
              description: `Transaction for profile ${payment.profileId.id}`,
              type: 'commission',
              statementLog: payment.statementLog.map(log => ({
                ...log,
                calculation: typeof log.calculation === 'object' ? JSON.stringify(log.calculation) : log.calculation
              })),
              status: 'preview',
            },
            transaction: trx,
          });
          await strapi.entityService.update('api::account.account', account.id, {
            data: {
              balance: account.balance + (payment.totalAgencyAmount || 0) + (payment.totalPersonalAmount  || 0) + (payment.totalGenerationAmount  || 0),
              hold: account.hold + payment.totalEscrowAmount || 0,
            },
            transaction: trx,
          });
          // Loop through each statement log entry in the payment preview
        }
        for (const commissionLog of commissionLogs) {
          await strapi.entityService.update('api::commissionlog.commissionlog', commissionLog.id, {
            data: {
              payrollStatus: 'Processed',
            },
            transaction: trx,
          });
        }  
        // Commit transaction manually if no exceptions
        await trx.commit();

        return { status: 'success' };

      } catch (error) {
        console.error('Failed to create payment records within transaction:', error);
        await trx.rollback();
        throw error; // This will ensure the transaction is rolled back
      }
    });
  } catch (error) {
    strapi.log.error('Failed to process createCommissionTransaction:', error);
    return {status: 'error', error: error};
  }
}

module.exports = {
  createCommissionTransaction,
};
