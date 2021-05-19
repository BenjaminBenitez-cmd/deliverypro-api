const express = require("express");
const {
  deleteDaysAndTime,
  getTime,
  getTimes,
  updateTime,
} = require("./time.controller");
const router = express.Router();

router.route("/").get(getTimes);

router.route("/:id").get(getTime).delete(deleteDaysAndTime).put(updateTime);

module.exports.timeRouter = router;
