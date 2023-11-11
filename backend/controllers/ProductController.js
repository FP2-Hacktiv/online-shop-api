import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../config/firebase.config.js";

//@DESC Get All Products
//@ROUTE /api/v1/products
//@METHOD GET
export const getAll = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ _id: -1 });

  res
    .status(201)
    .json({ success: true, count: products.length, data: products });
});

//@DESC Get Products By Id
//@ROUTE /api/v1/products
//@METHOD GET
export const getProduct = asyncHandler(async (req, res) => {
  const products = await Product.findById(req.params.id);

  res
    .status(201)
    .json({ success: true, count: products.length, data: products });
});

//@DESC Add Product
//@ROUTE /api/v1/products
//@METHOD POST
export const addProduct = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image) {
    res.status(400).json({ success: false, message: "No image file uploaded" });
  } else {
    if (!req.files.image.mimetype.startsWith("image")) {
      res.status(400).json({ success: false, message: "Please add an image file" });
    } else if (req.files.image.size > process.env.FILE_UPLOAD_LIMIT) {
      res.status(400).json({
        success: false,
        message: `Please add an image smaller than ${process.env.FILE_UPLOAD_LIMIT} bytes`,
      });
    } else {
      initializeApp(firebaseConfig);

      const storage = getStorage();

      try {
        const dateTime = Date.now();
        const fileName = `images/${dateTime}`;
        const storageRef = ref(storage, fileName);
        const metadata = {
          contentType: req.files.image.mimetype,
        };
        const snapshot = await uploadBytesResumable(
          storageRef,
          req.files.image.data, // Use req.files.image.data to access the file data
          metadata
        );
        const url = await getDownloadURL(snapshot.ref);
        const { name, description, brand, category, price, countInStock } = req.body;
        const product = await Product.create({
          name,
          image: `${url}`,
          description,
          brand,
          category,
          price,
          countInStock,
          user: req.user.id,
        });

        res.status(201).json({ success: true, data: product });
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Error uploading the image" });
      }
    }
  }
});

//@DESC Update Product
//@ROUTE /api/v1/products/:id
//@METHOD PUT
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // if (req.user.id !== product.user.toString()) {
  //   res.status(401);
  //   throw new Error("User not authorize to update product");
  // }

  if (req.files) {
    if (!req.files.image.mimetype.startsWith("image")) {
      res.status(401);
      throw new Error("Please add image file");
    }

    if (!req.files.image.size > process.env.FILE_UPLOAD_LIMIT) {
      res.status(401);
      throw new Error(
        `Please add a image less than ${process.env.FILE_UPLOAD_LIMIT}`
      );
    }

    let image = req.files.image;
    image.name = `photo_${Date.now()}_${image.name}`;
    image.mv(`${process.env.FILE_UPLOAD_PATH}/${image.name}`, async (err) => {
      if (err) {
        res.status(401);
        throw new Error(err);
      }

      const dataUpdated = { ...req.body, image: `${req.protocol}://${req.get('host')}/uploads/${image.name}`, };

      product = await Product.findByIdAndUpdate(req.params.id, dataUpdated, {
        new: true,
        runValidators: true,
      });

      res.status(201).json({ success: true, data: product });
    });
  } else {
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(201).json({ success: true, data: product });
  }
});

//@DESC Delete Product
//@ROUTE /api/v1/products/:id
//@METHOD DELETE
export const deleteProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // if (req.user.id !== product.user.toString()) {
  //   res.status(401);
  //   throw new Error("User not authrized to update product");
  // }

  await product.remove();

  res.status(201).json({ success: true, message: "Data Successfully Deleted!" });
});
