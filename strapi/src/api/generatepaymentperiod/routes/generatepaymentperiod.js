'use strict';

/**
 * commissionlog router
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/generatepaymentperiod/generatepaymentpreview',
      handler: 'generatepaymentperiod.generatePaymentPreview',
    },
    {
      method: 'POST',
      path: '/generatepaymentperiod/calculatepaymentpreview',
      handler: 'generatepaymentperiod.calculatePaymentPreview',
    },
    {
      method: 'POST',
      path: '/generatepaymentperiod/commissiontransaction',
      handler: 'generatepaymentperiod.commissionTransaction',
    },
    {
      method: 'GET',
      path: '/generatepaymentperiod/calculatepayment',
      handler: 'generatepaymentperiod.calculatePayments',
    },
    {
      method: 'POST',
      path: '/generatepaymentperiod/createpaymentperiod',
      handler: 'generatepaymentperiod.createPaymentPeriod',
    },
    {
      method: 'DELETE',
      path: '/generatepaymentperiod/deletepaymentperiod/:id',
      handler: 'generatepaymentperiod.deletePaymentPeriod',
    },        
  ],
};
