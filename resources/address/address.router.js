const express = require("express");
const { getGeoJSON } = require("./address.controller");

const router = express.Router();

router.route("/").get(getGeoJSON);

module.exports.addressRouter = router;
