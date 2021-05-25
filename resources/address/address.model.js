const db = require("../../db");

const Address = {};

Address.createOne = (
  street,
  district,
  longitude,
  latitude,
  description,
  client_id,
  delivery_company_id
) => {
  return db.query(
    "INSERT INTO address (street, district, geolocation, description, client_id, delivery_company_id) values($1, $2, ST_MakePoint($3, $4), $5, $6, $7) returning *",
    [
      street,
      district,
      longitude,
      latitude,
      description,
      client_id,
      delivery_company_id,
    ]
  );
};

Address.getManyGeoJSON = (delivery_company_id) => {
  return db.query(
    "SELECT json_build_object('type', 'FeatureCollection', 'Features', json_build_array(json_build_object( 'type', 'Feature', 'id', a.id, 'geometry', ST_AsGeoJSON(a.geolocation)::json, 'properties', json_build_object( 'id', a.id, 'name', concat(c.first_name, ' ', c.last_name) )) )) FROM delivery AS d INNER JOIN client AS c ON d.client = c.id AND d.delivery_status IS FALSE INNER JOIN address AS a ON c.id = a.client_id WHERE d.delivery_company_id = $1",
    [delivery_company_id]
  );
};

module.exports = Address;
