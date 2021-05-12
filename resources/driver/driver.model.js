const db = require("../../db");

const Driver = {};

Driver.getOne = (companyId) => {
  return db.query(
    "SELECT id, name, phone, email FROM users WHERE (role=2 and company_id = $1)",
    [companyId]
  );
};

module.exports = Driver;
