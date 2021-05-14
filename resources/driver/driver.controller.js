const Driver = require("./driver.model");

const getDrivers = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    const response = await Driver.getOne(companyID);

    res.status(200).json({
      status: "success",
      results: response.rows.length,
      data: {
        drivers: response.rows,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

module.exports = {
  getDrivers,
};
