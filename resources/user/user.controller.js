const db = require('../../db');
const { mailer } = require('../../utils/mailer')
const getUsers = async (req, res) => {
    try {
        const results = await db.query("SELECT * FROM users");
        res.status(200).json({
            status: 'success',
            results: results.rows.length,
            data: {
                users: results.rows
            }
        })
    } catch (err) {
        res.status(400).end();
    }
}

const getUser = async (req, res) => {
    const id = req.params.id;
    try {
        const results = await db.query("SELECT * FROM users WHERE users.id = $1", [id]);
        res.status(200).json({
            status: 'success',
            data: {
                users: results.rows[0],
            }
        })
    } catch (err) {
        res.status(400).end();
    }
}

const getUserInvites = async (req, res) => {
    const id = req.params.id;
    try {
        const results = await db.query("SELECT * FROM invites WHERE invites.company = $1", [id]);
        res.status(200).json({
            status: 'success',
            data: {
                invites: results.rows
            }
        })
        console.log(results);
    } catch (err) {
        res.status(400).end();
    }
}

const addUserInvite = async (req, res) => {
    const { email, name } = req.body;
    if(!req.body.email || !req.body.name) {
        return res.status(400).json({ status: 'error', message: 'No email or name'});
    }
    //remove this for production
    const company = 1;

    try {
        const checkUser = await db.query("SELECT invites.email From invites WHERE invites.email = $1", [email]);
        if(checkUser.rows[0] !== undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Invite already sent'
            }).end();
        }

        const obj = {
            email: email,
            text: `Hey, ${name} You have been invited to become a driver for amaryllis Belize`,
        }

        const response = await mailer(obj);

        await db.query("INSERT INTO invites (company, email, name) VALUES ($1, $2, $3)", [company, email, name])
      
        res.status(200).json({ status: 'success', message: response });
    } catch(err) {
        console.log(err);
        res.status(500).end();
    }
}

module.exports = {
    getUsers,
    getUser,
    getUserInvites,
    addUserInvite,
}