const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw(`
    CREATE TYPE role_enum AS ENUM ('TPO','Student','Teacher','Department','President');
    CREATE TYPE user_status AS ENUM ('NOTACTIVE','ACTIVE');
    CREATE TYPE branch_enum AS ENUM ('CMPN','INFT','ECS','EXTC','ELEC');
    CREATE TYPE year_enum AS ENUM ('FE','SE','TE','BE');
    CREATE TYPE exam_status AS ENUM ('draft','scheduled','live','past');
    CREATE TYPE response_status AS ENUM ('draft','submitted');
    CREATE TYPE question_type_enum AS ENUM ('single_choice','multiple_choice','text','image');
    CREATE TYPE category_enum AS ENUM (
      'quantitative aptitude',
      'logical reasoning',
      'verbal ability',
      'technical',
      'general knowledge'
    );
  `);
   
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
