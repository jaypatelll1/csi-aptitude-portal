const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("exams", (table) => {
    table.increments("exam_id").primary();
    table.string("exam_name", 30);
     table.integer("duration");
    table.timestamp("start_time");
    table.timestamp("end_time");
  
    table.specificType("status", "exam_status").defaultTo("draft");
    table.specificType("target_years", "year_enum[]").notNullable();
    table.specificType("target_branches", "branch_enum[]").notNullable();
    table.specificType("exam_for", "role_enum").defaultTo("Student");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
