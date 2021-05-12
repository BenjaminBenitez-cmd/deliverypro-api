const db = require("../../db");

const Time = {};

//GET ALL TIMES
Time.getMany = (id) => {
  return db.query(
    "SELECT t.id, t.time_start, t.time_end, n.name, n.id AS name_of_day_id FROM times As t INNER JOIN names_of_days AS n ON t.name_of_day_id = n.id WHERE t.schedule_id = $1",
    [id]
  );
};
//GET A TIME

Time.getOne = (id) => {
    return db.query(, [id]);
}

//UPDATE A TIME
Time.updateOne = (id) => {
    return db.query(, [id]);
}

//DELETE A TIME
Time.deleteOne = (id) => {
    return db.query(, [id]);
}

module.exports = Time;
