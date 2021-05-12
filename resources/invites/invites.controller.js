const InviteServices = require("./invite.service");
const Invites = require("./invites.model");

const getUserInvites = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Not authorized" });
  }
  const companyID = req.user.company_id;
  try {
    const results = await Invites.getOne(companyID);

    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data: {
        invites: results.rows,
      },
    });
  } catch (err) {
    res.status(500).end();
  }
};

const addUserInvite = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: "error", message: "Not authorized" });
  }

  if (!req.body.email || !req.body.name) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing Parameters" });
  }
  const { email, name } = req.body;

  //remove this for production
  const companyID = req.user.company_id;

  try {
    const response = await InviteServices.addAnInvite(companyID, email, name);

    if (!response) {
      return res
        .status(500)
        .json({ status: "error", message: "Something went wrong" });
    }

    res.status(200).json({ status: "success", message: response });
  } catch (err) {
    res.status(500).end();
  }
};

module.exports = {
  getUserInvites,
  addUserInvite,
};
