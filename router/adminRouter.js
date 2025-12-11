const express = require("express");
const router = express.Router();
const { userAuth, adminAuth } = require("../middlewares/auth");
const adminController = require("../controller/admin/adminController")
const userController = require("../controller/admin/userController")



router.get("/login",adminController.loadLogin)
router.post('/login',adminController.login)
router.get("/",adminAuth,adminController.loadDashboard)
router.get('/logout',adminController.logout)

//costumer router
router.get("/user",adminAuth,userController.customerInfo)

module.exports = router;