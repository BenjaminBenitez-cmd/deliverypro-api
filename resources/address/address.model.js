const db = require("../../db");

const Address = {};

Address.createOne = (
  street,
  district,
  longitude,
  latitude,
  description,
  client_id,
  delivery_company_id,
  verified
) => {
  return db.query(
    "INSERT INTO address (street, district, geolocation, description, client_id,  delivery_company_id, verified) values($1, $2, ST_MakePoint($3, $4), $5, $6, $7, $8) returning *",
    [
      street,
      district,
      longitude,
      latitude,
      description,
      client_id,
      delivery_company_id,
      verified,
    ]
  );
};

Address.updateOne = (
  customerId,
  street,
  district,
  description,
  longitude,
  latitude
) => {
  return db.query(
    "UPDATE address SET street = $1, district = $2, description = $3, geolocation = ST_MakePoint($4, $5) WHERE client_id = $6 RETURNING *",
    [street, district, description, longitude, latitude, customerId]
  );
};

Address.getManyGeoJSON = (delivery_company_id) => {
  return db.query(
    "SELECT jsonb_build_object( 'type', 'FeatureCollection', 'features', jsonb_agg(features.feature) ) FROM ( SELECT jsonb_build_object( 'type', 'feature', 'id', inputs.id, 'geometry', ST_AsGeoJSON(inputs.geolocation)::jsonb, 'properties', json_build_object( 'id', inputs.id, 'name', concat(inputs.first_name, ' ', inputs.last_name), 'verified', inputs.verified ) ) AS feature FROM ( SELECT a.id, c.first_name, c.last_name, a.geolocation, a.verified FROM delivery AS d INNER JOIN client AS c ON d.client = c.id AND d.delivery_status IS FALSE INNER JOIN address AS a ON c.id = a.client_id WHERE d.delivery_company_id = $1 ) AS inputs) features",
    [delivery_company_id]
  );
};

module.exports = Address;
