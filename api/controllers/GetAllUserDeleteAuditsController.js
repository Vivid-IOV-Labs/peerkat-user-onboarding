const queries = require('../../config/queries');

const MAX_LIMIT = 10000;

async function getAllUserDeleteAudits(req, res) {
    const snowflakeConnection = sails.hooks.snowflake.connection;
    let { limit, page } = req.allParams();
    let result = [];

    limit = limit ? parseInt(limit) : MAX_LIMIT;
    page = page ? parseInt(page) : 1;

    // Validate limit and page values
    if (limit < 0 || page < 0 || limit > MAX_LIMIT) {
        return res.status(400).send('Invalid page or limit parameters');
    }

    const offset = limit * (page - 1);
    try {
        const totalRequests = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: queries.countAllUserDeleteAuditRequests,
                complete: (err, stmt, rows) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        resolve(rows[0]['COUNT(*)']);
                    }
                },
            });
        });

        const totalPages = Math.ceil(totalRequests / limit);

        result = await new Promise((resolve, reject) => {
            snowflakeConnection.execute({
                sqlText: `${queries.selectAllUserDeleteAudits} LIMIT ${limit} OFFSET ${offset}`, // Add LIMIT and OFFSET to your SQL query
                complete: (err, stmt, rows) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        resolve(rows);
                    }
                },
            });
        });

        return res.ok({ requests: result, totalPages });

    } catch (error) {
        console.log('Error fetching user delete audits', error);
        return res.serverError('Error fetching user delete audits');
    }
}

module.exports = {
    getAllUserDeleteAudits,
};
