const Company = require("../company/company.model");
const User = require("./user.model");

const getUser = async (req, res) => {
  if (req.user === undefined) {
    return res
      .status(400)
      .send({ status: "error", message: "Invalid request" });
  }
  const id = req.user.id;

  try {
    const results = await User.getOne(id);

    res.status(200).json({
      status: "success",
      data: {
        users: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
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
    const userUpdated = await User.updateOne(user_name, userID);

    //ENSURE THAT THE USERS WERE INSERTED
    if (userUpdated.rows <= 0) {
      return res
        .status(500)
        .send({ status: "error", message: "An error occured" });
    }

    const companyUpdated = await Company.updateOne(
      company_name,
      company_location,
      companyID
    );

    //ENSURE THAT THE COMPANY WAS UPDATED
    if (companyUpdated.rows <= 0) {
      return res
        .status(500)
        .send({ status: "error", message: "An error occured" });
    }

    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};
module.exports = {
  getUser,
  updateUser,
};
