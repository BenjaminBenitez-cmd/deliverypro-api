const db = require("../../db");
const { mailer } = require("../../utils/mailer");

const getUser = async (req, res) => {
  if (req.user === undefined) {
    return res
      .status(400)
      .send({ status: "error", message: "Invalid request" });
  }
  const id = req.user.id;

  try {
    const results = await db.query(
      "SELECT id, name, phone, email FROM users WHERE users.id = $1",
      [id]
    );
    res.status(200).json({
      status: "success",
      data: {
        users: results.rows[0],
      },
    });
  } catch (err) {
    res.status(500).end();
  }
};

//allows the user to allowed credentials

const updateUser = async (req, res) => {
  if (req.user === undefined) {
    return res
      .status(400)
      .send({ status: "error", message: "Invalid request" });
  }

  if (
    !req.body.user_name ||
    !req.body.company_name ||
    !req.body.company_location
  ) {
    return res
      .status(400)
      .send({ status: "error", message: "Missing Parameters" });
  }

  const userID = req.user.id;
  const companyID = req.user.company_id;
  const { user_name, company_name, company_location } = req.body;

  try {
    const userUpdated = await db.query(
      "UPDATE users SET name=$1 WHERE id = $2 RETURNING id",
      [user_name, userID]
    );
    if (userUpdated.rows <= 0) {
      return res
        .status(500)
        .send({ status: "error", message: "An error occured" });
    }
    const companyUpdated = await db.query(
      "UPDATE company SET name=$1, location=$2 WHERE id = $3 RETURNING id",
      [company_name, company_location, companyID]
    );
    if (companyUpdated.rows <= 0) {
      return res
        .status(500)
        .send({ status: "error", message: "An error occured" });
    }

    res.status(200).json({ status: "success" });

    console.log("sucess");
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};
module.exports = {
  getUser,
  updateUser,
};
