const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("teacher_results", (table) => {
    table.increments("result_id").primary();
    table.integer("teacher_id").references("user_id").inTable("users");
    table.integer("exam_id").references("exam_id").inTable("exams");
    table.integer("question_id").references("question_id").inTable("questions");
    table.integer("marks_allotted");
    table.integer("max_score");
    table.text("comments");
    table.timestamp("completed_at");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
