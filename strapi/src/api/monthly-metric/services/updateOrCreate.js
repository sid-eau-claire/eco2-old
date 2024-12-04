module.exports = {
  async updateOrCreate(params, values, { transacting } = {}) {
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
  },
};
