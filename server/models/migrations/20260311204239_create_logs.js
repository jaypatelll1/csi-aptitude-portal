const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("logs", (table) => {
     table.increments("logs_id").primary();
    table.integer("user_id").references("user_id").inTable("users").onDelete("CASCADE");
    table.string("activity", 255).notNullable();
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.string("status", 50);
    table.text("details");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
