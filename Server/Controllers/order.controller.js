import crypto from "node:crypto";
import mongoose from "mongoose";
import { getRazorpayClient } from "../config/razorpay.js";
import Order from "../Models/order.model.js";
import Product from "../Models/product.model.js";
import User from "../Models/user.model.js";

const validateShippingAddress = (address) => {
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return "Shipping address is required";
  }

  for (const field of fields) {
    if (typeof address[field] !== "string" || !address[field].trim()) {
      return `${field} is required`;
    }
  }

  const phone = address.phone.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  if (!/^\+?[0-9\s()-]+$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    return "Enter a valid phone number";
  }

  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return "Pincode must contain 6 digits";
  }

  return null;
};

const normalizeShippingAddress = (address) => ({
  fullName: address.fullName.trim(),
  phone: address.phone.trim(),
  addressLine1: address.addressLine1.trim(),
  city: address.city.trim(),
  state: address.state.trim(),
  pincode: address.pincode.trim(),
});

export const createPaymentOrder = async (req, res) => {
  const validationError = validateShippingAddress(req.body?.shippingAddress);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  let order;
  try {
    const user = await User.findById(req.user._id).select("cart");
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }

    const productIds = user.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "name price image stock",
    );
    const productById = new Map(products.map((product) => [product._id.toString(), product]));
    const items = [];
    let totalPaise = 0;

    for (const cartItem of user.cart) {
      const product = productById.get(cartItem.product.toString());
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available. Remove it before checkout.",
        });
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
        });
      }

      const priceInPaise = Math.round(product.price * 100);
      totalPaise += priceInPaise * cartItem.quantity;
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    if (!Number.isSafeInteger(totalPaise) || totalPaise < 1) {
      return res.status(400).json({ success: false, message: "Order total is invalid" });
    }

    const razorpay = getRazorpayClient();
    order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: normalizeShippingAddress(req.body.shippingAddress),
      totalAmount: totalPaise / 100,
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: "INR",
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        shopKartOrderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalPaise,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      order.paymentStatus = "FAILED";
      await order.save();
      throw error;
    }
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({ success: false, message: error.message });
    }

    console.error("CREATE PAYMENT ORDER ERROR:", error);
    return res.status(502).json({
      success: false,
      message: "Unable to start payment. Your cart has not been cleared; please try again.",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const {
    shopKartOrderId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body ?? {};

  if (
    !mongoose.isObjectIdOrHexString(shopKartOrderId) ||
    typeof razorpayOrderId !== "string" ||
    !razorpayOrderId ||
    typeof razorpayPaymentId !== "string" ||
    !razorpayPaymentId ||
    typeof razorpaySignature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(razorpaySignature)
  ) {
    return res.status(400).json({ success: false, message: "Invalid payment verification data" });
  }

  let razorpaySecret;
  try {
    getRazorpayClient();
    razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  } catch (error) {
    return res.status(error.statusCode || 503).json({
      success: false,
      message: error.message,
    });
  }

  try {
    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Payment order does not match" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest();
    const receivedSignature = Buffer.from(razorpaySignature, "hex");
    if (
      expectedSignature.length !== receivedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const session = await mongoose.startSession();
    let confirmedOrder;
    try {
      await session.withTransaction(async () => {
        const currentOrder = await Order.findOne({
          _id: shopKartOrderId,
          user: req.user._id,
        }).session(session);

        if (
          currentOrder?.paymentStatus === "PAID" &&
          currentOrder.razorpayPaymentId === razorpayPaymentId
        ) {
          confirmedOrder = currentOrder;
          return;
        }

        if (!currentOrder || currentOrder.paymentStatus !== "PENDING") {
          const error = new Error("Order is not awaiting payment");
          error.statusCode = 409;
          throw error;
        }

        const user = await User.findById(req.user._id).session(session);
        if (!user) {
          const error = new Error("Not authorized");
          error.statusCode = 401;
          throw error;
        }

        currentOrder.paymentStatus = "PAID";
        currentOrder.status = "PLACED";
        currentOrder.razorpayPaymentId = razorpayPaymentId;
        await currentOrder.save({ session });

        user.cart = [];
        await user.save({ session });
        confirmedOrder = currentOrder;
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      order: confirmedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    console.error("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment. Your cart has not been cleared.",
    });
  }
};

export const recordPaymentFailure = async (req, res) => {
  const { shopKartOrderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId } =
    req.body ?? {};

  if (
    !mongoose.isObjectIdOrHexString(shopKartOrderId) ||
    typeof razorpayOrderId !== "string" ||
    !razorpayOrderId ||
    typeof razorpayPaymentId !== "string" ||
    !razorpayPaymentId
  ) {
    return res.status(400).json({ success: false, message: "Invalid payment failure data" });
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Payment order does not match" });
    }

    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (payment.order_id !== order.razorpayOrderId || payment.status !== "failed") {
      return res.status(409).json({ success: false, message: "Payment is not confirmed as failed" });
    }

    const result = await Order.updateOne(
      {
        _id: order._id,
        user: req.user._id,
        razorpayOrderId,
        paymentStatus: "PENDING",
      },
      {
        $set: {
          paymentStatus: "FAILED",
          razorpayPaymentId,
        },
      },
    );

    if (result.modifiedCount === 0) {
      const currentOrder = await Order.findOne({ _id: order._id, user: req.user._id });
      if (currentOrder?.paymentStatus !== "FAILED" || currentOrder.razorpayPaymentId !== razorpayPaymentId) {
        return res.status(409).json({ success: false, message: "Order payment status has changed" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Failed payment recorded",
    });
  } catch (error) {
    if (error.statusCode === 503) {
      return res.status(503).json({ success: false, message: error.message });
    }

    console.error("RECORD PAYMENT FAILURE ERROR:", error);
    return res.status(502).json({
      success: false,
      message: "Unable to confirm the failed payment with Razorpay",
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load orders" });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  try {
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to load order" });
  }
};
