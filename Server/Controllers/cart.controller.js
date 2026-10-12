import mongoose from "mongoose";
import Product from "../Models/product.model.js";
import User from "../Models/user.model.js";

const isValidProductId = (id) => mongoose.isObjectIdOrHexString(id);

const getPopulatedCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "cart.product",
    select: "name description price category image stock",
  });

  if (!user) return null;

  return user.cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
};

const sendUpdatedCart = async (res, userId, message) => {
  const cart = await getPopulatedCart(userId);
  if (!cart) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  return res.status(200).json({ success: true, message, cart });
};

export const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    if (!cart) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load cart" });
  }
};

export const addToCart = async (req, res) => {
  const { productId } = req.params;

  if (!isValidProductId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(productId).select("stock");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user._id).select("cart");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const existingItem = user.cart.find((item) => item.product.toString() === productId);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
      }

      const update = await User.updateOne(
        {
          _id: req.user._id,
          cart: { $elemMatch: { product: productId, quantity: { $lt: product.stock } } },
        },
        { $inc: { "cart.$.quantity": 1 } },
      );

      if (update.modifiedCount === 0) {
        return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
      }
    } else {
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }

      const update = await User.updateOne(
        { _id: req.user._id, "cart.product": { $ne: productId } },
        { $push: { cart: { product: productId, quantity: 1 } } },
      );

      if (update.modifiedCount === 0) {
        const currentUser = await User.findById(req.user._id).select("cart");
        const currentItem = currentUser?.cart.find(
          (item) => item.product.toString() === productId,
        );

        if (!currentItem) {
          return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (currentItem.quantity >= product.stock) {
          return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
        }

        const retry = await User.updateOne(
          {
            _id: req.user._id,
            cart: { $elemMatch: { product: productId, quantity: { $lt: product.stock } } },
          },
          { $inc: { "cart.$.quantity": 1 } },
        );
        if (retry.modifiedCount === 0) {
          return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
        }
      }
    }

    return await sendUpdatedCart(res, req.user._id, "Cart updated");
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update cart" });
  }
};

export const updateCartQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body ?? {};

  if (!isValidProductId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: "Quantity must be a whole number of at least 1" });
  }

  try {
    const product = await Product.findById(productId).select("stock");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    const update = await User.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $set: { "cart.$.quantity": quantity } },
    );

    if (update.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    return await sendUpdatedCart(res, req.user._id, "Cart quantity updated");
  } catch (error) {
    console.error("UPDATE CART QUANTITY ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to update cart" });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  if (!isValidProductId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const update = await User.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $pull: { cart: { product: productId } } },
    );

    if (update.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    return await sendUpdatedCart(res, req.user._id, "Product removed from cart");
  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to remove product from cart" });
  }
};
