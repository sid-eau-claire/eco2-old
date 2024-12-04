'use strict';
const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

module.exports = {
  async getokrinsurance(ctx) {
    const result = {data: 'okrinsurance'};
    return {'data': [result], meta: { count: 1 }};
  }
};
