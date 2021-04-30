const express = require('express');
const router = express.Router();
const { getCustomers } = require('./customer.controllers');

router.route('/')
      .get(getCustomers)
      

module.exports.customerRouter = router;