import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/useCart";
import { createPaymentOrder, recordPaymentFailure, verifyPayment } from "../services/orders";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  pincode: "",
};

let razorpayScriptPromise;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    const script = existingScript || document.createElement("script");

    script.onload = () => {
      const isAvailable = Boolean(window.Razorpay);
      if (!isAvailable) razorpayScriptPromise = null;
      resolve(isAvailable);
    };
    script.onerror = () => {
      script.remove();
      razorpayScriptPromise = null;
      resolve(false);
    };

    if (!existingScript) {
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return razorpayScriptPromise;
};

function validateAddress(address) {
  const errors = {};
  for (const [field, value] of Object.entries(address)) {
    if (!value.trim()) errors[field] = "This field is required.";
  }

  const phoneDigits = address.phone.replace(/\D/g, "");
  if (
    address.phone.trim() &&
    (!/^\+?[0-9\s()-]+$/.test(address.phone.trim()) ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15)
  ) {
    errors.phone = "Enter a valid phone number.";
  }

  if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
}

const fields = [
  { name: "fullName", label: "Full Name", autoComplete: "name" },
  { name: "phone", label: "Phone Number", autoComplete: "tel", inputMode: "tel" },
  { name: "addressLine1", label: "Address", autoComplete: "street-address" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", autoComplete: "postal-code", inputMode: "numeric" },
];

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, cartCount, subtotal, clearCart } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateAddress(address);
    setErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length > 0) {
      setFormError("Please correct the highlighted shipping details.");
      return;
    }
    if (cartItems.length === 0) {
      setFormError("Your cart is empty. Add products before checkout.");
      return;
    }

    setPlacingOrder(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Check your connection and try again.");
      }

      const { data } = await createPaymentOrder(address);
      let verificationStarted = false;
      const paymentObject = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          name: address.fullName.trim(),
          contact: address.phone.trim(),
        },
        theme: { color: "#4f46e5" },
        handler: async (paymentResponse) => {
          if (verificationStarted) return;
          verificationStarted = true;
          setFormError("");

          try {
            await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            clearCart();
            navigate(`/order-success/${data.shopKartOrderId}`, { replace: true });
          } catch (error) {
            setFormError(
              error.response?.data?.message ||
                "Payment could not be verified. Your cart has not been cleared.",
            );
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!verificationStarted) {
              setFormError("Payment was cancelled. Your cart is unchanged.");
              setPlacingOrder(false);
            }
          },
        },
      });

      paymentObject.on("payment.failed", async (paymentFailure) => {
        const description = paymentFailure.error?.description;
        setPlacingOrder(false);
        try {
          const metadata = paymentFailure.error?.metadata;
          if (metadata?.payment_id && metadata?.order_id) {
            await recordPaymentFailure({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: metadata.order_id,
              razorpay_payment_id: metadata.payment_id,
            });
          }
          setFormError(
            description
              ? `Payment failed: ${description}. It is recorded in My Orders; your cart has not been cleared.`
              : "Payment failed. It is recorded in My Orders; your cart has not been cleared.",
          );
        } catch (error) {
          setFormError(
            error.response?.data?.message ||
              "Payment failed, but its status could not be confirmed. Your cart has not been cleared.",
          );
        }
      });

      paymentObject.open();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start checkout. Your cart has not been cleared.",
      );
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Checkout</h1>

        {cartLoading && <p role="status" className="text-slate-300">Loading your cart...</p>}
        {!cartLoading && cartError && (
          <section role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6">
            <p className="font-semibold">Unable to load your cart.</p>
            <p className="mt-2 text-slate-300">{cartError}</p>
            <Link to="/cart" className="mt-4 inline-block text-indigo-300 hover:text-indigo-200">
              Return to Cart
            </Link>
          </section>
        )}

        {!cartLoading && !cartError && cartItems.length === 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h2 className="text-xl font-semibold">Your cart is empty</h2>
            <Link to="/products" className="mt-4 inline-block text-indigo-300 hover:text-indigo-200">
              Browse Products
            </Link>
          </section>
        )}

        {!cartLoading && !cartError && cartItems.length > 0 && (
          <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-7">
              <h2 className="text-xl font-semibold">Shipping Details</h2>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.name} className={field.name === "addressLine1" ? "sm:col-span-2" : ""}>
                    <label htmlFor={field.name} className="mb-2 block text-sm font-medium text-slate-300">
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={address[field.name]}
                      onChange={handleChange}
                      autoComplete={field.autoComplete}
                      inputMode={field.inputMode}
                      aria-invalid={Boolean(errors[field.name])}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 aria-[invalid=true]:border-rose-400"
                    />
                    {errors[field.name] && (
                      <p id={`${field.name}-error`} className="mt-1 text-sm text-rose-300">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <ul className="mt-5 space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <li key={product._id} className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-300">{product.name} × {quantity}</span>
                    <span className="whitespace-nowrap text-white">
                      ₹{(product.price * quantity).toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex justify-between border-t border-white/10 pt-4 font-semibold">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>
              <div className="mt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {formError && (
                <p role="alert" className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
              >
                {placingOrder ? "Preparing secure payment..." : "Place Order"}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                Secure Razorpay Test Mode checkout
              </p>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

export default Checkout;
