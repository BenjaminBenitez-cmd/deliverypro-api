const db = require('../../db');

const getDrivers =  async (req, res) => {
    if(!req.user) {
        return res.status(401).send({ status: 'error', message: 'Not Authorized'})
    }
    console.log(req.user);

    const companyID = req.user.company_id;

    try {
        const response = await db.query("SELECT id, name, phone, email FROM users WHERE (role=2 and company_id = $1)",
         [companyID]);

        res.status(200).json({
            status: 'success',
            results: response.rows.length,
            data: {
                drivers: response.rows
            }
    
        })
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
}

module.exports = {
    getDrivers
}