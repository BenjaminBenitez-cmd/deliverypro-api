const db = require("../../db");

const Company = {};

//Get a Company
Company.getOne = (companyId) => {
  return db.query("SELECT * FROM company WHERE id = $1", [companyId]);
};

Company.create = (name, email) => {
  return db.query("INSERT INTO company (name, email) VALUES ($1, $2)", [
    name,
    email,
  ]);
};

module.exports = Company;
