'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  // bootstrap(/*{ strapi }*/) {
  // },
  async bootstrap({ strapi }) {
    const tablesIndexed = [
      {
        tableName: 'commissionlogs',
        indexes: [
          { columnName: 'statement_date', indexName: 'commissionLogs_statement_date_idx' }
        ]
      },
      {
        tableName: 'commissionlogentries',
        indexes: [
          { columnName: 'policy_account_fund', indexName: 'commissionLogEntries_policy_account_fund_idx' }
        ]
      },
      {
        tableName: 'monthly_metrics',
        indexes: [
          { columnName: 'year_month', indexName: 'monthlyMetrics_year_month_idx' },
          { columnName: 'metric_name', indexName: 'monthlyMetrics_metric_name_idx' }
        ]
      },
      {
        tableName: 'monthly_metrics_profile_id_links',
        indexes: [
          { columnName: 'profile_id', indexName: 'monthlyMetricsProfileIdLinks_profile_id_idx' },
          { columnName: ['profile_id', 'monthly_metric_id'], indexName: 'monthlyMetricsProfileIdLinks_profile_id_monthly_metric_id_idx' }
        ]
      },
      {
        tableName: 'newcases',
        indexes: [
          { columnName: 'settled_date', indexName: 'newcases_settled_date_idx' }
        ]
      },      
      {
        tableName: 'networks_child_id_links',
        indexes: [
          { columnName: 'profile_id', indexName: 'networks_child_id_links_profile_id_idx' },
        ]
      },
      {
        tableName: 'networks_parent_id_links',
        indexes: [
          { columnName: 'profile_id', indexName: 'networks_parent_id_links_profile_id_idx' },
        ]
      }            
      // Add more table configurations as needed
    ];
  
    try {
      console.log("Running bootstrap function...");
      const knex = strapi.db.connection;
  
      for (const tableConfig of tablesIndexed) {
        const { tableName, indexes } = tableConfig;
  
        // Check if the table exists before attempting to alter it
        const exists = await knex.schema.hasTable(tableName);
        if (exists) {
          for (const index of indexes) {
            const { columnName, indexName } = index;
  
            // Check if the index already exists
            const indexExists = await knex.schema.raw(
              `SELECT EXISTS (
                SELECT 1
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relname = ?
              )`,
              [indexName]
            );
  
            if (!indexExists.rows[0].exists) {
              await knex.schema.table(tableName, function (table) {
                if (Array.isArray(columnName)) {
                  table.index(columnName, indexName);
                } else {
                  table.index([columnName], indexName);
                }
              });
              console.log(`Index '${indexName}' has been added to table '${tableName}'.`);
            } else {
              console.log(`Index '${indexName}' already exists on table '${tableName}'.`);
            }
          }
        } else {
          console.log(`Table '${tableName}' does not exist.`);
        }
      }
    } catch (error) {
      console.error("Error in bootstrap function:", error.message);
    }
  },
  
  
};
