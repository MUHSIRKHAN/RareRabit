const express=require('express');
const router=express.Router();
const fileUpload = require('../middlewears/multer')
const admincontroller = require('../controllers/admincontroller');
const admin=require('../controllers/admincontroller');
const usercontroller = require('../controllers/usercontroller');


router.get('/dashboard',admincontroller.dashboard)
router.get('/',admincontroller.adminlogin)
router.post('/login',admincontroller.adminloginPost)
router.get('/addproduct',admincontroller.adminaddproduct)
router.post('/addProduct', fileUpload.upload.array("Image",4), admin.adminaddproductpost)
router.get('/addBrandName', admin.addBrandName)

router.post('/addBrand', admin.BrandNameUpdate)

router.get('/deleteBrandName/:id', admin.deleteBrandName) 

router.put('/EditBrandName', admin.EditBrandName)
router.get('/genderType', admin.genderType)

router.post('/genderType', fileUpload.upload.array('image',1), admin.genderTypeAdd)

router.get('/deleteGender/:id', admin.deleteGender)

router.post('/Editgender', fileUpload.upload.array('image'), admin.editGender)
router.get('/Products',admin.viewproducts)
router.get('/Users', admin.userview)
router.get('/productdelete/:id',admin.productdelete)
router.get('/productedit/:id', admin.editPage)
router.get('/Users', admin.userview)
router.get('/blockUser/:id',admin.blockUser)

router.get('/Unblockuser/:id',admin.unblockUser)
router.get("/coupon",admincontroller.viewCoupon)
router.get("/addcoupon",admincontroller.addCoupon)
router.post("/addcoupon",admincontroller.toAddCoupon)
router.patch("/couponblock",admincontroller.toBlockCoupon)

router.get("/orders",admincontroller.viewOrders)
router.get("/vieworderdetails/;id",admincontroller.viewOrderDetails)
router.get("/salesreport",admincontroller.toGetSalesReport)
router.get('/blockbrand/:id',admincontroller.blockbrand)

router.get('/unblockbrand/:id',admincontroller.unblockbrand)














module.exports=router;