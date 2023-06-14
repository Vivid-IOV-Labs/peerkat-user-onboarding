const queries = require('./queries');

async function deleteFromOtherTables(connection, userId) {
    try {
        // Delete user details from other tables
        await connection.execute({
            sqlText: queries.deleteUserSocials.replace('?', userId),
        });

        await connection.execute({
            sqlText: queries.deleteUserWalletDetails.replace('?', userId),
        });

        console.log(`User with USER ID: ${userId} deleted successfully.`);
    } catch (error) {
        console.error(
            `Error deleting user details for user ID: ${userId}`,
            error
        );
        throw error;
    }
}

module.exports.cron = {
    firstJob: {
        schedule: '0 0 * * 0', // Runs every Sunday at midnight
        // schedule: '* * * * * *', // Runs every second
        onTick: async function () {
            const snowflakeConnection = sails.hooks.snowflake.connection;

            try {
                // Get the user deletion requests with confirmed date
                const rows = await new Promise((resolve, reject) => {
                    snowflakeConnection.execute({
                        sqlText: queries.selectConfirmedDeletionRequests,
                        complete: async (err, stmt, rows) => {
                            if (err) {
                                console.error(
                                    'Error fetching user deletion requests:',
                                    err
                                );
                                reject(err);
                            } else {
                                console.log(
                                    `User deletion requests fetched successfully. Number of requests: ${rows.length}`
                                );
                                resolve(rows);
                            }
                        },
                    });
                });

                for (let i in rows) {
                    const {
                        USER_ID,
                        DATE_CONFIRMED_FOR_REMOVAL,
                        DATE_OF_DELETION,
                    } = rows[i];

                    if (
                        DATE_CONFIRMED_FOR_REMOVAL !== null &&
                        DATE_OF_DELETION === null
                    ) {
                        // Delete user details from other tables
                        await deleteFromOtherTables(
                            snowflakeConnection,
                            USER_ID
                        );

                        // Update the USER_DELETION_AUDIT entry with deletion date
                        const today = new Date();
                        const dateStr = `${today.getFullYear()}-${
                            today.getMonth() + 1
                        }-${today.getDate()}`; // format: YYYY-MM-DD

                        await snowflakeConnection.execute({
                            sqlText: queries.updateDeletionRequest
                                .replace('?', `'${dateStr}'`)
                                .replace('?', USER_ID),
                            complete: (err) => {
                                if (err) {
                                    console.error(
                                        `Error updating deletion request for user ID: ${USER_ID}`,
                                        err
                                    );
                                } else {
                                    console.log(
                                        `User deletion request with User ID: ${USER_ID} processed successfully.`
                                    );
                                }
                            },
                        });
                    }
                }
            } catch (error) {
                console.error(
                    'Error processing user deletion requests:',
                    error
                );
            }
        },
    },
};
