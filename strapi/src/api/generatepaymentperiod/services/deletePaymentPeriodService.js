// path: /src/api/paymentperiod/services/paymentperiod.js
module.exports = {
  async deletePaymentPeriodService(paymentPeriodId) {
    // Retrieve the payment period with all related account IDs
    const paymentPeriod = await strapi.entityService.findOne('api::paymentperiod.paymentperiod', paymentPeriodId, {
      populate: { accountIds: true }
    });

    // If the payment period does not exist, throw an error
    if (!paymentPeriod) {
      throw new Error('Payment period not found');
    }

    // Execute the following operations within a database transaction
    return strapi.db.transaction(async trx => {
      // Loop through each account related to the payment period
      for (let account of paymentPeriod.accountIds) {
        // Find all transactions for the current account that are linked to the payment period
        const transactions = await strapi.entityService.findMany('api::accounttransaction.accounttransaction', {
          filters: { paymentPeriod: paymentPeriodId, accountId: account },
          session: trx
        });

        // Loop through each transaction to create a reverse transaction
        for (let transaction of transactions) {
          const reversedTransaction = {
            accountId: transaction.accountId,
            amount: -transaction.amount, // Reverse the amount to negate the original transaction
            newBalance: transaction.oldBalance, // Optionally revert to the old balance if stored
            type: 'reversal', // Mark the transaction type as reversal
            reversalOfId: transaction.id, // Link to the original transaction
            discriminator: transaction.discriminator,
            description: `Reversal of transaction ${transaction.id}`, // Description for clarity
          };

          // Create the reversed transaction
          await strapi.entityService.create('api::accounttransaction.accounttransaction', {
            data: reversedTransaction,
            session: trx
          });

          // Update the account balance to reflect the reversal
          await strapi.entityService.update('api::account.account', transaction.accountId, {
            data: {
              balance: transaction.oldBalance // Set balance back to old balance
            },
            session: trx
          });
        }
      }

      // After reversing all transactions, delete the payment period
      await strapi.entityService.delete('api::paymentperiod.paymentperiod', { id: paymentPeriodId }, { session: trx });

      // Return the original payment period as a confirmation of deletion
      return paymentPeriod;
    });
  }
};
