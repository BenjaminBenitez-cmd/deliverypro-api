const express = require("express");
const {
  getCompanySchedule,
  addCompanySchedule,
  addDayAndTime,
  deleteDaysAndTime,
  deleteSchedule,
  updateTime,
} = require("./schedule.controller");
const router = express.Router();

router.route("/").get(getCompanySchedule).post(addCompanySchedule);

router.route("/:id").delete(deleteSchedule);

router.route("/time").post(addDayAndTime);

router.route("/time/:id").delete(deleteDaysAndTime).put(updateTime);

module.exports.schedulesRouter = router;
