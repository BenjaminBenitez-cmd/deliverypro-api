const db = require("../../db");

const Address = {};

Address.createOne = (
  street,
  district,
  longitude,
  latitude,
  description,
  client_id
) => {
  return db.query(
    "INSERT INTO address (street, district, longitude, latitude, description, client_id) values($1, $2, $3, $4, $5, $6) returning *",
    [street, district, longitude, latitude, description, client_id]
  );
};

module.exports = Address;
