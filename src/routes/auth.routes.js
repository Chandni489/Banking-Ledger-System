var express = require('express');
const authController=require('../controllers/auth.controller')

var router = express.Router();

/* GET home page. */
router.post('/register',authController.userRegisterController) 
router.post('/login',authController.userLoginController) 

module.exports = router;
