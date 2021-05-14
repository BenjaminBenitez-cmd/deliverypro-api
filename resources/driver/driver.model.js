const db = require("../../db");

const Driver = {};

Driver.createOne = () => {
  return db.query(
    "INSERT INTO users (name, email, phone, password, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, phone, name",
    []
  );
};

Driver.getOne = (companyId) => {
  return db.query(
    "SELECT id, name, phone, email FROM users WHERE (role=2 and company_id = $1)",
    [companyId]
  );
};

module.exports = Driver;
