/**
 * snowflake-connector hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
const snowflake = require('snowflake-sdk');

module.exports = function (sails) {
    return {
        initialize: async function (next) {
            const connection = snowflake.createConnection({
                username: process.env.SNOWFLAKE_USERNAME,
                account: process.env.SNOWFLAKE_ACCOUNT,
                database: process.env.SNOWFLAKE_DATABASE,
                password: process.env.SNOWFLAKE_PASSWORD,
                schema: process.env.SNOWFLAKE_SCHEMA,
		region: process.env.SNOWFLAKE_REGION
            });

            connection.connect(function (err, conn) {
                if (err) {
                    sails.log.error('Failed to connect to Snowflake:', err);
                    return next(err);
                }

                // Store the Snowflake connection object in the hook
                sails.hooks.snowflake = {
                    connection: conn,
                };

                sails.log.info('Connected to Snowflake successfully');
                return next();
            });
        },
    };
};
