const productModel = require("../models/productschema");
const orderModel = require("../models/orderModel");
exports.inventory = (productID, productQty) => {
  return new Promise((resolve, reject) => {
    productModel
      .findOneAndUpdate({ _id: productID }, { $inc: { quantity: productQty } })
      .then((e) => {
        resolve();
      });
  });
};
