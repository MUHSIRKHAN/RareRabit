const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminschema");
const productModel = require("../models/productschema");
const couponModel = require("../models/couponModel");
const brandModel = require("../models/BrandName-shema");
const genderModel = require("../models/gender_type-schema");
const User = require("../models/userschema");
const { response } = require("express");
const orderModel = require("../models/orderModel");

module.exports = {
  dashboard: async (req, res, next) => {
    try {
      const totalSales = await orderModel.aggregate([
        {
          $match: { orderStatus: "Confirmed" },
        },
        { $group: { _id: "", totalPrice: { $sum: "$totalPrice" } } },
        { $project: { _id: 0, totalPrice: "$totalPrice" } },
      ]);
      let totalPrice;
      if (totalSales.length > 0) {
        totalPrice = totalSales[0].totalPrice;
      } else {
        totalPrice = 0;
      }
      const tranCOD = await orderModel.aggregate([
        {
          $match: { paymentMethod: "COD" },
        },
        { $group: { _id: "", totalPrice: { $sum: "$totalPrice" } } },
        { $project: { _id: 0, totalPrice: "$totalPrice" } },
      ]);
      const tranRAZ = await orderModel.aggregate([
        {
          $match: { paymentMethod: "onLine" },
        },
        { $group: { _id: "", totalPrice: { $sum: "$totalPrice" } } },
        { $project: { _id: 0, totalPrice: "$totalPrice" } },
      ]);

      const orderdash = await orderModel

        .find()

        .sort({ _id: -1 });

      const totalUsers = await User.find().count();

      const totalProducts = await productModel.find().count();
      const totalOrders = await orderModel.find().count();
      const totalBrands = await brandModel.find().count();

      res.render("admin/dashboard", {
        totalSales,
        totalPrice,
        totalOrders,
        totalUsers,
        totalBrands,
        tranCOD,
        tranRAZ,
        orderdash,
      });
    } catch (error) {
      next(error);
    }
  },

  adminlogin: (req, res) => {
    res.render("admin/adminlogin", { includes: true });
  },

  adminloginPost: async (req, res) => {


    let user = await adminModel.findOne({ email: req.body.email });

    if(!user) return res.redirect("/admin")

    const match = await bcrypt.compare(req.body.password, user.password)

if(!match) return  res.redirect("/admin")

req.session.user = true;
return res.redirect("/admin/dashboard");

  },
  userview: async (req, res) => {
    let users = await User.find({});
    res.render("admin/userview", {
      admin: true,
      users,
      Clients: "active",
      heading: "Users",
    });
  },
  adminaddproduct: async (req, res) => {
    const gender = await genderModel.find();
    const brand = await brandModel.find();
    console.log(gender);
    console.log(brand);
    res.render("admin/addproduct", { gender, brand });
  },
  adminaddproductpost: async (req, res) => {
    console.log(req.body);
    const result = req.files;

    const newProduct = new productModel({
      brandname: req.body.brandname,
      quantity: req.body.quantity,
      category: req.body.category,
      imagesDetails: result,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      gender: req.body.gender,
      description: req.body.description,
    });
    await newProduct.save();
    console.log(req.body);
    res.redirect("/admin/products");
  },
  addBrandName: async (req, res) => {
    let brandName = await brandModel.find({});
    res.render("admin/BrandName", {
      admin: true,
      heading: "Brand Names",
      brandName,
    });
  },
  BrandNameUpdate: (req, res) => {
    console.log(req.body);

    brandName = req.body.brandName.toUpperCase();
    brandModel
      .create({ brandName: brandName })
      .then(() => {
        res.redirect("/admin/addBrandName");
      })
      .catch((error) => {
        console.log(error);
        res.redirect("/admin/addBrandName");
      });
  },
  deleteBrandName: async (req, res) => {
    console.log(req.params.id);
    let id = req.params.id;
    let response;
    let brand = await brandModel.findOne({ brandName: id });

    await brandModel.findByIdAndDelete(id);

    res.redirect("/admin/addBrandName");
  },
  EditBrandName: (req, res) => {
    let id = req.body.id;
    let brandName = req.body.brandName.toUpperCase();
    brandModel
      .findByIdAndUpdate(req.body.id, { brandName: brandName })
      .then(() => {
        res.json({ response: true });
      })

      .catch((error) => {
        console.log(error);
        res.json({ response: false });
      });
  },
  genderType: async (req, res) => {
    try {
      let gender = await genderModel.find({});
      // console.log(gender)
      res.render("admin/gender", {
        admin: true,
        heading: "Gender Types",
        gender,
      });
    } catch (error) {
      console.log(error);
    }
  },
  genderTypeAdd: async (req, res) => {
    try {
      console.log("catrgory");
      console.log(req.body);
      console.log(req.files);
      let category = req.body;
      const file = req.files[0];
      category.image = file;
      genderModel
        .create(category)
        .then((E) => {
          console.log("ksudfgisf" + E);
          res.redirect("/admin/genderType");
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/admin/genderType");
        });
    } catch (error) {
      console.log(error);
    }
  },
  deleteGender: async (req, res) => {
    try {
      let id = req.params.id;
      let response;
      let gender = await productModel.findOne({ gender: id });

      genderModel
        .findByIdAndDelete(id)
        .then(() => {
          res.redirect("/admin/gendertype");
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/admin/gendertype");
        });
      //   });
      // }
    } catch (error) {
      console.log(error);
    }
  },
  editGender: async (req, res) => {
    try {
      let category = { gender: req.body.gender };
      id = req.body.id;
      if (req.files.length) {
        await genderModel.findById(id).then((product) => {
          const image = product.image[0];
          s3delte2(image);
        });
        const file = req.files[0];
        const result = await s3Uploadv2(file);
        category.image = result;
      }
      await genderModel
        .findByIdAndUpdate(id, category)
        .then(() => {
          res.redirect("/admin/genderType");
        })
        .catch((error) => {
          console.log(error);
          res.redirect("/admin/genderType");
        });
    } catch (error) {
      console.log(error);
    }
  },

  viewproducts: async (req, res) => {
    try {
      let data = await productModel
        .find()
        .populate("gender")
        .populate("brandname")
        .sort({ _id: -1 });
      res.render("admin/products", { data });
    } catch (error) {
      console.log(error.message, "jjc");
    }
  },
  productdelete: async (req, res) => {
    try {
      console.log(req.params.id);

      await productModel.findByIdAndDelete(req.params.id).then(() => {
        res.redirect("/admin/Products");
      });
    } catch (error) {
      console.log(error);
    }
  },
  editPage: async (req, res, next) => {
    try {
      product_id = req.params.id;
      
      let gender = await genderModel.find({}).lean();
      product = await productModel
      
        .findById(product_id)
        .populate("brandname")
        .populate("gender")
        .lean();
      let brandName = await brandModel.find({});
      res.render("admin/editProduct", {
        admin: true,
        heading: "Edit Product",
        brandName,
        product,
        gender,
      });
    } catch (error) {
      next(error);
    }
  },
  productedit: async (req, res, next) => {
    try {
      const ID = req.params.id;
      const { price , quantity,description} = req.body
      
      console.log(req.body,ID)
      // console.log(`id:${req.params}`);

      const update = await productModel.updateOne({_id:ID},{
        $set:{
          price:price,
          quantity:quantity,
          description:description
        }
      }).then(() => {
      
        res.redirect("/admin/Products")
      });
    } catch (error) {
      next(error);
      console.log(error.message);
    }
  },

  userview: async (req, res, next) => {
    try {
      let users = await User.find({});
      res.render("/admin/userview", {
        admin: true,
        users,
        Clients: "active",
        heading: "Users",
      });
    } catch (error) {
      next(error);
    }
  },
  blockUser: async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(
        req.params.id,
        { isBanned: true },
        { new: true }
      );
      res.redirect("/admin/users");
    } catch (error) {
      next(error);
    }
  },
  unblockUser: async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(
        req.params.id,
        { isBanned: false },
        { new: true }
      );
      res.redirect("/admin/users");
    } catch (error) {
      next(error);
    }
  },
  viewCoupon: async (req, res, next) => {
    try {
      const coupons = await couponModel.find().catch((error) => next(error));
      res.render("admin/coupon_view", { coupons });
    } catch (error) {
      next(error);
    }
  },
  addCoupon: async (req, res, next) => {
    try {
      res.render("admin/addCoupon");
    } catch (error) {
      next(error);
    }
  },
  toAddCoupon: async (req, res, next) => {
    try {
      
      const {
        code,
        discount,
        startingdate,
        endingdate,
        discountlimit,
        couponcount,
        cartamount,
      } = req.body;
      const newCoupon = await couponModel({
        couponCode: code,
        discount: discount,
        startingDate: startingdate,
        minCartAmount: cartamount,
        EndingDate: endingdate,
        discountLimit: discountlimit,
        couponCount: couponcount,
      });
      newCoupon.save().catch((error) => next(error));
      
      res.redirect("/admin/coupon");
    } catch (error) {
      next(error);
    }
  },
  toBlockCoupon: async (req, res, next) => {
    try {
      const couponID = req.body.id;
      console.log(req.body);
      
      await couponModel.findByIdAndUpdate(couponID, { $set:{couponStatus: false}  });
      
     res.sendStatus(200)
    } catch (error) {
      next(error);
    }
  },
  

  viewOrders: async (req, res, next) => {
    try {
      const orderDetails = await orderModel.find().sort({ _id: -1 });
      const brand = await productModel
        .find()
        .sort({ _id: -1 })
        .populate("brandname");

      res.render("admin/orders", { orderDetails, brand });
    } catch (error) {
      next(error);
    }
  },
  viewOrderDetails: async (req, res, next) => {
    try {
      console.log("khklh");
      await orderModel
        .find()
        .populate({
          path: "orderedItems",
          model: "orders",
          populate: { path: "brandname", model: "brandName" },
        })
        .then((orderDetail) => {
          res.json(orderDetail);
        });

      res.render("admin/orderDetails", { orderDetail });
    } catch (error) {
      next(error);
    }
  },
  toGetSalesReport: async (req, res, next) => {
    try {
      const todayDate = new Date();
      const DaysAgo = new Date(
        new Date().getTime() - 30 * 24 * 660 * 60 * 1000
      );

      const saleReport = await orderModel
        .aggregate([
          {
            $match: {
              createdAt: { $gte: DaysAgo },
              orderStatus: { $eq: "Confirmed" },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
              },
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ])
        .catch((error) => next(error));
      console.log(saleReport);

      res.render("admin/salesreport", { saleReport });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  getSalesReportBySearch: async (req, res, next) => {
    try {
      const todayDate = new Date();
      const toDate = new Date(req.query.toDate);
      const fromDate = new Date(req.query.fromDate);
      if (toDate <= todayDate) {
      }
      const saleReport = await orderModel
        .aggregate([
          {
            $match: {
              createdAt: { $gte: fromDate, $lt: toDate },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%d-%m-%Y", date: "$createdAt" },
              },
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
        ])
        .catch((error) => next(error));

      res.json({ status: true, saleReport });
    } catch (error) {
      next(error);
    }
  },

  toGetChart: async (req, res, next) => {
    try {
      const select = req.query.a;
      var date = new Date();
      var month = date.getMonth();
      var year = date.getFullYear();
      let sales = [];
      let PreviosSale = [];
      if (select == 365) {
        year = date.getFullYear();
        var currentYear = new Date(year, 0, 1);
        let salesByYear = await orderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: currentYear },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%m", date: "$createdAt" } },
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        for (let i = 1; i <= 12; i++) {
          let result = true;
          for (let k = 0; k < salesByYear.length; k++) {
            result = false;
            if (salesByYear[k]._id == i) {
              sales.push(salesByYear[k]);
              break;
            } else {
              result = true;
            }
          }
          if (result) sales.push({ _id: i, totalPrice: 0, count: 0 });
        }
        var lastYear = new Date(year - 1, 0, 1);
        let salesByLastYear = await orderModel.aggregate([
          {
            $match: {
              createdAt: { $gte: lastYear, $lt: currentYear },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%m", date: "$createdAt" } },
              totalPrice: { $sum: "$totalPrice" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        for (let i = 1; i <= 12; i++) {
          let result = true;
          for (let k = 0; k < salesByLastYear; k++) {
            result = false;
            if (salesByLastYear[k] == i) {
              PreviosSale.push(salesByLastYear[k]);
              break;
            } else {
              result = true;
            }
          }
          if (result) PreviosSale.push({ _id: i, totalPrice: 0, count: 0 });
        }
        res.json({ sales: sales, PreviosSale: PreviosSale });
      } else if (select == 30) {
        let firstDay = new Date(year, month, 1);
        firstDay = new Date(firstDay.getTime() + 1 * 24 * 60 * 60 * 1000);
        let nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
        for (let i = 1; i <= 5; i++) {
          let abc = {};
          let salesByMonth = await orderModel.aggregate([
            {
              $match: {
                createdAt: { $gte: firstDay, $lt: nextWeek },
                orderStatus: { $eq: "Delivered" },
              },
            },
            {
              $group: {
                _id: moment(firstDay).format("DD-MM-YYYY"),
                totalPrice: { $sum: "$totalPrice" },
                count: { $sum: 1 },
              },
            },
          ]);
          if (salesByMonth.length) {
            sales.push(salesByMonth[0]);
          } else {
            (abc._id = moment(firstDay).format("DD-MM-YYYY")),
              (abc.totalPrice = 0);
            abc.count = 0;
            sales.push(abc);
          }

          firstDay = nextWeek;
          if (i == 4) {
            nextWeek = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() + 1,
              1
            );
          } else {
            nextWeek = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() + 0,
              (i + 1) * 7
            );
          }
        }

        let firstDayOfLastMonth = new Date(year, month - 1, 1);
        firstDayOfLastMonth = new Date(
          firstDayOfLastMonth.getTime() + 1 * 24 * 60 * 60 * 1000
        );
        let lastDayOfLastMonth = new Date(year, month, 1);
        for (let i = 1; i < 5; i++) {
          let abc = {};
          let salesByLastMonth = await orderModel.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: firstDayOfLastMonth,
                  $lt: lastDayOfLastMonth,
                },
                orderStatus: { $eq: "Delivered" },
              },
            },
            {
              $group: {
                _id: moment(firstDay).format("DD-MM-YYYY"),
                totalPrice: { $sum: "$TotalPrice" },
                count: { $sum: 1 },
              },
            },
          ]);
          if (salesByLastMonth.length) {
            PreviosSale.push(salesByLastMonth[0]);
          } else {
            abc._id = moment(firstDay).format("DD-MM-YYYY");
            abc.totalPrice = 0;
            abc.count = 0;
            PreviosSale.push(abc);
          }
          firstDay = nextWeek;
          if (i == 4) {
            nextWeek = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() + 1,
              1
            );
          } else {
            nextWeek = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() + 0,
              (i + 1) * 7
            );
          }
        }
        res.json({ sales: sales, PreviosSale: PreviosSale });
      } else if (select == 7) {
        let today = new Date();
        let lastDay = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
        for (let i = 1; i <= 7; i++) {
          let abc = {};
          let salesByWeek = await orderModel.aggregate([
            {
              $match: {
                createdAt: { $lt: today, $gte: lastDay },
                orderStatus: { $eq: "Delivered" },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%u", date: today } },
                totalPrice: { $sum: "$totalPrice" },
                count: { $sum: 1 },
              },
            },
          ]);
          if (salesByWeek.length) {
            sales.push(salesByWeek[0]);
          } else {
            abc._id = today.getDay() + 1;
            abc.totalPrice = 0;
            abc.count = 0;
            sales.push(abc);
          }
          today = lastDay;
          lastDay = new Date(
            new Date().getTime() - (i + 1) * 24 * 60 * 60 * 1000
          );
        }
        for (let i = 1; i <= 7; i++) {
          let abc = {};
          let salesByLastWeek = await orderModel.aggregate([
            {
              $match: { createdAt: { $lt: today, $gte: lastDay } },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%u", date: today } },
                totalPrice: { $sum: "$totalPrice" },
                count: { $sum: 1 },
              },
            },
          ]);

          if (salesByLastWeek.length) {
            PreviosSale.push(salesByLastWeek[0]);
          } else {
            abc._id = today.getDay() + 1;
            abc.totalPrice = 0;
            abc.count = 0;
            PreviosSale.push(abc);
          }
          today = lastDay;
          lastDay = new Date(
            new Date().getTime() - (i + 7) * 24 * 60 * 60 * 1000
          );
        }
        res.json({ sales: sales, PreviosSale: PreviosSale });
      }

      // res.json({ status });
    } catch (error) {
      next(error);
    }
  },
  toGetPieChart: async (req, res, next) => {
    try {
      const delivered = await orderModel
        .find({ orderStatus: "Delivered" })
        .count();
      const cancelled = await orderModel
        .find({ orderStatus: "Cancelled" })
        .count();
      const returned = await orderModel
        .find({ orderStatus: "Returned" })
        .count();
      let status = [];

      status.push(delivered);
      status.push(cancelled);
      status.push(returned);
      res.json({ status });
    } catch (error) {
      next(error);
    }
  },
  blockbrand: async (req, res, next) => {
    try {
      console.log("blockbrand");
      await brandModel.findByIdAndUpdate(
        req.params.id,
        { isBanned: true },
        { new: true }
      );
      console.log(req.params.id);
      res.redirect("/admin/addBrandName");
    } catch (error) {
      next(error);
    }
  },
  unblockbrand: async (req, res, next) => {
    try {
      await brandModel.findByIdAndUpdate(
        req.params.id,
        { isBanned: false },
        { new: true }
      );
      res.redirect("/admin/addBrandName");
    } catch (error) {
      next(error);
    }
  },
};
