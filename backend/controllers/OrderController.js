import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

//@DESC Get All Order
//@ROUTE /api/v1/orders
//@METHOD GET
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({});

  res.status(201).json({ success: true, count: orders.length, data: orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const orders = await Order.findById(req.params.id);

  res.status(201).json({ success: true, count: orders.length, data: orders });
});

//@DESC Add Order
//@ROUTE /api/v1/orders
//@METHOD POST

export const addOrder = asyncHandler(async (req, res) => {
  const orderData = req.body;
  const productsToOrder = orderData.products;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = productsToOrder.map((item) => item.product);

    const productsInStock = await Product.find({ _id: { $in: productIds } });

    const productQuantityMap = {};

    productsInStock.forEach((product) => {
      productQuantityMap[product._id] = product.quantity;
    });

    let canPlaceOrder = true;

    productsToOrder.forEach((item) => {
      if (item.quantity > productQuantityMap[item.product]) {
        canPlaceOrder = false;
      }
    });

    if (!canPlaceOrder) {
      throw new Error("Product is out of stock");
    }

    let totalAmount = 0;

    const orderProducts = productsToOrder.map((item) => {
      const product = productsInStock.find((p) => p._id.toString() === item.product);
      const amount = product.price * item.quantity;
      totalAmount += amount; // Menambahkan nilai amount ke totalAmount
      return {
        product: item.product,
        quantity: item.quantity,
        amount: amount,
      };
    });

    const order = await Order.create({
      products: orderProducts,
      user: req.user.id,
      amount: totalAmount,
      adresse: orderData.adresse,
    });

    productsToOrder.forEach(async (item) => {
      const product = await Product.findById(item.product);
      product.countInStock -= item.quantity;
      await product.save();
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to place order!" });
  }
});

//@DESC Report Sales
//@ROUTE /api/v1/orders/report-sales
//@METHOD GET

export const reportSales = asyncHandler(async (req, res) => {
  try {
    const productSales = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: "$products.product",
          totalSold: { $sum: "$products.quantity" },
          totalProfit: { $sum: "$products.amount" },
        },
      },
      {
        $lookup: {
          from: "products", 
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalProfit: 1,
          productName: { $arrayElemAt: ["$productInfo.name", 0] },
          productPrice: { $arrayElemAt: ["$productInfo.price", 0] },
        },
      },
    ]);

    res.status(200).json({ success: true, data: productSales });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get sales data" });
  }
});


//@DESC Update Order
//@ROUTE /api/orders/:id
//@METHOD PUT
export const updateOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({ success: true, data: order });
});

//@DESC Delete Order
//@ROUTE /api/orders/:id
//@METHOD DELETE
export const deleteOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order = await Order.findByIdAndDelete(req.params.id);

  res.status(201).json({ success: true, data: {} });
});
