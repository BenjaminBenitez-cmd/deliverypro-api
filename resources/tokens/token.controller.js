const { v4: uuidv4 } = require("uuid");
const db = require("../../db");
const { hashPassword } = require("../../utils/encrypt");

const generateToken = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    const token = uuidv4();
    const identifier = token.slice(0, 6);
    const hash = await hashPassword(token);
    const submitedToken = await db.query(
      "UPDATE company SET company_api_key = $1, company_api_key_id = $2 WHERE id = $3 RETURNING id",
      [hash, identifier, companyID]
    );
    res.status(200).send({
      status: "success",
      data: {
        token: {
          api_key: identifier,
          secret_key: token,
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  generateToken,
};
