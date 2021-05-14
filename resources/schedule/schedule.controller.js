const createHttpError = require("http-errors");
const db = require("../../db");
const Days = require("../days/days.model");
const Time = require("../time/time.model");
const Schedule = require("./schedule.model");

//GET A SCHEDULE
const getCompanySchedule = async (req, res) => {
  const companyID = req.user.company_id;
  try {
    const results = await Schedule.getOne(companyID);
    const daysAvailable = await Days.getMany();
    if (results.rows[0] === undefined) {
      return res
        .status(404)
        .send({ status: "not found", message: "No active schedule" });
    }

    const times = await Time.getMany(results.rows[0].id);
    console.log(times);
    res.status(200).json({
      status: "success",
      data: {
        schedule: {
          id: results.rows[0].id,
          days: times.rows,
        },
        days_available: daysAvailable.rows,
      },
    });
  } catch (err) {
    res.status(500).end();
  }
};

//DELETE A SCHEDULE
const deleteSchedule = async (req, res) => {
  try {
    await Schedule.deleteOne(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).end();
  }
};

//ADD A SCHEDULE
const addCompanySchedule = async (req, res) => {
  if (!req.user) {
    return res.status(400).send({ status: "error", message: "Not Authorized" });
  }

  if (!req.body.name) {
    return res.status(400).send({ status: "error", message: "Missing name" });
  }

  const name = req.body.name;

  const companyID = req.user.company_id;

  try {
    const results = await Schedule.create(name, companyID);

    if (results.rows[0] === undefined) {
      return res
        .status(400)
        .send({ status: "error", message: "Unable to process request" });
    }

    res.status(201).json({
      status: "success",
      data: {
        schedule: results.rows[0],
      },
    });
  } catch (err) {
    res.status(500).end();
  }
};

//ADD A DAY
const addDayAndTime = async (req, res, next) => {
  if (
    !req.body.name_of_day_id ||
    !req.body.time_start ||
    !req.body.time_end ||
    !req.body.schedule_id
  ) {
    return next(createHttpError(401, "Invalid or missing fields"));
  }

  const { name_of_day_id, time_start, time_end, schedule_id } = req.body;

  const companyID = req.user.company_id;

  try {
    //fetch the company id
    const isValid = await db.query(
      "SELECT company_id FROM schedules WHERE id = $1",
      [schedule_id]
    );
    //if the company_id does not exist, that means the request is not valid
    if (
      isValid.rows[0] === undefined ||
      isValid.rows[0].company_id !== companyID
    ) {
      return res
        .status(401)
        .send({ status: "error", message: "Not Authorized" });
    }

    //then insert the time
    const time = await Time.createOne(
      time_start,
      time_end,
      name_of_day_id,
      schedule_id
    );

    //Proceed to insert the days
    if (time.rows[0] === undefined) {
      res.status(500).send({
        status: "error",
        message: "There was an error with your request",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        time: time.rows[0],
      },
    });
  } catch (err) {
    return next(createHttpError(500, "an error occured"));
  }
};

const deleteDaysAndTime = async (req, res) => {
  try {
    await Time.deleteOne(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).end();
  }
};

const updateTime = async (req, res) => {
  if ((!req.body.time_start, !req.body.time_end)) {
    return res
      .status(400)
      .send({ status: "error", message: "Missing time parameters" });
  }

  const id = req.params.id;
  const { time_start, time_end } = req.body;
  try {
    const results = await Time.updateOne(time_start, time_end, id);

    if (results.rows[0] === undefined) {
      return res
        .status(500)
        .send({ status: "error", message: "There was an error" });
    }

    res.status(200).json({
      status: "success",
      data: {
        time: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

module.exports = {
  getCompanySchedule,
  addCompanySchedule,
  addDayAndTime,
  deleteDaysAndTime,
  deleteSchedule,
  updateTime,
};
