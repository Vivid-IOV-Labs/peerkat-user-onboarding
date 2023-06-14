const queries = require('../../config/queries');

async function deleteUser(req, res) {
    const snowflakeConnection = sails.hooks.snowflake.connection;

    const { userId } = req.allParams();

    try {
        if (!userId) {
            return res.badRequest('Missing mandatory fields, please try again');
        }

        // Check if the user exists
        const result = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.selectUserByUserId.replace('?', userId),
                complete: (err, stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                },
            });
        });

        if (!result.length) {
            return res.badRequest('User does not exist');
        }

        // Check if deletion request already exists
        const deletionRequestResult = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.selectUserDeletionRequest.replace('?', userId),
                complete: (err, stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                },
            });
        });

        if (deletionRequestResult.length) {
            return res.badRequest('Deletion request already exists');
        }

        // Store user deletion request in USER_DELETION_AUDIT table
        await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.insertUserDeletionRequest
                    .replace('?', userId)
                    .replace('?', `'${new Date().toISOString()}'`)
                    .replace('?', 'null')
                    .replace('?', 'null'),
                complete: (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                },
            });
        });

        return res.ok('Deletion request recorded');
    } catch (error) {
        return res.serverError('Error deleting user');
    }
}

module.exports = {
    deleteUser,
};
