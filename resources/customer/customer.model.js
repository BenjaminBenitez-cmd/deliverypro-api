const db = require("../../db");

const Customer = {};

Customer.getMany = (companyId) => {
  return db.query(
    "SELECT c.first_name, c.last_name, c.email,  COUNT(*) filter (where NOT delivery_status) as pending_deliveries, COUNT(*) filter (where delivery_status) AS completed_deliveries FROM client AS c INNER JOIN delivery AS d ON c.id = d.client WHERE c.delivery_company_id = $1 GROUP BY c.first_name, c.last_name, c.email",
    [companyId]
  );
};

module.exports = Customer;
