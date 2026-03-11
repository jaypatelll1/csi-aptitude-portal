require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    api_write:{
        client: process.env.DATABASE_CLIENT,
        connection: {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            ssl: {
                rejectUnauthorized: false
            }
        },
        seeds: {
            directory: './src/models/seeds'
        },
        pool: {
            min: parseInt(process.env.DATABASE_POOL_MIN),
            max: parseInt(process.env.DATABASE_POOL_MAX)
        },
    },

    api_read:{
        client: process.env.DATABASE_CLIENT,
        connection: {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            ssl: {
                rejectUnauthorized: false
            }
        },
        seeds: {
            directory: './src/models/seeds'
        },
        pool: {
            min: parseInt(process.env.DATABASE_POOL_MIN),
            max: parseInt(process.env.DATABASE_POOL_MAX)
        },
    },
   
    worker:{
        client: process.env.WORKER_DATABASE_CLIENT,
        connection: {
            host: process.env.WORKER_DATABASE_HOST,
            port: process.env.WORKER_DATABASE_PORT,
            user: process.env.WORKER_DATABASE_USERNAME,
            password: process.env.WORKER_DATABASE_PASSWORD,
            database: process.env.WORKER_DATABASE_NAME,
            ssl: {
                rejectUnauthorized: false
            }
        },
        seeds: {
            directory: './src/models/seeds'
        },
        pool: {
            min: parseInt(process.env.WORKER_DATABASE_POOL_MIN),
            max: parseInt(process.env.WORKER_DATABASE_POOL_MAX)
        },
    }
};
