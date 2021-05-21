const Address = require("../address/address.model");
const Customer = require("../customer/customer.model");
const Delivery = require("./delivery.model");
const { INCOMPLETE_PARAMETERS } = require("../../helpers/ErrorCodes");
const { ErrorHandler } = require("../../helpers/Error");
const checkResults = require("../../helpers/ResultsChecker");

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
    throw new ErrorHandler(INCOMPLETE_PARAMETERS, "Missing id parameter");
  }

  const id = req.params.id;
  const company_id = req.user.company_id;

  try {
    const results = await Delivery.getOne(id, company_id);

    checkResults(results, "Delivery not found");

    res.status(200).json({
      status: "success",
      data: {
        delivery: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const updateDelivery = async (req, res, next) => {
  //needs repairs
  if (!req.body || !req.params.id) {
    throw new ErrorHandler(INCOMPLETE_PARAMETERS, "Missing parameters");
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

    checkResults(updatedDelivery, "Delivery not found");

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

const toggleDelivery = async (req, res, next) => {
  const companyID = req.user.company_id;
  const id = req.params.id;

  try {
    const updatedDelivery = await Delivery.updateFullfillment(id, companyID);
    checkResults(updatedDelivery, "Delivery not found");

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

const addDelivery = async (req, res, next) => {
  const { id, company_id } = req.user;
  const {
    first_name,
    last_name,
    email,
    phone_number,
    delivery_day,
    delivery_time,
    street,
    district,
    description,
    longitude,
    latitude,
  } = req.body;

  console.log(req.body);
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
      longitude,
      latitude,
      description,
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
    console.log(err);
    next(err);
  }
};

module.exports = {
  getDeliveries,
  getDelivery,
  addDelivery,
  updateDelivery,
  toggleDelivery,
};
