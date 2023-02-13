const { default: axios } = require('axios')
const express=require('express');
const { userRegister } = require('../controllers/authcontroller');
const productModel=require("../models/productschema")

const router=express.Router();
const usercontroller=require('../controllers/usercontroller');
const { getWishlist, addWishlist,deleteWishlist } = require('../controllers/wishlistcontroller');
const{getcart,addcart,quantityPlus,cartDelete, quantityInc, quantityDec,applyCoupon}=require("../controllers/cartcontroller")
const {sessionCheck}=require("../middlewears/session")
const{toOrderSuccess}=require("../controllers/usercontroller");
const ordercontroller = require('../controllers/ordercontroller');
const orderModel=require("../models/orderschema");
const { userOrderDetails } = require('../controllers/ordercontroller');



router.get("/",usercontroller.homepage)

router.get('/shop',usercontroller.shop)



router.post('/register',userRegister)
router.post('/login',usercontroller.login)
router.get('/logout',usercontroller.logout)
router.get('/singleProduct/:id',usercontroller.singleProduct)
router.get('/wishlist' ,sessionCheck, getWishlist)
router.put('/addWhishlist',sessionCheck,  addWishlist)
router.delete('/deletewishlist',sessionCheck,   deleteWishlist)
router.get("/cart", sessionCheck, getcart);
router.post("/addCart",sessionCheck, addcart);
router.delete("/deleteCartProduct",sessionCheck,  cartDelete)
router.post("/apply-coupon",sessionCheck, applyCoupon)

router.patch("/quantityInc", quantityInc);  
router.patch("/quantityDec",quantityDec);
router.get("/checkout",usercontroller.checkout)
router.post("/addaddress",usercontroller.toAddAddress,)
router.get("/useraccount", sessionCheck,usercontroller.toviewuseraccount)


router.get("/couponcheck",usercontroller. tocouponcheck) 

router.get("/orderSuccess",sessionCheck,toOrderSuccess)
router.post("/postorders",ordercontroller. toOrder)
router.get("/orderinfo",sessionCheck, usercontroller.toOrderinfo )
router.delete("/cancelorder",ordercontroller.tocancelOrder);

router.delete("/returnorder",ordercontroller.tocancelOrder);
router.get("/userOrderDetails/:id",sessionCheck, ordercontroller. userOrderDetails)



module.exports=router;











































































