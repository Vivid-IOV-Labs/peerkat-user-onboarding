const queries = require('../../config/queries');

const MAX_LIMIT = 100;

async function getAllUsers(req, res) {
    const snowflakeConnection = sails.hooks.snowflake.connection;
    let { limit, page } = req.query;
    let result = [];

    limit = limit ? parseInt(limit) : MAX_LIMIT;
    page = page ? parseInt(page) : 1;

    // Validate limit and page values
    if (limit < 0 || page < 0 || limit > MAX_LIMIT) {
        return res.status(400).send('Invalid page or limit parameters');
    }

    const offset = limit * (page - 1);
    try {
        const totalUsers = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.countAllUsers,
                complete: (err, stmt, rows) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        resolve(rows[0]['COUNT(*)']);
                    }
                },
            });
        });

        const totalPages = Math.ceil(totalUsers / limit);

        result = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: `${queries.selectAllUsers} LIMIT ${limit} OFFSET ${offset}`,
                complete: (err, stmt, rows) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        resolve(rows);
                    }
                },
            });
        });

        return res.ok({ users: result, totalPages: totalPages });

    } catch (error) {
        console.log('Error fetching users', error);
        return res.serverError('Error fetching users');
    }
}

module.exports = {
    getAllUsers,
};
