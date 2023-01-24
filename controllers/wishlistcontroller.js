const User = require("../models/userschema");
const wishlistModel = require("../models/wishlistschema");

exports.getWishlist = async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    console.log(userId);
    let user = req.session.user.email;

    await wishlistModel
      .findOne({ user: userId })
      .populate({
        path: "wishlist.product",
        model: "Products",
        populate: { path: "brandname", model: "brandName" },
      })
      .then(async (result) => {
        if(result){
          let wishlist = result.wishlist;
          
          res.render("user/wishlist", { wishlist, user });
        }else{
          res.render("user/wishlist", {  user });
        }
 
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
};

exports.addWishlist = async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    const wishlist = [];

    const pro = { product: req.body.id };

    wishlist.push(pro);

    Object.assign(req.body, { user: userId }, { wishlist: wishlist });

    const wishlistData = await req.body;

    let wishlistfind = await wishlistModel.findOne({
      user: userId,
      "wishlist.product": req.body.id,
    });

    if (wishlistfind) {
      res.json({ response: "Already in wishlist" });
    } else {
      await wishlistModel
        .findOneAndUpdate(
          { user: userId },
          { $push: { wishlist: { product: req.body.id } } }
        )
        .then(async (e) => {
          if (e) res.json({ response: false });
          else {
            await wishlistModel.create(wishlistData);
          }
        })
        .catch((error) => res.json({ response: "Something went wrong" }));
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteWishlist = async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    console.log(req.body);
    wishlistModel
      .findOneAndUpdate(
        { user: userId },
        {
          $pull: { wishlist: { product: req.body.id } },
        }
      )
      .then(() => {
        res.json({ response: false });
      })
      .catch((error) => res.json({ response: "Something went wrong" }));
  } catch (error) {
    next(error);
  }
};
