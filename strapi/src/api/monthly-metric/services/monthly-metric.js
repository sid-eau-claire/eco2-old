// 'use strict';

// /**
//  * monthly-metric service
//  */

// const { createCoreService } = require('@strapi/strapi').factories;

// module.exports = createCoreService('api::monthly-metric.monthly-metric');


'use strict';

/**
 * monthly-metric service
 */

const { createCoreService } = require('@strapi/strapi').factories;

const updateOrCreate = async (params, values, { transacting } = {}) => {
  const existingEntry = await strapi.query('api::monthly-metric.monthly-metric').findOne({
    where: params,
    transacting,
  });

  if (existingEntry) {
    return await strapi.query('api::monthly-metric.monthly-metric').update({
      where: { id: existingEntry.id },
      data: values,
      transacting,
    });
  } else {
    return await strapi.query('api::monthly-metric.monthly-metric').create({
      data: { ...params, ...values },
      transacting,
    });
  }
};

module.exports = createCoreService('api::monthly-metric.monthly-metric', ({ strapi }) => ({
  // Extend the default service with custom functions
  updateOrCreate,
}));
