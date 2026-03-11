const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("results", (table) => {
    table.increments("result_id").primary();
    table.integer("student_id").references("user_id").inTable("users");
    table.integer("exam_id").references("exam_id").inTable("exams");
    table.integer("total_score");
    table.integer("max_score");
    table.timestamp("completed_at");
    table.jsonb("category_score").defaultTo("{}");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
