import mongoose from "mongoose";
import Product from "../Models/product.model.js";
import User from "../Models/user.model.js";

const isValidProductId = (id) => mongoose.isObjectIdOrHexString(id);

export const addToWishlist = async (req, res) => {
  const { productId } = req.params;

  if (!isValidProductId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await Product.exists({ _id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const result = await User.updateOne(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } },
    );

    if (result.modifiedCount === 0) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const wishlist = user.wishlist.filter(Boolean);
    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  if (!isValidProductId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const result = await User.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update wishlist" });
  }
};
