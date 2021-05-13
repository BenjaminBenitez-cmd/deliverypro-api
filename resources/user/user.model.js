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

module.exports = User;
