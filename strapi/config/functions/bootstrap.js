module.exports = async () => {
  console.log("Running bootstrap function...");
  const knex = strapi.connections.default;
  await knex.schema.alterTable('commissionlogs', t => {
    t.index('statement_date', 'commissionLogs_statement_date_idx');
  });
  console.log("Index should be added.");
};