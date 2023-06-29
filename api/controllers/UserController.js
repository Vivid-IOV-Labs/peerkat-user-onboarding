const queries = require('../../config/queries');

async function createUser(req, res) {
    const snowflakeConnection = sails.hooks.snowflake.connection;

    const {
        email,
        contactNumber,
        contactNumberAreaCode,
        country,
        telegram,
        discord,
        twitter,
        instagram,
        facebook,
        walletAddress,
        blockchainId,
    } = req.allParams();

    // Check if mandatory fields are present and are of the correct type
    const mandatoryFields = {
        email: 'string',
        contactNumber: 'number',
        contactNumberAreaCode: 'number',
        country: 'string',
        walletAddress: 'string',
        blockchainId: 'string',
    };

    for (const field in mandatoryFields) {
        if (!req.allParams()[field]) {
            return res.badRequest(`Missing mandatory field: ${field}`);
        }
        if (typeof req.allParams()[field] !== mandatoryFields[field]) {
            return res.badRequest(`Invalid type for field: ${field}. Expected ${mandatoryFields[field]}`);
        }
    }

    // Check if the user already exists
    let userId = null;
    try {
        const result = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.selectUserByEmail.replace('?', `'${email}'`),
                complete: (err, stmt, rows) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        resolve(rows);
                    }
                },
            });
        });

        if (result.length > 0 && result[0].USER_ID) {
            console.log('User already exists');
            return res.ok('User already exists');
        }
    } catch (error) {
        console.log('Error checking existing user', error);
        return res.serverError('Error checking existing user');
    }

    // Insert a new entry in the USER table
    try {
        const result = await new Promise(async (resolve, reject) => {
            await snowflakeConnection.execute({
                sqlText: queries.insertUser
                    .replace('?', `'${email}'`)
                    .replace('?', contactNumber)
                    .replace('?', contactNumberAreaCode)
                    .replace('?', `'${country}'`),
                complete: async function (err, stmt, rows) {
                    if (err) {
                        console.log('Error inserting user', err);
                        throw Error(err);
                    } else {
                        snowflakeConnection.execute({
                            sqlText: queries.selectUserByEmail.replace('?', `'${email}'`),
                            complete: function (err, stmt, rows) {
                                if (err) {
                                    throw Error(err);
                                } else {
                                    userId = rows[0].USER_ID;
                                    resolve(true)
                                }
                            },
                        });
                    }
                },
            });
        });

        if (!result) {
            throw Error('Error inserting user');
        }
        console.log('User created successfully');

    } catch (error) {
        console.log('Error updating/creating user', error);
        return res.serverError(
            userId ? 'Error updating user' : 'Error creating user'
        );
    }

    try {
        await snowflakeConnection.execute({
            sqlText: queries.insertUserSocials
                .replace('?', userId)
                .replace('?', `'${telegram}'`)
                .replace('?', `'${discord}'`)
                .replace('?', `'${twitter}'`)
                .replace('?', `'${instagram}'`)
                .replace('?', `'${facebook}'`),
            complete: function (err, stmt, rows) {
                if (err) {
                    throw Error(err);
                }
            },
        });
    } catch (error) {
        return res.serverError('Error updating/creating user socials');
    }

    // Insert wallet details in the USER_WALLET_DETAILS table
    try {
        await snowflakeConnection.execute({
            sqlText: queries.insertUserWalletDetails
                .replace('?', userId)
                .replace('?', `'${walletAddress}'`)
                .replace('?', `'${blockchainId}'`),
            complete: function (err, stmt, rows) {
                if (err) {
                    throw Error(err);
                }
            },
        });
    } catch (error) {
        return res.serverError('Error updating/creating user wallet details');
    }

    return res.ok('User created/updated successfully');
}

module.exports = {
    createUser,
};
