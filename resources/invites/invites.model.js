const db = require("../../db");

const Invites = {};

Invites.addOne = (company, email, name) => {
  return db.query(
    "INSERT INTO invites (company, email, name) VALUES ($1, $2, $3)",
    [company, email, name]
  );
};

Invites.getOne = (companyID) => {
  return db.query("SELECT * FROM invites WHERE invites.company = $1", [
    companyID,
  ]);
};

Invites.getWithEmail = (email) => {
  return db.query("SELECT * FROM invites WHERE invites.email = $1", [email]);
};

module.exports = Invites;
