const Time = require("./time.model");

//UPDATE A TIME FRAME
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

//DELETE A TIME FRAME
const deleteDaysAndTime = async (req, res) => {
  try {
    await Time.deleteOne(id);
    res.status(204).end();
  } catch (err) {
    res.status(500).end();
  }
};

//ADD A DAY AND TIME
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

module.exports = {
  updateTime,
  deleteDaysAndTime,
  addDayAndTime,
};
