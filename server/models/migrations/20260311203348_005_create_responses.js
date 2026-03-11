const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("responses", (table) => {
    table.increments("response_id").primary();
    table.integer("student_id").references("user_id").inTable("users");
    table.integer("exam_id").references("exam_id").inTable("exams");
    table.integer("question_id");
    table.string("selected_option", 1);
    table.timestamp("answered_at").defaultTo(knex.fn.now());
    table.specificType("status", "response_status").defaultTo("draft");
    table.jsonb("selected_options");
    table.text("text_answer");
    table.specificType("question_type", "question_type_enum");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
