const db = require("../../db");
const Delivery = require("./delivery.model");

const getDeliveries = async (req, res) => {
  const company_id = req.user.company_id;

  try {
    const results = await Delivery.getMany(company_id);
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
    const results = await Delivery.getOne(id, company_id);

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
    const updatedDelivery = await Delivery.updateOne(
      id,
      companyID,
      delivery_day,
      delivery_time,
      delivery_driver,
      delivery_status
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
  const id = req.params.id;

  try {
    const updatedDelivery = await Delivery.updateFullfillment(id, companyID);

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
