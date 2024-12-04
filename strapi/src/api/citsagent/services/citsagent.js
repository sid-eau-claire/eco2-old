'use strict';

/**
 * citsagent service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::citsagent.citsagent');
