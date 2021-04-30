const express = require('express');
const { getUsers, getUser, addUserInvite, getUserInvites } = require('./user.controller');
const router = express.Router();

router.route('/')
      .get(getUsers)

router.route('/:id')
      .get(getUser);

router.route('/invites')
      .post(addUserInvite)

router.route('/invites/:id')
      .get(getUserInvites)

      


module.exports.userRouter = router;