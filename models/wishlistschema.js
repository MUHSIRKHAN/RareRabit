const mongoose = require("mongoose");
const User = require("../models/userschema");
const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
      },
    ],
  },
  { timestamps: true }
);

const wishlistModel = mongoose.model("wishlist", wishlistSchema);

module.exports = wishlistModel;
