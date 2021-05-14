const db = require("../../db");

const Token = {};

Token.insertOne = (hash, identifier, companyID) => {
  return db.query(
    "UPDATE company SET company_api_key = $1, company_api_key_id = $2 WHERE id = $3 RETURNING id",
    [hash, identifier, companyID]
  );
};

module.exports = Token;
