const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("student_rank", (table) => {
  table.increments("rank_id").primary();
    table.integer("student_id").unique();
    table.string("student_name", 255);
    table.text("department_name").notNullable();
    table.text("year").notNullable();
    table.integer("total_score").notNullable();
    table.integer("overall_rank").notNullable();
    table.integer("department_rank").notNullable();
    table.timestamp("last_updated").defaultTo(knex.fn.now());
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
