const express = require("express");
const { generateToken } = require("./token.controller");
const router = express.Router();

router.route("/").post(generateToken);

module.exports.tokenRouter = router;
