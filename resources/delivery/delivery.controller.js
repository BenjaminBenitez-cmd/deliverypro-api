require("dotenv").config();
const Address = require("../address/address.model");
const Customer = require("../customer/customer.model");
const Delivery = require("./delivery.model");
const {
  INCOMPLETE_PARAMETERS,
  NOT_FOUND,
  NOT_AUTHORIZED,
} = require("../../helpers/ErrorCodes");
const { ErrorHandler } = require("../../helpers/Error");
const checkResults = require("../../helpers/ResultsChecker");
const { getCoordinates } = require("./delivery.services");
const jwt = require("jsonwebtoken");
const Time = require("../time/time.model");
const Company = require("../company/company.model");
const db = require("../../db");

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

const getDeliveryForCustomer = async (req, res, next) => {
  if (!req.params) {
    throw new ErrorHandler(INCOMPLETE_PARAMETERS, "Missing id parameter");
  }

  //The delivery id must be sent through the body
  const delivery_id = req.user.delivery_id;
  const company_id = req.user.company_id;

  try {
    const deliveryResult = await Delivery.getOne(delivery_id, company_id);
    checkResults(deliveryResult, "Delivery not found");

    const customerResult = await Customer.getOne(
      deliveryResult.rows[0].client,
      company_id
    );
    checkResults(customerResult, "No results found");

    //We will then fetch the time
    const timeResult = await Time.getOne(deliveryResult.rows[0].delivery_time);
    checkResults(timeResult, "No time found");

    //We will fetch the address as well
    const addressResult = await Address.getOne(
      deliveryResult.rows[0].client,
      company_id
    );
    checkResults(addressResult, "No address found");

    //Fetch the company we need it for the name
    const companyResult = await Company.getOne(company_id);
    checkResults(companyResult, "No company found");

    res.status(200).json({
      status: "success",
      data: {
        delivery: {
          company_name: `${companyResult.rows[0].name}`,
          destination: `${addressResult.rows[0].street}, ${addressResult.rows[0].district}`,
          estimated: `${timeResult.rows[0].time_start} - ${timeResult.rows[0].time_end}, ${deliveryResult.rows[0].delivery_date}`,
          customer_name: `${customerResult.rows[0].first_name} ${customerResult.rows[0].last_name}`,
          phone: `${customerResult.rows[0].phone_number}`,
          district: `${addressResult.rows[0].district}`,
          geolocation: `${addressResult.rows[0].location}`,
        },
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const updateDeliveryVerification = async (req, res, next) => {
  const { company_id, delivery_id } = req.user;
  const { longitude, latitude } = req.body;
  try {
    if (!longitude || !latitude) {
      throw new ErrorHandler(INCOMPLETE_PARAMETERS, "Incomplete parameters");
    }

    const deliveryResult = await Delivery.getOne(delivery_id, company_id);
    checkResults(deliveryResult, "Delivery not found");

    const updateVerify = await Delivery.updateFullfillment(
      delivery_id,
      company_id
    );

    checkResults(updateVerify, "Delivery not found");

    const updateAddress = await db.query(
      "UPDATE address SET geolocation = ST_MakePoint($1, $2) WHERE client_id = $3 returning *",
      [longitude, latitude, deliveryResult.rows[0].client]
    );

    checkResults(updateAddress, "Address not found");
    res.status(204).end();
  } catch (err) {
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

    res.status(204).json({
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
    delivery_date,
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
      delivery_date,
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

const deleteDelivery = async (req, res, next) => {
  const id = req.params.id;
  const companyID = req.user.company_id;

  try {
    const deleted = await Delivery.removeOne(id, companyID);

    checkResults(deleted, "unable to delete");

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const createVerificationToken = async (req, res, next) => {
  const companyID = req.user.company_id;
  const clientID = req.body.client_id;
  const deliveryID = req.body.delivery_id;

  //test if the parameters were sent
  try {
    if (!clientID || !deliveryID) {
      throw new ErrorHandler(
        INCOMPLETE_PARAMETERS,
        "Missing delivery id or client id"
      );
    }
  } catch (err) {
    next(err);
  }

  try {
    /**In this block we fetch the delivery that was requested to be changed, 
    by delivery_id and company_id **/
    const deliveryResult = await Delivery.getOne(deliveryID, companyID);

    checkResults(deliveryResult, "No delivery found");

    /**if the results id does not match the client_id 
    we received then we return an unauthorized error **/
    if (deliveryResult.rows[0].client !== clientID) {
      throw new ErrorHandler(NOT_AUTHORIZED, "Not Authorized");
    }

    const token = jwt.sign(
      {
        id: clientID,
        delivery_id: deliveryID,
        company_id: companyID,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES || "1hr",
      }
    );

    res.status(200).json({
      status: "success",
      link: `${process.env.FRONTEND_URL}/verifyaddress/${token}`,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  createVerificationToken,
  deleteDelivery,
  getDeliveries,
  getDelivery,
  addDelivery,
  updateDelivery,
  toggleDelivery,
  getDeliveryForCustomer,
  updateDeliveryVerification,
};
