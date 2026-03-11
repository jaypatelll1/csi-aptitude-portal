const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("student_analysis", (table) => {
     table.increments("analysis_id").primary();
    table.integer("exam_id").references("exam_id").inTable("exams").onDelete("CASCADE");
    table.specificType("department_name", "branch_enum").notNullable();
    table.integer("student_id").references("user_id").inTable("users").onDelete("CASCADE");
    table.string("student_name", 255);
    table.string("exam_name", 255);
    table.float("total_score").notNullable();
    table.float("max_score").notNullable();
    table.boolean("attempted").defaultTo(false);
    table.jsonb("category");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
