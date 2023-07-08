const queries = require("../../config/queries");

const MAX_LIMIT = 10;

async function getUserDetails(req, res) {
    const snowflakeConnection = sails.hooks.snowflake.connection;
    let { limit, page, searchField, searchValue } = req.allParams();
    let result = [];

    limit = limit ? parseInt(limit) : MAX_LIMIT;
    page = page ? parseInt(page) : 1;

    // Validate search parameters
    if (!searchField || !searchValue) {
        return res.status(400).send({ error: 'Invalid search parameters' });
    }

    // Validate limit and page values
    if (limit < 0 || page < 0 || limit > MAX_LIMIT) {
        return res.status(400).send({ error: 'Invalid page or limit parameters' });
    }

    try {
        const offset = limit * (page - 1);
        result = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.getUserDataWithSearchParams.replace('?', searchField).replace('?', `'%${searchValue}%'`),
                complete: (err, stmt, rows) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        resolve(rows);
                    }
                },
            });
        });

        // Slice based on limit and offset
        const totalPages = Math.ceil(result.length / limit);
        result = result.slice(offset, offset + limit);

        return res.ok({ users: result, totalPages });

    } catch (error) {
        console.log('Error fetching users', error);
        return res.serverError({ error: 'Error fetching users' });
    }
}

module.exports = {
    getUserDetails,
};
