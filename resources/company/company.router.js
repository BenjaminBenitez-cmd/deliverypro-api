const express = require('express');
const router = express.Router();
const { getCompanies, getCompany } = require('./company.controllers');

// get many
router.get('/', getCompany);

module.exports.companyRouter = router;

