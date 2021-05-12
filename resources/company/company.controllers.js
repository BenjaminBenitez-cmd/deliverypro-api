const Company = require("./company.model");

const getCompany = async (req, res) => {
  const companyID = req.user.company_id;

  try {
    const result = await Company.getOne(companyID);

    res.status(200).json({
      status: "success",
      data: {
        company: result.rows[0],
      },
    });
  } catch (err) {
    res.status(500).end();
  }
};

module.exports = {
  getCompany,
};
