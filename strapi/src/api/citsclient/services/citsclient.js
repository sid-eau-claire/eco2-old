'use strict';

/**
 * citsclient service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::citsclient.citsclient');
