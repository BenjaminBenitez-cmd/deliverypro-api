const express = require("express");
const {
  getDelivery,
  getDeliveries,
  addDelivery,
  updateDelivery,
  toggleDelivery,
} = require("./delivery.controller");
const router = express.Router();

router.route("/").get(getDeliveries).post(addDelivery);

router.route("/:id").get(getDelivery).put(updateDelivery);

router.route("/toggle/:id").put(toggleDelivery);

module.exports.deliveryRouter = router;
