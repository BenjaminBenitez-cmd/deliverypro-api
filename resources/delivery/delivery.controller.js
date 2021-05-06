const db = require("../../db");

const getDeliveries = async (req, res) => {
  const company_id = req.user.company_id;

  try {
    const results = await db.query(
      "WITH query_delivery AS ( SELECT dl.id, dl.client, dl.delivery_status, t.time_start, t.time_end, n.name AS delivery_day FROM delivery AS dl INNER JOIN times AS t ON dl.delivery_time = t.id INNER JOIN names_of_days AS n ON dl.delivery_day = n.id WHERE dl.delivery_company_id = $1 ) , query_clients AS ( SELECT client.id, client.first_name, client.last_name, client.phone_number, client.email, address.district, address.street FROM client INNER JOIN address ON address.client_id = client.id WHERE delivery_company_id = $1 ) SELECT query_delivery.*, query_clients.first_name, query_clients.last_name, query_clients.phone_number, query_clients.email, query_clients.district, query_clients.street FROM query_delivery INNER JOIN query_clients ON query_delivery.client = query_clients.id",
      [company_id]
    );
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        deliveries: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

const getDelivery = async (req, res) => {
  if (!req.params) {
    return res
      .status(400)
      .send({ status: "error", message: "Missing parameters" });
  }

  const id = req.params.id;
  const company_id = req.user.company_id;

  try {
    const results = await db.query(
      "SELECT * FROM delivery WHERE (delivery.id = $1 AND delivery_company_id = $2)",
      [id, company_id]
    );

    res.status(200).json({
      status: "success",
      data: {
        delivery: results.rows[0],
      },
    });
  } catch (err) {
    res.status(400).end();
  }
};

const updateDelivery = async (req, res) => {
  //needs repairs
  if (!req.body || !req.params.id) {
    return res
      .status(400)
      .send({ status: "error", message: "Missing parameters" });
  }

  const companyID = req.user.company_id;

  const id = req.params.id || req.body.id;
  const {
    delivery_day,
    delivery_time,
    delivery_driver,
    delivery_status,
  } = req.body;

  try {
    const belongsToCompany = await db.query(
      "SELECT delivery_company_id FROM delivery WHERE id = $1",
      [id]
    );
    if (
      !belongsToCompany ||
      belongsToCompany.rows[0].delivery_company_id !== companyID
    ) {
      return res.status(400).send({
        status: "error",
        message: "There was an error with your request",
      });
    }

    const updatedDelivery = await db.query(
      "UPDATE delivery SET delivery_day = $1, delivery_time = $2, delivery_driver = $3, delivery_status = $4 WHERE id = $5 RETURNING *",
      [delivery_day, delivery_time, delivery_driver, delivery_status, id]
    );

    res.status(201).json({
      status: "success",
      data: {
        delivery: updatedDelivery.rows[0],
      },
    });
  } catch (e) {
    res.status(500).end();
  }
};

const toggleDelivery = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    const belongsToCompany = await db.query(
      "SELECT delivery_company_id FROM delivery WHERE id = $1",
      [req.params.id]
    );

    if (
      belongsToCompany.rows <= 0 ||
      belongsToCompany.rows[0].delivery_company_id !== companyID
    ) {
      return res.status(400).send({
        status: "error",
        message: "There was an error with your request",
      });
    }

    const updatedDelivery = await db.query(
      "UPDATE delivery SET delivery_status = NOT delivery_status WHERE id = $1 returning delivery_status, id",
      [req.params.id]
    );

    res.status(201).json({
      status: "success",
      data: {
        delivery: updatedDelivery.rows[0],
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
};

const addDelivery = async (req, res) => {
  const { id, company_id } = req.user;

  try {
    const clientCreated = await db.query(
      "INSERT INTO client (first_name, last_name, phone_number, email, delivery_company_id) values($1, $2, $3, $4, $5) returning *",
      [
        req.body.first_name,
        req.body.last_name,
        req.body.phone_number,
        req.body.email,
        company_id,
      ]
    );
    const deliveryCreated = await db.query(
      "INSERT INTO delivery (client, delivery_day, delivery_time, delivery_driver, delivery_company_id) values ($1, $2, $3, $4, $5) returning *",
      [
        clientCreated.rows[0].id,
        req.body.delivery_day,
        req.body.delivery_time,
        id,
        company_id,
      ]
    );
    const addressCreated = await db.query(
      "INSERT INTO address (street, district, description, client_id) values($1, $2, $3, $4) returning *",
      [
        req.body.street,
        req.body.district,
        req.body.description,
        clientCreated.rows[0].id,
      ]
    );
    res.status(201).json({
      status: "success",
      data: {
        delivery: {
          ...deliveryCreated.rows[0],
          ...clientCreated.rows[0],
          ...addressCreated.rows[0],
          id: deliveryCreated.rows[0].id,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

module.exports = {
  getDeliveries,
  getDelivery,
  addDelivery,
  updateDelivery,
  toggleDelivery,
};
