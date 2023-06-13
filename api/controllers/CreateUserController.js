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

    // Check if mandatory fields are present
    const mandatoryFields = [
        email,
        contactNumber,
        contactNumberAreaCode,
        country,
        walletAddress,
        blockchainId,
    ];

    if (mandatoryFields.some((field) => !field)) {
        return res.badRequest('Missing mandatory fields, please try again');
    }

    // Check if the user already exists
    let userId = null;
    try {
        const stmt = snowflakeConnection.execute({
            sqlText: queries.selectUserByEmail,
            binds: [email],
        });

        const result = await stmt.fetchOne();
        userId = result?.USER_ID;
    } catch (error) {
        return res.serverError('Error checking existing user');
    }

    // Update or insert a new entry in the USER table
    try {
        const stmt = snowflakeConnection.execute({
            sqlText: userId ? queries.updateUser : queries.insertUser,
            binds: [
                ...(userId
                    ? [contactNumber, contactNumberAreaCode, country, userId]
                    : [email, contactNumber, contactNumberAreaCode, country]),
            ],
        });

        if (!userId) {
            const result = await stmt.fetchOne();
            userId = result.USER_ID;
        }

        await stmt.execute();
    } catch (error) {
        return res.serverError(
            userId ? 'Error updating user' : 'Error creating user'
        );
    }

    // Update or insert user socials in the USER_SOCIALS table
    try {
        const stmt = snowflakeConnection.execute({
            sqlText: queries.upsertUserSocials,
            binds: [userId, telegram, discord, twitter, instagram, facebook],
        });

        await stmt.execute();
    } catch (error) {
        return res.serverError('Error updating/creating user socials');
    }

    // Update or insert wallet details in the USER_WALLET_DETAILS table
    try {
        const stmt = snowflakeConnection.execute({
            sqlText: queries.upsertUserWalletDetails,
            binds: [userId, walletAddress, blockchainId],
        });

        await stmt.execute();
    } catch (error) {
        return res.serverError('Error updating/creating user wallet details');
    }

    return res.ok('User created/updated successfully');
}

module.exports = {
    createUser,
};
