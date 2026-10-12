import mongoose from "mongoose";
import Product from "../Models/product.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: "Product data is required" });
  }

  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create product" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (typeof search === "string" && search.trim()) {
      query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    if (typeof category === "string" && category.trim()) {
      query.category = category.trim();
    }

    const products = await Product.find(query)
      .select("name price category image stock")
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load products" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id).select(
      "name description price category image stock",
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load product" });
  }
};
