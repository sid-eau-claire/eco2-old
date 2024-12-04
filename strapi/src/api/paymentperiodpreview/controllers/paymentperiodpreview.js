// 'use strict';

// /**
//  * paymentperiodpreview controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::paymentperiodpreview.paymentperiodpreview');

// 'use strict';

// /**
//  * paymentperiod controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::paymentperiod.paymentperiod');


'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::paymentperiodpreview.paymentperiodpreview', ({ strapi }) => ({
  async delete(ctx) {
    const { id } = ctx.params;

    try {
      // Find all related payment records
      const relatedPayments = await strapi.db.query('api::paymentpreview.paymentpreview').findMany({
        where: { paymentPeriodId: id },
      });

      // Delete all related payment records
      await Promise.all(
        relatedPayments.map(payment =>
          strapi.db.query('api::paymentpreview.paymentpreview').delete({
            where: { id: payment.id },
          })
        )
      );

      // Proceed with the deletion of the paymentperiod itself
      const response = await super.delete(ctx);
      return response;
    } catch (error) {
      // Log the error
      console.error('Delete operation failed:', error);
      // Re-throw the error or handle it as per your application's error handling policy
      throw error;
    }
  },
}));
