const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../../utils/encrypt");
const Token = require("./token.model");
const { generateTokenService } = require("./token.service");

const generateToken = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    await generateTokenService.generateToken(companyID);

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
