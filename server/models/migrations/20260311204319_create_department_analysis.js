const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("department_analysis", (table) => {
    table.increments("id").primary();
    table.string("department_name", 100).notNullable();
    table.string("year", 10).notNullable();
    table.float("accuracy_rate").defaultTo(0.0);
    table.jsonb("subject_performance").defaultTo("{}");
    table.jsonb("performance_over_time").defaultTo("[]");
    table.integer("department_rank");
    table.float("total_score").defaultTo(0);
    table.float("max_score").defaultTo(0);
    table.integer("student_count").defaultTo(0);

    table.unique(["department_name", "year"]);
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
