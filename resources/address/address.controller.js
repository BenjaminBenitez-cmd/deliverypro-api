const checkResults = require("../../helpers/ResultsChecker");
const Address = require("./address.model");

const getGeoJSON = async (req, res, next) => {
  const companyID = req.user.company_id;

  try {
    const response = await Address.getManyGeoJSON(companyID);
    checkResults(response);

    res.status(200).json({
      status: "success",
      data: {
        addresses: response.rows[0].row_to_json,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  getGeoJSON,
};
