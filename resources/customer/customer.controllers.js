const Customer = require("./customer.model");

const getCustomers = async (req, res, next) => {
  const { company_id } = req.user;

  try {
    const results = await Customer.getMany(company_id);
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        customers: results.rows,
      },
    });
  } catch (err) {
    res.status(500).end();
  }
};

module.exports = {
  getCustomers,
};
