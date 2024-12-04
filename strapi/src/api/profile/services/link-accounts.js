const createAccount = async (data, { strapi }) => {
  return await strapi.entityService.create('api::account.account', {
    data,
  });
};

const linkAccountsToProfile = async (profileId, { strapi }) => {
  const knex = strapi.db.connection;

  return await knex.transaction(async trx => {
    try {
      const currentAccount = await createAccount({ name: `Current Account for ${profileId}`, type: 'operational' }, { strapi });
      const escrowAccount = await createAccount({ name: `Escrow Account for ${profileId}`, type: 'escrow' }, { strapi });

      await strapi.entityService.update('api::profile.profile', profileId, {
        data: {
          currentAccountId: currentAccount.id,
          escrowAccountId: escrowAccount.id,
        },
      }, { trx });

    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
};

module.exports = {
  linkAccountsToProfile,
};