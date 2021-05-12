const db = require("../../db");

const Schedule = {};

Schedule.create = (name, companyId) => {
  return db.query(
    "INSERT INTO schedules (name, company_id) VALUES ($1, $2) returning *",
    [name, companyId]
  );
};

Schedule.getOne = (companyId) => {
  return db.query(
    "SELECT id, name FROM schedules WHERE (schedules.company_id = $1 and schedules.active = true)",
    [companyId]
  );
};

Schedule.deleteOne = (scheduleId) => {
  return db.query("DELETE FROM schedule WHERE id = $1", [scheduleId]);
};
