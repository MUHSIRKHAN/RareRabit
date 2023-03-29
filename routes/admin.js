const express=require('express');
const router=express.Router();
const fileUpload = require('../middlewears/multer')
const admincontroller = require('../controllers/admincontroller');
const admin=require('../controllers/admincontroller');
const usercontroller = require('../controllers/usercontroller');
const { adminSession } = require('../middlewears/adminsession');


router.get('/dashboard',adminSession, admincontroller.dashboard)
router.get('/',admincontroller.adminlogin)
router.post('/login',admincontroller.adminloginPost)
router.get('/addproduct',adminSession, admincontroller.adminaddproduct)
router.post('/addProduct', fileUpload.upload.array("Image",4), admin.adminaddproductpost)
router.get('/addBrandName', adminSession, admin.addBrandName)

router.post('/addBrand', adminSession, admin.BrandNameUpdate)

router.get('/deleteBrandName/:id',adminSession, admin.deleteBrandName) 

router.put('/EditBrandName', adminSession, admin.EditBrandName)
router.get('/genderType', admin.genderType)

router.post('/genderType', fileUpload.upload.array('image',1), admin.genderTypeAdd)

router.get('/deleteGender/:id', adminSession, admin.deleteGender)

router.post('/Editgender', fileUpload.upload.array('image'), admin.editGender)
router.get('/Products',adminSession, admin.viewproducts)
router.get('/Users',adminSession, admin.userview)
router.get('/productdelete/:id',admin.productdelete)
router.get('/productedit/:id', admin.editPage)
router.post('/productEdit/:id',admin.productedit)
router.get('/Users', admin.userview)
router.get('/blockUser/:id',admin.blockUser)

router.get('/Unblockuser/:id',admin.unblockUser)
router.get("/coupon",admincontroller.viewCoupon)
router.get("/addcoupon",admincontroller.addCoupon)
router.post("/addCoupon",admincontroller.toAddCoupon)
router.patch("/couponblock",admincontroller.toBlockCoupon)

router.get("/orders",admincontroller.viewOrders)
router.get("/orders/orderDetails",admincontroller.viewOrderDetails)
router.get("/salesreport",admincontroller.toGetSalesReport)
router.get('/blockbrand/:id',admincontroller.blockbrand)

router.get('/unblockbrand/:id',admincontroller.unblockbrand)














module.exports=router;