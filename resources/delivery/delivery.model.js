const db = require("../../db");

//EMPTY OBJECT

const Delivery = {};

//GET ALL DELIVERIES
Delivery.create = (
  client,
  delivery_day,
  delivery_time,
  delivery_driver,
  delivery_company_id
) => {
  return db.query(
    `INSERT INTO delivery (client, delivery_day, delivery_time, delivery_driver, delivery_company_id) values ($1, $2, $3, $4, $5) returning *`,
    [client, delivery_day, delivery_time, delivery_driver, delivery_company_id]
  );
};

//GET A DELIVERY
Delivery.getOne = (id, company_id) => {
  return db.query(
    `SELECT * FROM delivery WHERE (id = $1 and delivery_company_id = $2)`,
    [id, company_id]
  );
};
//GET ALL DELIVERIES
Delivery.getMany = (company_id) => {
  return db.query(`SELECT * FROM delivery WHERE delivery_company_id = $1`, [
    company_id,
  ]);
};

// DELETE A DELIVERY
Delivery.remove = (id, company_id) => {
  return db.query(
    `DELETE FROM delivery WHERE (id=$1 and delivery_company_id = $2)`,
    [id, company_id]
  );
};

module.exports = Delivery;
