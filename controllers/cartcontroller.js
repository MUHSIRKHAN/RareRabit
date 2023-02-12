const mongoose = require("mongoose");
const productModel = require("../models/productschema");
const User = require("../models/userschema");
const cartModel = require("../models/cart_schema");
const couponModel = require("../models/couponModel");
const moment = require("moment");
const { find } = require("../models/productschema");
const { updateOne } = require("../models/adminschema");

exports.getcart = async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    const cart = await cartModel.findOne({ user: userId }).populate({
      path: "cart.product_id",
      model: "Products",
      populate: { path: "brandname", model: "brandName" },
    });
    const cartList = cart?.cart;
    const coupon = await couponModel.find({});
    console.log("CaAAAA");
    console.log(cart);
    console.log("AAA");
    

    res.render("user/cart", { cart, cartList, coupon });
  } catch (error) {
    next(error);
  }
};
exports.addcart = async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    const product_id = req.body.id;
    let user = await cartModel.findOne({ user: userId });
    let price = await productModel.findOne({ _id: product_id });
    const Price = price.price;
    if (!user) {
      let newcart = new cartModel({
        user: userId,
        cart: [
          {
            product_id: product_id,
            total: Price,
          },
        ],
        subTotal: Price,
      });
      newcart.save().then(() => {
        res.json({ response: true });
      });
    } else {
      let cartProduct = await cartModel.findOne({
        user: userId,
        "cart.product_id": product_id,
      });
      if (cartProduct) {
        let price = await productModel.findOne({ _id: product_id });
        const productPrice = price.price;
        
        await cartModel.findOneAndUpdate(
          {
            user: userId,
            "cart.product_id": product_id,
          },
          {
            $inc: {
              "cart.$.quantity": 1,
              "cart.$.total": productPrice,
              subTotal: productPrice,
            },
          }
        );
        res.json({ response: true });
      } else {
        let price = await productModel.findOne({ _id: product_id });
        const productPrice = price.price;
        let cartArray = { product_id: product_id, total: productPrice };
        await cartModel
          .findOneAndUpdate(
            { user: userId },
            { $push: { cart: cartArray }, $inc: { subTotal: productPrice } }
          )
          .then(() => {
            res.json({ response: true });
          });
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.quantityInc = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.body.id;

    const product = await productModel.findOne({ _id: productId });
    const productPrice = product.price;
    await cartModel.findOneAndUpdate(
      { user: userId, "cart.product_id": productId },
      {
        $inc: {
          "cart.$.quantity": 1,
          "cart.$.total": productPrice,
          subTotal: productPrice,
        },
      }
    );
    const quantity = await cartModel
      .aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $project: {
            subTotal: 1,
            cart: {
              $filter: {
                input: "$cart",
                cond: {
                  $eq: [
                    "$$this.product_id",
                    mongoose.Types.ObjectId(productId),
                  ],
                },
              },
            },
          },
        },
      ])
      .then((quantity) => {
        const total = quantity[0].cart[0].total;
        const subtotal = quantity[0].subTotal;
        const quan = quantity[0].cart[0].quantity;
        res.json({
          response: true,
          total: total,
          subtotal: subtotal,
          quantity: quan,
        });
      });
  } catch (err) {
    console.log(err.message);
  }
};
exports.quantityDec = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const productId = req.body.id;
    const product = await productModel.findOne({ _id: productId });
    const productPrice = product.price;
    await cartModel.findOneAndUpdate(
      { user: userId, "cart.product_id": productId },
      {
        $inc: {
          "cart.$.quantity": -1,
          "cart.$.total": -productPrice,
          subtotal: -productPrice,
        },
      }
    );
    const quantity = await cartModel
      .aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $project: {
            subtotal: 1,
            cart: {
              $filter: {
                input: "$cart",
                cond: {
                  $eq: [
                    "$$this.product_id",
                    mongoose.Types.ObjectId(productId),
                  ],
                },
              },
            },
          },
        },
      ])
      .then((quantity) => {
        const total = quantity[0].cart[0].total;
        const subtotal = quantity[0].subtotal;
        const quan = quantity[0].cart[0].quantity;
        res.json({
          response: true,
          total: total,
          subtotal: subtotal,
          quantity: quan,
        });
      });
  } catch (err) {
    //   res.redirect("/error");
    console.log(err.message);
  }
};
exports.cartDelete = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const productId = req.body.id;
    const product = await productModel.findOne({ _id: productId });
    const productPrice = product.price;
 
    let cartDelete = await cartModel
      .updateOne(
        { user: userId },
        {
          $pull: { cart: { product_id: productId } },
          $inc: { subTotal: -productPrice },
        }
      )
      .then((e) => {
        console.log(e);
        res.json({ response: false });
      })
      .catch((error) => {
        console.log(error);

        res.json({ response: "Something went wrong" });
      });
  } catch (error) {
    next(error);
  }
};

exports.applyCoupon = async (req, res) => {
  const userId = req.session.user._id;
  const code = req.body.code;
  const cart=await cartModel.findOne({user:userId})
  const price=cart.subTotal;

  const data = await coupenModel.findOne({ CODE: code });

  let nowDate = moment().format("MM/DD/YYYY");

  if (data) {

    const type = data.couponType;
    const min = data.minCartAmount;
    const max = data.maxRedeemAmount;
    const date = data.expireDate.toLocaleDateString();
    const couponCount = data.couponCount;

    if (couponCount > 0) {
      if (nowDate < date) {
      
        if (min < price) {
          console.log("aaa");
          if (type == "Amount") {
            const dataAmount = data.cutoff;
         
            let perOne = price / 100;
            let newPer = perOne * dataPer;
            let newTotal = null;
            if (max < newPer) newTotal = price - max;
            else {
              newTotal = price - newPer;
              await cartModel
                .updateOne({ user: userId }, { subTotal: { $inc: -max } })
                .then((updated) => {
                        });
            }

            res.json({ newTotal });
          }
        } else {
          res.json({ price });
        }
      } else {
        res.json({ date });
      }
    } else {
      res.json({ couponCount });
    }
  } else {
    res.json({ status: false });
  }
};
