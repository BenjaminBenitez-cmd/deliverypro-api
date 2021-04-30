const db = require('../../db');

const getDeliveries = async (req, res) => {

    if(!req.user) {
        return res.status(401).send({ status: 'error', message: 'Not Authorized'});
    }

    const company_id = req.user.company_id;

    try {
        const results = await db.query("SELECT d.id, d.delivery_status, d.delivery_time, d.delivery_date, c.first_name, c.last_name, c.phone_number, c.email, a.street, a.district FROM delivery AS d INNER JOIN client AS c ON c.id = d.client INNER JOIN address AS a ON a.client_id = c.id WHERE d.delivery_company_id = $1",
        [company_id]);
        res.status(200).json({
            status: 'success',
            results: results.rows.length,
            data: {
                deliveries: results.rows
            }
        })
    } catch (err) {
        res.status(500).end();
    }
}

const getDelivery = async (req, res) => {
    if(!req.user) {
        return res.status(401).send({ status: 'error', message: 'Not Authorized'});
    }

    if(!req.params) {
        return res.status(400).send({ status: 'error', message: 'Missing parameters'});
    }

    const id = req.params.id;
    const company_id = req.user.company_id;

    try {
        const results = await db.query("SELECT * FROM delivery WHERE (delivery.id = $1 AND delivery_company_id = $2)", 
        [id, company_id]);

        res.status(200).json({
            status: 'success',
            data: {
                delivery: results.rows[0],
            }
        })
    } catch (err) {
        res.status(400).end();
    }
}

const updateDelivery = async (req, res) => {
    if(!req.user) {
        return res.status(401).send({})
    }
    //needs repairs
    if(!req.body.id || !req.params.id) {
        return res.status(400).send({ status: 'error', message: 'Missing parameters'});
    }

    const companyID = req.user.companyID;

    const id  = req.params.id;
    const { delivery_date, delivery_driver, delivery_status} = req.body;

    try {
        const belongsToCompany = await db.query("SELECT delivery_company_id FROM delivery WHERE id = $1", [id]);

        if(!belongsToCompany || belongsToCompany.rows[0].delivery_company_id !== companyID) {
            return res.status(400).send({ status: 'error', message: 'There was an error with your request'});
        }

        const updatedDelivery = await db.query("UPDATE delivery SET delivery_date = $1, delivery_driver = $2, delivery_status = $3 WHERE id = $4 RETURNING *", 
        [delivery_date, delivery_driver, delivery_status, id]);

        res.status(201).json({ 
            status: 'success', 
            data: {
                delivery: updatedDelivery.rows[0]
            }
        })

    } catch (e) {
        res.status(500).end();
    }
}

const toggleDelivery = async(req, res) => {
    if(!req.user) {
        res.status(400).send({ status: 'error', message: 'Not Authorized'});
    }

    const companyID = req.user.company_id;

    try {
        const belongsToCompany = await db.query("SELECT delivery_company_id FROM delivery WHERE id = $1", [req.params.id]);

        if(belongsToCompany.rows <=0 || belongsToCompany.rows[0].delivery_company_id !== companyID) {
            return res.status(400).send({ status: 'error', message: 'There was an error with your request'});
        } 

        const updatedDelivery = await db.query("UPDATE delivery SET delivery_status = NOT delivery_status WHERE id = $1 returning delivery_status, id", [req.params.id]);

        res.status(201).json({ 
            status: 'success', 
            data: {
                delivery: updatedDelivery.rows[0]
            }
        }); 

    } catch(e) {
        console.log(e);
        res.status(500).end();
    }
}

const addDelivery = async (req, res ) => {
    if(!req.user) {
        return res.status(400).send({ status: 'error', message: 'Missing Token'})
    }
    const { id, company_id } = req.user;

    try {
        const clientCreated = await db.query("INSERT INTO client (first_name, last_name, phone_number, email, delivery_company_id) values($1, $2, $3, $4, $5) returning *", 
        [req.body.first_name, req.body.last_name, req.body.phone_number, req.body.email, company_id]);
        const deliveryCreated = await db.query("INSERT INTO delivery (client, delivery_date, delivery_time, delivery_driver, delivery_company_id) values ($1, $2, $3, $4, $5) returning *", 
       [clientCreated.rows[0].id, req.body.delivery_date, req.body.delivery_time, id, company_id ]);
        const addressCreated = await db.query("INSERT INTO address (street, district, description, client_id) values($1, $2, $3, $4) returning *", 
        [req.body.street, req.body.district, req.body.description, clientCreated.rows[0].id]);
        res.status(201).json({
            status: 'success',
            data: {
                delivery: {
                    ...deliveryCreated.rows[0],
                    ...clientCreated.rows[0],
                    ...addressCreated.rows[0],
                    id: deliveryCreated.rows[0].id
                } 
            }
        })
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
}


module.exports = {
    getDeliveries,
    getDelivery,
    addDelivery,
    updateDelivery,
    toggleDelivery
}
