const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

async function createPaymentPreviewRecords(paymentPeriodPreview, paymentsPreview) {
  await strapi.db.transaction(async (trx) => {
    JLOG(trx)
    try {
      // Use `findMany` with filters and limit to get the equivalent of `findOne`
      const existingPaymentPeriods = await strapi.entityService.findMany('api::paymentperiodpreview.paymentperiodpreview', {
        filters: {
          status: 'preview',
        },
        limit: 1,
        transaction: trx
      });

      let existingPaymentPeriod = existingPaymentPeriods.length > 0 ? existingPaymentPeriods[0] : null;

      if (existingPaymentPeriod) {
        console.log(`Found existing payment period with ID: ${existingPaymentPeriod.id}`);
        // Correct deletion of all related payments
        const payments = await strapi.entityService.findMany('api::paymentpreview.paymentpreview', {
          filters: {
            paymentPeriodId: existingPaymentPeriod.id,
            status: 'preview'
          },
          transaction: trx
        });
        // Delete each payment
        for (const payment of payments) {
          await strapi.entityService.delete('api::paymentpreview.paymentpreview', payment.id, {
            transaction: trx
          });
        }
        // Then delete the payment period
        await strapi.entityService.delete('api::paymentperiodpreview.paymentperiodpreview', existingPaymentPeriod.id, {
          transaction: trx
        });
    }
    

      const paymentPeriod = await strapi.entityService.create('api::paymentperiodpreview.paymentperiodpreview', {
        data: {
          payPeriodDate: paymentPeriodPreview?.payPeriodDate,
          // totalCommissionDeposited: 0,
          totalPersonalAmount: paymentPeriodPreview?.totalPersonalAmount,
          totalAgencyAmount: paymentPeriodPreview?.totalAgencyAmount,
          totalGenerationAmount: paymentPeriodPreview?.totalGenerationAmount,
          totalPostMarkupRevenue: 0,
          totalCommissionDeposited: paymentPeriodPreview?.totalCommissionDeposited,
          status: 'preview'
        },
        transaction: trx
      });

      console.log(`Created payment period with ID: ${paymentPeriod.id}`);

      // Create payment records linked to the payment period
      for (const payment of paymentsPreview) {
        await strapi.entityService.create('api::paymentpreview.paymentpreview', {
          data: {
            paymentPeriodPreviewId: paymentPeriod.id,
            payPeriodDate: paymentPeriod?.payPeriodDate,
            profileId: payment.profileId,
            totalPersonalAmount: payment.totalPersonalAmount,
            totalAgencyAmount: payment.totalAgencyAmount,
            totalGenerationAmount: payment.totalGenerationAmount,
            totalFieldRevenue: payment.totalFieldRevenue || 0,
            status: 'preview',
            statementLog: payment.statementLog.map(log => ({
              source: log.source,
              logId: log.logId,
              generation: log.generation,
              level: log.level,
              levelPercentage: log.levelPercentage,
              fieldRevenue: log.fieldRevenue,
              commission: log.commission,
              escrow: log.escrow,
              calculation: JSON.stringify(log.calculation),
            }))
          },
          transaction: trx
        });
      }
      
      // Commit transaction manually if no exceptions
      await trx.commit();

      return { paymentPeriod, payments: paymentsPreview };

    } catch ( error ) {
      console.error('Failed to create payment records within transaction:', error);
      await trx.rollback();
      throw error; // This will ensure the transaction is rolled back
    }
  });
}

module.exports = {
  createPaymentPreviewRecords
};
