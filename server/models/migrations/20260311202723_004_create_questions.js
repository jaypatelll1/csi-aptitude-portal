const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("questions", (table) => {
    table.increments("question_id").primary();
    table.integer("exam_id").references("exam_id").inTable("exams");
    table.text("question_text");
    table.jsonb("options");
    table.string("correct_option", 1);
    table.specificType("category", "category_enum");
    table
      .specificType("question_type", "question_type_enum")
      .defaultTo("single_choice");
    table.jsonb("correct_options");
    table.text("image_url");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
