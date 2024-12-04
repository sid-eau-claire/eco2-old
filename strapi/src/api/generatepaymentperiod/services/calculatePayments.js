const profile = require("../../profile/controllers/profile");

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

const getMinimumPayAmount = async () => {
  const distributions = await strapi.entityService.findMany('api::commissiondistribution.commissiondistribution', {
    filters: { isActive: true },
    populate: ['generalSettings']
  });

  for (let distribution of distributions) {
    if (distribution.generalSettings) {
      for (let setting of distribution.generalSettings) {
        if (setting.name === 'payPeriodPayoutThreshold') {
          return setting.value;
        }
      }
    }
  }
  return 0;  // Default to 0 if no minimumPayAmount is found
};
const calculatePaymentToAccount = async (accountId, globalMinimumPayAmount) => {
  // JLOG(`Calculating payment to account for Account ID: ${accountId}`);
  try {
    // Fetch account and ensure all necessary data is included
    const account = await strapi.entityService.findOne('api::account.account', accountId, {
      populate: {
        profileId: {
          populate: {
            administrative: true
          }
        }
      }
    });

    if (!account) {
      throw new Error(`No account found for ID ${accountId}`);
    }

    // JLOG(`Fetched account data: ${JSON.stringify(account)}`);

    const transactions = await strapi.entityService.findMany('api::accounttransaction.accounttransaction', {
      filters: { accountId, paymentPeriodId: null },
      sort: { id: 'desc' },
      populate: '*',
    });

    const newBalance = transactions.length ? transactions[0].newBalance : 0;
    const newHoldBalance = transactions.length ? transactions[0].newHoldBalance : 0;
    const totalPaymentFromTransaction = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const transactionCount = transactions.length;

    // Determine the effective minimum payment amount
    const individualThreshold = account.profileId?.administrative?.payPeriodPayoutThreshold;
    const effectiveMinimumPayAmount = individualThreshold || globalMinimumPayAmount;

    return {
      profileId: account.profileId.id,
      firstName: account.profileId.firstName,
      lastName: account.profileId.lastName,
      accountId: account.id,
      totalPayment: newBalance,
      totalHold: newHoldBalance,
      relatedTransactions: transactions,
      numberOfTransactions: transactionCount,
      totalPaymentFromTransaction,
      minimumPayAmount: effectiveMinimumPayAmount
    };
  } catch (error) {
    JLOG(`Error calculating payment for account ${accountId}: ${error.message}`);
    throw error;
  }
};



const calculatePayments = async (profileId) => {
  // JLOG('Calculating payments service is called');
  // JLOG('profileId: ' + profileId);
  const globalMinimumPayAmount = await getMinimumPayAmount();

  // Prepare the base query options including dynamic filters
  let queryOptions = {
    populate: {
      profileId: {
        populate: {
          administrative: true
        }
      }
    }
  };

  // Apply filter only if profileId is provided
  if (profileId) {
    queryOptions.filters = {
      profileId: {
        $eq: profileId // Using $eq to explicitly specify equality
      }
    };
  }

  try {
    const accounts = await strapi.entityService.findMany('api::account.account', queryOptions);

    const filteredAccounts = accounts.filter(account => {
      const individualThreshold = account.profileId?.administrative?.payPeriodPayoutThreshold;
      const effectiveThreshold = individualThreshold || globalMinimumPayAmount;
      return account.balance >= effectiveThreshold;
    });

    // JLOG(`Number of accounts qualifying for payment: ${filteredAccounts.length}`);

    const payments = await Promise.all(filteredAccounts.map(account =>
      calculatePaymentToAccount(account.id)
    ));

    return payments;
  } catch (error) {
    JLOG(`Error during payment calculation: ${error.message}`);
    throw error;
  }
};


module.exports = {
  calculatePaymentToAccount,
  calculatePayments
};
