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
    "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geolocation)::json As geometry, row_to_json(lp) As properties FROM address As lg INNER JOIN (SELECT id, street FROM address) As lp ON lg.id = lp.id AND lg.delivery_company_id = $1  ) As f )  As fc",
    [delivery_company_id]
  );
};

module.exports = Address;
