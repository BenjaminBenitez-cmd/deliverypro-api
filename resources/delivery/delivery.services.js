const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({
  accessToken:
    "pk.eyJ1IjoiYmVuamFtaW5iZW5pdGV6IiwiYSI6ImNramM5NnF3ZjRuZGcyeG0weG9ldmU3b3cifQ.LKi3n1aGMY68vlmW0OerhQ",
});

const getCoordinates = (street, district) => {
  return new Promise((resolve, reject) => {
    geocodingClient
      .forwardGeocode({
        query: street + ", " + district,
      })
      .send()
      .then((response) => {
        const match = response.body;
        resolve(match.features[0].center);
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  getCoordinates,
};
