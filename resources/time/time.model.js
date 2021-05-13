const db = require("../../db");

const Time = {};

//GET ALL TIMES
Time.getMany = (scheduleId) => {
  return db.query(
    "SELECT t.id, t.time_start, t.time_end, n.name, n.id AS name_of_day_id FROM times As t INNER JOIN names_of_days AS n ON t.name_of_day_id = n.id WHERE t.schedule_id = $1",
    [scheduleId]
  );
};
//GET A TIME

Time.getOne = (id) => {
  return db.query(
    "SELECT t.id, t.time_start, t.time_end, n.name, n.id AS name_of_day_id FROM times As t INNER JOIN names_of_days AS n ON t.name_of_day_id = n.id WHERE t.id = $1",
    [id]
  );
};

//TIME ADD ONE
Time.createOne = (time_start, time_end, name_of_day_id, schedule_id) => {
  return db.query(
    "WITH inserted AS (INSERT INTO times (time_start, time_end, name_of_day_id, schedule_id) VALUES ($1, $2, $3, $4) RETURNING *) SELECT inserted.*, names_of_days.name FROM inserted INNER JOIN names_of_days ON inserted.name_of_day_Id = names_of_days.id",
    [time_start, time_end, name_of_day_id, schedule_id]
  );
};

//UPDATE A TIME
Time.updateOne = (time_start, time_end, id) => {
  return db.query(
    "UPDATE times SET time_start = $1, time_end = $2 WHERE id = $3 returning *",
    [time_start, time_end, id]
  );
};

//DELETE A TIME
Time.deleteOne = (id) => {
  return db.query("DELETE FROM times WHERE id = $1", [id]);
};

module.exports = Time;
