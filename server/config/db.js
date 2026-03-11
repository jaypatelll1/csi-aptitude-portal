const knex = require('knex');
const config = require('../knexfile');

const dbWrite = knex(config.api_write);
const dbRead = knex(config.api_read);

module.exports = {
  dbWrite,
  dbRead
};
