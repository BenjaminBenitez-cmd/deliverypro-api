const { generateTokenService } = require("./token.service");

const generateToken = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    const { identifier, token } = await generateTokenService.generateToken(
      companyID
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
