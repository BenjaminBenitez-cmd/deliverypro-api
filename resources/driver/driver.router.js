const express = require('express');
const router = express.Router();
const { getDrivers } = require('./driver.controller');

router.route('/')
    .get(getDrivers)

module.exports.driverRouter = router;