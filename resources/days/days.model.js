const db = require("../../db");

const Days = {};

Days.getMany = () => {
  return db.query("SELECT * FROM names_of_days");
};

module.exports = Days;
