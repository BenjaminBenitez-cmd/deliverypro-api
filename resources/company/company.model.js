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

Company.updateOne = (name, location, id) => {
  return db.query(
    "UPDATE company SET name=$1, location=$2 WHERE id = $3 RETURNING id",
    [name, location, id]
  );
};

module.exports = Company;
