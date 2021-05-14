const db = require("../../db");

const User = {};

User.getOne = (id) => {
  return db.query(
    "SELECT id, name, phone, email FROM users WHERE users.id = $1",
    [id]
  );
};

User.updateOne = (name, id) => {
  return db.query("UPDATE users SET name=$1 WHERE id = $2 RETURNING id", [
    name,
    id,
  ]);
};

User.createOne = (name, phone_number, email, password, companyID, role) => {
  return db.query(
    "INSERT INTO users (name, phone, email, password, company_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email",
    [name, phone_number, email, password, companyID, role]
  );
};

module.exports = User;
