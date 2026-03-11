const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

const { addDefaultColumns } = require("../utilities/MigrationUtilities");
exports.up = function (knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable("users", (table) => {
    table.increments("user_id").primary();
    table.string("name", 50);
    table.string("email", 50).unique();
    table.text("password_hash");
    table.specificType("role", "role_enum").notNullable();
   
    table.specificType("status", "user_status").defaultTo("NOTACTIVE");
    table.specificType("department", "branch_enum");
    table.specificType("year", "year_enum");
    table.integer("rollno");
    table.string("phone", 15);
    addDefaultColumns(table);
  });
};

exports.down = function (knex) {
 
};
