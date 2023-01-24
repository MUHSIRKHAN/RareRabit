const productModel = require("../models/productschema");
const cart = require("../models/cart_schema");
const User = require("../models/userschema");

const bcrypt = require("bcryptjs");
const { findOne } = require("../models/userschema");
const brandModel = require("../models/BrandName-shema");
const genderModel = require("../models/gender_type-schema");
const coupenModel = require("../models/couponModel");
const { cartDelete } = require("./cartcontroller");
const cartModel = require("../models/cart_schema");
const { default: mongoose } = require("mongoose");
const orderModel = require("../models/orderModel");
let response, userEjs;

module.exports = {
  homepage: async (req, res) => {
    res.render("user/home", { response, userEjs });
  },
  shop: async (req, res) => {
    const product = await productModel
      .find()
      .populate("brandname")
      .populate("gender");

    res.render("user/shop", { response, userEjs, product });
  },
  login: async (req, res) => {
    const user = await User.findOne({ email: req.body.Email });
    if (user) {
      await bcrypt.compare(req.body.Password, user.password).then((status) => {
        if (status) {
          response = false;
          userEjs = user.email;
          req.session.user = user;
        } else response = "Invalid password";
      });
    } else response = "Invalid email";
    res.json({ response });
  },
  logout: async (req, res) => {
    userEjs = false;
    res.redirect("/");
  },
  singleProduct: async (req, res, next) => {
    try {
      let id = req.params.id;
      let user = req.session.user?._id;

      productModel
        .findById(id)
        .populate("brandname")
        .populate("gender")
        .lean()
        .then(async (product) => {
          let similiar = ([] = await productModel
            .find(
              {
                deleteProduct: false,
                gender: product.gender._id,
                type: product.type,
                _id: { $ne: id },
                quantity: { $gt: 1 },
              },
              {
                imagesDetails: 1,
                brandName: 1,
                gender: 1,
                shopPrice: 1,
                review: 1,
                rating: 1,
              }
            )
            .populate("brandname")
            .populate("gender")
            .lean());

          res.render("user/singleProduct", { product, similiar, user });
        })
        .catch((error) => next(error));
    } catch (error) {
      next(error);
    }
  },
  checkout: async (req, res, next) => {
    try {
      let user = req.session.user;
      const ID = req.session.user._id;
      const cart = await cartModel.findOne({ user: ID }).populate({
        path: "cart.product_id",
        model: "Products",
        populate: { path: "brandname", model: "brandName" },
      });
      const subTotal = cart.subTotal;
      const products = cart.productId;
      const data = await User.findById(ID);
      const adress = data.address;
      const newAddress = await User.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(ID),
          },
        },
        {
          $project: {
            address: {
              $filter: {
                input: "$address",
                cond: {
                  $eq: ["$$this.default", true],
                },
              },
            },
          },
        },
      ]);
      const defaultAddress = newAddress[0].address;
      console.log(defaultAddress);
      const coupon = await coupenModel.find();
      console.log(coupon);
      res.render("user/checkout", {
        products,
        subTotal,
        cart,
        defaultAddress,
        coupon,

        user,
      });
    } catch (error) {
      next(error);
    }
  },
  toAddAddress: async (req, res, next) => {
    try {
      const userID = req.session.user._id;
      await User.findOneAndUpdate(
        {
          _id: userID,
          "address.default": true,
        },
        { $set: { "address.$.default": false } }
      );
      const { name, country, address, city, state, postcode, phone } = req.body;
      console.log(req.body);
      console.log(name, country, address, city, state, postcode, phone);
      if (
        name &&
        country &&
        address &&
        city &&
        state &&
        postcode &&
        state &&
        phone
      ) {
        await User.findByIdAndUpdate(userID, {
          $set: {
            address: {
              name: name,
              country: country,
              address: address,
              city: city,
              state: state,
              postcode: postcode,
              phone: phone,
              default: true,
            },
          },
        });
        console.log("JUSIJ");
        res.redirect("/checkout");
      }
    } catch (error) {
      next(error);
    }
  },
  toviewuseraccount: async (req, res, next) => {
    try {
      let user = req.session.user;
      const userID = req.session.user._id;
      const details = await User.findById(userID);

      res.render("user/useraccount", {
        details,

        user,
      });
    } catch (error) {
      next(error);
      console.log(error.message);
    }
  },
  toOrderSuccess: (req, res, next) => {
    let user = req.session.user;
    res.render("user/orderSuccess", { user });
  },
  tocouponcheck: async (req, res, next) => {
    try {
      console.log("working");
      const userID = req.session.user._id;
      let code = req.query.code;
      let total = req.query.total;
      console.log(code);
      console.log(total);
      const result = await coupenModel.findOne({
        couponcode: code,
        couponstatus: true,
      });
      console.log(userID);
      if (!result) {
        msg = "coupon not exist";
        res.json({ status: false, mesage: msg });
      } else {
        const usedCoupon = await coupenModel.findOne({
          couponcode: code,
          "users.user": userID,
        });
        if (usedCoupon) {
          msg = "coupon already used!";
          res.json({ ststus: false, message: msg });
        } else {
          let discount = result.discount;
          let startingDate = new Date(result.startingDate);
          let endingDate = new Date(result.EndingDate);

          const currentDate = new Date(Date.now());
          let discountLimit = result.discountLimit;
          let count = result.couponCount;
          let minAmount = result.minCartAmount;
          if (count != 0) {
            if (total < minAmount) {
              msg =
                "You have to purchase minimum of" +
                minAmount +
                "for this Coupoun ";
              res.json({ status: false, message: msg });
            } else {
              if (startingDate < currentDate && endingDate > currentDate) {
                console.log("date wk");
                let DiscAmount = Math.round((total * discount) / 100);
                if (DiscAmount > discountLimit) DiscAmount = discountLimit;
                grandtotal = total - DiscAmount;
                msg = "Coupon Applied";
                res.json({ status: true, grandtotal, message: msg });
              } else {
                msg = "your coupon is expired";
                res.json({ status: false, message: msg });
              }
            }
          } else {
            msg = "coupon is no lomnger available";
            res.json({ status: false, message: msg });
          }
        }
      }
    } catch (error) {
      next(error);
    }
  },
  toOrderinfo: async (req, res, next) => {
    try {
      let user = req.session.user;
      const ID = req.session.user._id;
      await orderModel
        .find({ user: ID })
        .sort({ _id: -1 })
        .then((userOrderDetails) => {
          res.render("user/orderinfo", { userOrderDetails, user });
        });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
