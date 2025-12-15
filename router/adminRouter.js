const express = require("express");
const router = express.Router();
const { userAuth, adminAuth } = require("../middlewares/auth");
const adminController = require("../controller/admin/adminController");
const userController = require("../controller/admin/userController");
const categoryController = require("../controller/admin/categoryController");
const brandController = require("../controller/admin/brandController")

router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/", adminAuth, adminController.loadDashboard);
router.get("/logout", adminController.logout);

//costumer router
router.get("/users", adminAuth, userController.customerInfo);
router.patch("/blockCustomer/:id", adminAuth, userController.customerBlocked);
router.patch(
  "/unblockCustomer/:id",
  adminAuth,
  userController.customerunBlocked
);

//category router
router.get("/category", categoryController.loadCategory);
router.post("/add-category", categoryController.addCategory);
router.put("/edit-category/:id", categoryController.editCategory);
router.patch("/category/:id/status", categoryController.updateCategory);
router.patch("/category/:id/delete", categoryController.deleteCategory);

//brand router
router.get("/brand", brandController.loadBrand);
router.post("/add-brand",brandController.addBrand);
router.put("/edit-brand/:id",brandController.editBrand);
router.patch("/brand/:id/status",brandController.updateBrand)
router.patch("/brand/:id/delete",brandController.deleteBrand)

module.exports = router;
