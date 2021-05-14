const { ErrorHandler } = require("../../helpers/Error");
const Address = require("../address/address.model");
const Customer = require("../customer/customer.model");
const Delivery = require("./delivery.model");
const { NOT_FOUND } = require("../../helpers/ErrorCodes");

const getDeliveries = async (req, res, next) => {
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
    next(err);
  }
};

const getDelivery = async (req, res, next) => {
  if (!req.params) {
    return res
      .status(400)
      .send({ status: "error", message: "Missing parameters" });
  }

  const id = req.params.id;
  const company_id = req.user.company_id;

  try {
    const results = await Delivery.getOne(id, company_id);
    if (results.rows[0] === undefined) {
      throw new ErrorHandler(NOT_FOUND, "Unable to find delivery");
    }

    res.status(200).json({
      status: "success",
      data: {
        delivery: results.rows[0],
      },
    });
  } catch (err) {
    next(err);
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
    street,
    district,
    description,
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
    next(e);
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
    next(e);
  }
};

const addDelivery = async (req, res) => {
  const { id, company_id } = req.user;
  const {
    first_name,
    last_name,
    email,
    phone_number,
    delivery_day,
    delivery_time,
  } = req.body;

  try {
    const clientCreated = await Customer.createOne(
      first_name,
      last_name,
      phone_number,
      email,
      company_id
    );

    const deliveryCreated = await Delivery.createOne(
      clientCreated.rows[0].id,
      delivery_day,
      delivery_time,
      id,
      company_id
    );

    const addressCreated = await Address.createOne(
      street,
      district,
      clientCreated.rows[0].id
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
    next(e);
  }
};

module.exports = {
  getDeliveries,
  getDelivery,
  addDelivery,
  updateDelivery,
  toggleDelivery,
};
