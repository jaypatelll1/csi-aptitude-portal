const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("user_analysis", (table) => {
   table.integer("student_id").primary().references("user_id").inTable("users");
    table.text("student_name").notNullable();
    table.text("department_name").notNullable();
    table.text("year").notNullable();
    table.float("accuracy_rate").defaultTo(0.0);
    table.float("completion_rate").defaultTo(0.0);
    table.jsonb("category").defaultTo("{}");
    table.jsonb("performance_over_time").defaultTo("[]");
    table.integer("total_score");
    table.integer("max_score");
    addDefaultColumns(table);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
