const Token = require("./token.model");
const { hashPassword } = require("../../utils/encrypt");
const { v4: uuidv4 } = require("uuid");

const generateTokenService = async (companyID) => {
  try {
    const token = uuidv4();
    const identifier = token.slice(0, 6);
    const hash = await hashPassword(token);
    await Token.insertOne(hash, identifier, companyID);
    return { identifier, token };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  generateTokenService,
};
