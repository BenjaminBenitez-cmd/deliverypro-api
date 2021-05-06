const express = require("express");
const { getUser, updateUser } = require("./user.controller");
const router = express.Router();

router.route("/").get(getUser).put(updateUser);

module.exports.userRouter = router;
