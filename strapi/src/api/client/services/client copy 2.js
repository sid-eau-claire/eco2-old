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
        const commentBody = {
          content: `Client record updated as part of merge. Merged with client IDs: ${recordIds.filter(id => id != consolidatedRecordId).join(', ')}`,
          author: {
            id: author.id,
            name: author.username || 'Unknown',
            email: author.email || 'unknown@example.com',
          },
        };

        const commentService = strapi.plugin('comments').service('client');
        await commentService.create(`api::client.client:${consolidatedRecordId}`, commentBody, author);

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
          const opportunityCommentBody = {
            content: `Opportunity updated as part of client merge. Client changed from ${opportunity.clientId.id} to ${consolidatedRecordId}`,
            author: {
              id: author.id,
              name: author.username || 'Unknown',
              email: author.email || 'unknown@example.com',
            },
          };

          await commentService.create(`api::opportunity.opportunity:${opportunity.id}`, opportunityCommentBody, author);
        }
        JLOG('step 2');

        // 3. Update newcases
        const integerRecordIds = recordIds.map(id => parseInt(id, 10));
        // Query for newcases
        const newcases = await strapi.entityService.findMany('api::newcase.newcase', {
          filters: {
            clientId: {
              id: {
                $in: recordIds
              }
            }
          },
          populate: ['clientId'],
        });      
        // const newcases = await strapi.entityService.findMany('api::newcase.newcase', {
        //   filters: {
        //     clientId: {
        //       id: {
        //         $in: recordIds
        //       }
        //     }
        //   },
        //   populate: ['clientId'],
        //   transaction: trx
        // });
        JLOG(newcases)
        for (const newcase of newcases) {
          await strapi.entityService.update('api::newcase.newcase', newcase.id, {
            data: {
              clientId: consolidatedRecordId
            },
            transaction: trx
          });

          // Add comment about newcase update
          const newcaseCommentBody = {
            content: `Newcase updated as part of client merge. Client changed from ${newcase.clientId.id} to ${consolidatedRecordId}`,
            author: {
              id: author.id,
              name: author.username || 'Unknown',
              email: author.email || 'unknown@example.com',
            },
          };

          await commentService.create(`api::newcase.newcase:${newcase.id}`, newcaseCommentBody, author);
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
          const deletedClientCommentBody = {
            content: `Client marked as deleted and merged to client ${consolidatedRecordId}`,
            author: {
              id: author.id,
              name: author.username || 'Unknown',
              email: author.email || 'unknown@example.com',
            },
          };

          await commentService.create(`api::client.client:${clientId}`, deletedClientCommentBody, author);
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