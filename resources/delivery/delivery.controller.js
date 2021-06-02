const Address = require("../address/address.model");
const Customer = require("../customer/customer.model");
const Delivery = require("./delivery.model");
const {
  INCOMPLETE_PARAMETERS,
  NOT_FOUND,
} = require("../../helpers/ErrorCodes");
const { ErrorHandler } = require("../../helpers/Error");
const checkResults = require("../../helpers/ResultsChecker");
const { getCoordinates } = require("./delivery.services");

const getDeliveries = async (req, res, next) => {
  const company_id = req.user.company_id;

  try {
    const results = await Delivery.getMany(company_id);
    checkResults(results);
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        deliveries: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
    next(new ErrorHandler(NOT_FOUND, "No deliveries"));
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
    first_name,
    last_name,
    phone_number,
    email,
    delivery_day,
    delivery_time,
    street,
    district,
    description,
    longitude,
    latitude,
  } = req.body;

  try {
    const updatedDelivery = await Delivery.updateOne(
      id,
      delivery_day,
      delivery_time,
      companyID
    );

    checkResults(updatedDelivery, "Delivery Not Found");

    const updatedCustomer = await Customer.updateOne(
      updatedDelivery.rows[0].client,
      first_name,
      last_name,
      phone_number,
      email,
      companyID
    );

    checkResults(updatedCustomer, "Customer not found");

    const updatedAddress = await Address.updateOne(
      updatedCustomer.rows[0].id,
      street,
      district,
      description,
      longitude,
      latitude
    );

    checkResults(updatedAddress, "Address Not Found");

    res.status(201).json({
      status: "success",
    });
  } catch (e) {
    console.log(e);
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
  let {
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

    let verified = false;

    if (longitude === undefined && latitude === undefined) {
      const coordinates = await getCoordinates(street, district);
      longitude = coordinates[0];
      latitude = coordinates[1];
    } else {
      verified = true;
    }

    const addressCreated = await Address.createOne(
      street,
      district,
      longitude,
      latitude,
      description,
      clientCreated.rows[0].id,
      company_id,
      verified
    );

    res.status(201).json({
      status: "success",
      data: {
        delivery: {
          id: deliveryCreated.rows[0].id,
          client: clientCreated.rows[0].id,
          delivery_status: deliveryCreated.rows[0].status,
          delivery_time: deliveryCreated.rows[0].delivery_time,
          delivery_day: deliveryCreated.rows[0].delivery_day,
          first_name: clientCreated.rows[0].first_name,
          last_name: clientCreated.rows[0].last_name,
          phone_number: clientCreated.rows[0].phone_number,
          email: clientCreated.rows[0].email,
          district: addressCreated.rows[0].district,
          street: addressCreated.rows[0].street,
          geolocation: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
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
