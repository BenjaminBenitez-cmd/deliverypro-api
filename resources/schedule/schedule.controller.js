const createHttpError = require("http-errors");
const { checkForUser } = require("../../components/checkForUser");
const db = require("../../db");

const getCompanySchedule = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    const results = await db.query(
      "SELECT id, name FROM schedules WHERE (schedules.company_id = $1 and schedules.active = true)",
      [companyID]
    );

    const daysAvailable = await db.query("SELECT * FROM names_of_days");

    if (results.rows[0] === undefined) {
      return res
        .status(404)
        .send({ status: "not found", message: "No active schedule" });
    }

    const days = await db.query(
      "SELECT t.id, t.time_start, t.time_end, n.name, n.id AS name_of_day_id FROM times As t INNER JOIN names_of_days AS n ON t.name_of_day_id = n.id WHERE t.schedule_id = $1",
      [results.rows[0].id]
    );

    res.status(200).json({
      status: "success",
      data: {
        schedule: {
          id: results.rows[0].id,
          days: days.rows,
        },
        days_available: daysAvailable.rows,
      },
    });
  } catch (err) {
    res.status(400).end();
  }
};

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
    const results = await db.query(
      "INSERT INTO schedules (name, company_id) VALUES ($1, $2) returning *",
      [name, companyID]
    );

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
    const time = await db.query(
      "WITH inserted AS (INSERT INTO times (time_start, time_end, name_of_day_id, schedule_id) VALUES ($1, $2, $3, $4) RETURNING *) SELECT inserted.*, names_of_days.name FROM inserted INNER JOIN names_of_days ON inserted.name_of_day_Id = names_of_days.id",
      [time_start, time_end, name_of_day_id, schedule_id]
    );

    //Proceed to insert the days
    if (time.rows[0] === undefined) {
      res
        .status(500)
        .send({
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
    await db.query("DELETE FROM times WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).end();
  }
};

const deleteSchedule = async (req, res) => {
  try {
    await db.query("DELETE FROM schedules WHERE id = $1", [req.params.id]);
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
    const results = await db.query(
      "UPDATE times SET time_start = $1, time_end = $2 WHERE id = $3 returning *",
      [time_start, time_end, id]
    );

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
