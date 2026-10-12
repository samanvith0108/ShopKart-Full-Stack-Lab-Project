import Razorpay from "razorpay";

export const getRazorpayClient = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay test credentials are not configured");
    error.statusCode = 503;
    throw error;
  }

  if (!RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
    const error = new Error("Only Razorpay Test Mode keys are allowed");
    error.statusCode = 503;
    throw error;
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};
