const db = require('../../db');

const getCompany = async (req, res) => {
    
    if(req.user === undefined) {
        return res.status(400).send({ status: 'error', message: 'Not Authorized' })
    }

    const companyID = req.user.company_id;

    try {
        const result = await db.query("SELECT * FROM company WHERE id = $1", [companyID]);
        console.log(result);
        res.status(200).json({
            status: 'success',
            data: {
                company: result.rows[0]
            }
        })
    } catch (err) {
        res.status(500).end();
    }
}

module.exports = {
    getCompany,
};