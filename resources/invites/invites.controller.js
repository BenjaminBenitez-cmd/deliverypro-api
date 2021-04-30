const db = require('../../db');

const getUserInvites = async (req, res) => {
    if(!req.user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized'});
    }
    const companyID = req.user.company_id;
    try {
        const results = await db.query("SELECT * FROM invites WHERE invites.company = $1", [companyID]);

        res.status(200).json({
            status: 'success',
            results: results.rows.length,
            data: {
                invites: results.rows
            }
        })
    } catch (err) {
        res.status(500).end();
    }
}

const addUserInvite = async (req, res) => {
    if(!req.user) {
        return res.status(401).json({ status: 'error', message: 'Not authorized'});
    }

    if(!req.body.email || !req.body.name) {
        return res.status(400).json({ status: 'error', message: 'Missing Parameters'});
    }
    const { email, name } = req.body;

    //remove this for production
    const companyID = req.user.company_id;

    try {

        const checkInvite = await db.query("SELECT invites.email From invites WHERE invites.email = $1", [email]);
        if(checkInvite.rows[0] !== undefined) {
            return res.status(400).send({ status: 'error', message: 'Invite already sent'});
        }
    

        const obj = {
            email: email,
            text: `Hey, ${name} You have been invited to become a driver for amaryllis Belize`,
        }

        const response = await mailer(obj);

        await db.query("INSERT INTO invites (company, email, name) VALUES ($1, $2, $3)", [companyID, email, name])
      
        res.status(200).json({ status: 'success', message: response });
    } catch(err) {
        res.status(500).end();
    }
}

module.exports = {
    getUserInvites,
    addUserInvite
}