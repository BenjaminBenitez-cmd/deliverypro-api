const mailer = require("../../utils/mailer");
const Invites = require("./invites.model");

const InviteServices = {};

//ADD USER AND SEND AN INVITE TO EMAIL
InviteServices.addAnInvite = async (company_id, email, name) => {
  const obj = {
    email: email,
    text: `Hey, ${name} You have been invited to become a driver for amaryllis Belize`,
  };

  try {
    const response = await Invites.getWithEmail(email);

    if (response.rows[0] !== undefined) {
      return null;
    }

    await Invites.addOne(company_id, email, name);

    const mailerResponse = await mailer(obj);

    return mailerResponse;
  } catch (err) {
    return result;
  }
};

module.exports = InviteServices;
