const db = require("../../db");

const Address = {};

Address.createOne = (street, district, description, client_id) => {
  return db.query(
    "INSERT INTO address (street, district, description, client_id) values($1, $2, $3, $4) returning *",
    [street, district, description, client_id]
  );
};

module.exports = Address;
