const express = require('express');
const { addUserInvite, getUserInvites } = require('./invites.controller');
const router = express.Router();

router.route('/')
        .get(getUserInvites)
        .post(addUserInvite)

module.exports.invitesRouter = router;