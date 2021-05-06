const createHttpError = require("http-errors");
const db = require("../../db");

const getCustomers = async (req, res, next) => {
  const { company_id } = req.user;

  try {
    const results = await db.query(
      "SELECT c.first_name, c.last_name, c.email,  COUNT(*) filter (where NOT delivery_status) as pending_deliveries, COUNT(*) filter (where delivery_status) AS completed_deliveries FROM client AS c INNER JOIN delivery AS d ON c.id = d.client WHERE c.delivery_company_id = $1 GROUP BY c.first_name, c.last_name, c.email",
      [company_id]
    );
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
