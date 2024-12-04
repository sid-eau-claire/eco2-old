'use strict';

// /**
//  * commissionlog controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::commissionlog.commissionlog');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::commissionlog.commissionlog', ({ strapi }) => ({
  async update(ctx) {
    const { id } = ctx.params;
    // Fetch the current entity with its originalStatement
    const existingEntity = await strapi.entityService.findOne('api::commissionlog.commissionlog', id, {
      populate: { originalStatement: true },
    });
    // Proceed with the default update logic
    const response = await super.update(ctx);
    // Check if a new originalStatement is being uploaded and the existing one needs to be removed
    if (ctx.request?.files?.originalStatement && existingEntity?.originalStatement) {
      // If there's an existing file and a new file is being uploaded, delete the old file
      await Promise.all(existingEntity.originalStatement.map(file => strapi.plugins['upload'].services.upload.remove(file)));
    }
    return response;
  },
  

  // Override the default delete function
  async delete(ctx) {
    const { id } = ctx.params;
    // Find all related commissionlogentry records
    const relatedEntries = await strapi.db.query('api::commissionlogentry.commissionlogentry').findMany({
      where: { commissionLogId: id },
    });
    // Delete all related commissionlogentry records
    await Promise.all(
      relatedEntries.map((entry) =>
        strapi.db.query('api::commissionlogentry.commissionlogentry').delete({
          where: { id: entry.id },
        })
      )
    );
    // Find the entity to get the media fields before deletion
    const mediaEntity = await strapi.entityService.findOne('api::commissionlog.commissionlog', id, {
      populate: { originalStatement: true }  // Make sure this matches your actual media field's name and configuration
    });
    if (mediaEntity.originalStatement) {
      await Promise.all(mediaEntity.originalStatement.map(file => strapi.plugins['upload'].services.upload.remove(file)));
      // strapi.log.debug(`Deleting originalStatement: ${entity.originalStatement}`);
    }    
    // Proceed with the deletion of the commissionlog itself
    const response = await super.delete(ctx);
    return response;
  },
}));
