const queries = require('../../config/queries');

async function userDelete(req, res) {
    const snowflakeConnection = sails.hooks.snowflake.connection;

    const { userId } = req.allParams();

    try {
        // Check if the user exists
        const selectUserStmt = snowflakeConnection.execute({
            sqlText: queries.selectUserById,
            binds: [userId],
        });

        const selectUserResult = await selectUserStmt.fetchOne();
        if (!selectUserResult) {
            return res.badRequest('User does not exist');
        }

        // Store user deletion request in USER_DELETION_AUDIT table
        const insertDeletionRequestStmt = snowflakeConnection.execute({
            sqlText: queries.insertUserDeletionRequest,
            binds: [userId, new Date(), null, null],
        });

        await insertDeletionRequestStmt.execute();

        return res.ok('Deletion request recorded');
    } catch (error) {
        return res.serverError('Error deleting user');
    }
}

module.exports = {
    userDelete,
};
