import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";

export const getProducts = asyncHandler(async (req, res) => {
  const product = await Product.find({});
  res.json(product);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error(`Product Not Found`);
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({ message: `product named ${product.name} was removed` });
  } else {
    res.status(404);
    throw new Error(`Product Not Found`);
  }
});

export const createProduct = asyncHandler(async (req, res) => {
  const newProduct = new Product({
    name: "Sample",
    price: 0,
    user: req.user._id,
    image: "/images/sample.jpg",
    brand: "sample brand",
    category: "sample category",
    countInStock: 0,
    numReviews: 0,
    description: "sample desc.",
  });

  const createdProduct = await newProduct.save();
  res.status(201).json(createdProduct);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const thatProduct = await Product.findById(req.params.id);

  if (thatProduct) {
    thatProduct.name = name;
    thatProduct.price = price;
    thatProduct.description = description;
    thatProduct.image = image;
    thatProduct.brand = brand;
    thatProduct.category = category;
    thatProduct.countInStock = countInStock;

    const updatedProduct = await thatProduct.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviwed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (alreadyReviwed) {
      res.status(400);
      throw new Error(`You've already reviwed this product!!`);
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.numReviews;

    await product.save();

    res.status(200).json({ message: `review is added to ${product.name}` });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
