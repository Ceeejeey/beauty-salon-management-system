const express = require('express');
const { signup, signupHandler, signin } = require('../controllers/authController/authController');

const authRouter = express.Router();
// Route for user signup
authRouter.post('/signup', signup, signupHandler);
//Route for signin
authRouter.post('/signin', signin);

module.exports = authRouter;