'use strict';
const { createCoreService } = require('@strapi/strapi').factories;
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = createCoreService('api::client.client', ({ strapi }) => ({
  async mergeClients(consolidatedRecordId, recordIds, consolidatedRecord, author) {
    JLOG({ consolidatedRecordId, recordIds, consolidatedRecord, author });
    
    try {
      const result = await strapi.db.transaction(async ({ trx }) => {
        // 1. Update the consolidated client record
        JLOG('step 0');
        await strapi.entityService.update('api::client.client', consolidatedRecordId, {
          data: consolidatedRecord,
        }, { transaction: trx });
        
        // Add comment about client merge
        const commentEndpoint = `comments/api::client.client:${consolidatedRecordId}`;
        const commentBody = {
          content: `Client record updated as part of merge. Merged with client IDs: ${recordIds.filter(id => id != consolidatedRecordId).join(', ')}`,
          author: {
            id: author.id,
            name: author.username, // Assuming author object has a username field
            email: author.email, // Assuming author object has an email field
          },
        };
        
        await strapi.plugins['comments'].services.comment.create(commentEndpoint, commentBody, { trx });
        JLOG('step 1');

        // 2. Update opportunities
        const opportunities = await strapi.entityService.findMany('api::opportunity.opportunity', {
          filters: {
            clientId: {
              id: {
                $in: recordIds
              }
            }
          },
          populate: ['clientId'],
          transaction: trx
        });
        for (const opportunity of opportunities) {
          await strapi.entityService.update('api::opportunity.opportunity', opportunity.id, {
            data: {
              clientId: consolidatedRecordId
            },
            transaction: trx
          });

          // Add comment about opportunity update
          await strapi.entityService.create('api::comment.comment', {
            data: {
              content: `Opportunity updated as part of client merge. Client changed from ${opportunity.clientId.id} to ${consolidatedRecordId}`,
              author: author.id,
              related: [{
                id: opportunity.id,
                __type: 'api::opportunity.opportunity',
                __pivot: { field: 'comments' }
              }]
            },
            transaction: trx
          });
        }
        JLOG('step 2');

        // 3. Update newcases
        const newcases = await strapi.entityService.findMany('api::newcase.newcase', {
          filters: {
            clientId: {
              id: {
                $in: recordIds
              }
            }
          },
          populate: ['clientId'],
          transaction: trx
        });
        for (const newcase of newcases) {
          await strapi.entityService.update('api::newcase.newcase', newcase.id, {
            data: {
              clientId: consolidatedRecordId
            },
            transaction: trx
          });

          // Add comment about newcase update
          await strapi.entityService.create('api::comment.comment', {
            data: {
              content: `Newcase updated as part of client merge. Client changed from ${newcase.clientId.id} to ${consolidatedRecordId}`,
              author: author.id,
              related: [{
                id: newcase.id,
                __type: 'api::newcase.newcase',
                __pivot: { field: 'comments' }
              }]
            },
            transaction: trx
          });
        }
        JLOG('step 3');

        // 4. Mark other clients as deleted and set mergedTo field
        const clientsToDelete = recordIds.filter(id => id != Number(consolidatedRecordId));
        for (const clientId of clientsToDelete) {
          await strapi.entityService.update('api::client.client', clientId, {
            data: {
              deleted: true,
              mergedTo: consolidatedRecordId
            },
            transaction: trx
          });

          // Add comment about client deletion and merge
          await strapi.entityService.create('api::comment.comment', {
            data: {
              content: `Client marked as deleted and merged to client ${consolidatedRecordId}`,
              author: author.id,
              related: [{
                id: clientId,
                __type: 'api::client.client',
                __pivot: { field: 'comments' }
              }]
            },
            transaction: trx
          });
        }
        JLOG('step 4');

        return { success: true, message: 'Clients merged successfully' };
      });
      return result;
    } catch (error) {
      console.error('Error merging clients:', error);
      throw new Error('Failed to merge clients: ' + error.message);
    }
  },
}));