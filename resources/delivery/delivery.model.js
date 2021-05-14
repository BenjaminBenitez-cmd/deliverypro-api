const db = require("../../db");

//EMPTY OBJECT

const Delivery = {};

//GET ALL DELIVERIES
Delivery.createOne = (
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
  return db.query(
    `WITH query_delivery AS ( SELECT dl.id, dl.client, dl.delivery_status, t.time_start, t.time_end, n.name AS delivery_day FROM delivery AS dl INNER JOIN times AS t ON dl.delivery_time = t.id INNER JOIN names_of_days AS n ON dl.delivery_day = n.id WHERE dl.delivery_company_id = $1 ) , query_clients AS ( SELECT client.id, client.first_name, client.last_name, client.phone_number, client.email, address.district, address.street FROM client INNER JOIN address ON address.client_id = client.id WHERE delivery_company_id = $1 ) SELECT query_delivery.*, query_clients.first_name, query_clients.last_name, query_clients.phone_number, query_clients.email, query_clients.district, query_clients.street FROM query_delivery INNER JOIN query_clients ON query_delivery.client = query_clients.id`,
    [company_id]
  );
};

//UPDATE DELIVERY
Delivery.updateOne = (
  id,
  delivery_company_id,
  delivery_day,
  delivery_time,
  delivery_driver,
  delivery_status
) => {
  return db.query(
    "UPDATE delivery SET delivery_day = $1, delivery_time = $2, delivery_driver = $3, delivery_status = $4 WHERE (id = $5 and delivery_company_id = $6) RETURNING *",
    [
      delivery_day,
      delivery_time,
      delivery_driver,
      delivery_status,
      id,
      delivery_company_id,
    ]
  );
};

// DELETE A DELIVERY
Delivery.remove = (id, company_id) => {
  return db.query(
    `DELETE FROM delivery WHERE (id=$1 and delivery_company_id = $2)`,
    [id, company_id]
  );
};

Delivery.updateFullfillment = (id, delivery_company_id) => {
  return db.query(
    "UPDATE delivery SET delivery_status = NOT delivery_status WHERE (id = $1 and delivery_company_id = $2) returning delivery_status, id",
    [id, delivery_company_id]
  );
};

module.exports = Delivery;
