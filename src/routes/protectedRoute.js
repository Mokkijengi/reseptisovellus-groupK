const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

//route is proceted by token, user must be logged in to access this route
router.get('/', verifyToken, (req, res) => {
  res.json({ success: true, message: 'You are authenticated', user: req.user });
});

module.exports = router;
