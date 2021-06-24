const express = require("express");
const {
  getDelivery,
  getDeliveries,
  addDelivery,
  updateDelivery,
  toggleDelivery,
  deleteDelivery,
  createVerificationToken,
} = require("./delivery.controller");
const router = express.Router();

router.route("/").get(getDeliveries).post(addDelivery);

router
  .route("/:id")
  .get(getDelivery)
  .put(updateDelivery)
  .delete(deleteDelivery);

router.route("/toggle/:id").put(toggleDelivery);

router.route("/sharablelink").post(createVerificationToken);

module.exports.deliveryRouter = router;
