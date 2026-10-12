import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/orders";

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadOrder = async () => {
      try {
        const response = await getOrderById(id, controller.signal);
        if (!controller.signal.aborted) {
          setOrder(response.data.order);
          setError("");
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || "Unable to load this order.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadOrder();
    return () => controller.abort();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-10">
        {loading && <p role="status" className="text-slate-300">Loading order...</p>}
        {!loading && error && <p role="alert" className="text-rose-300">{error}</p>}
        {!loading && order && (
          <section className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
              {order.paymentStatus === "PAID" ? "Payment complete" : order.paymentStatus}
            </p>
            <h1 className="mt-2 text-3xl font-bold">Order Details</h1>
            <p className="mt-2 break-all text-sm text-slate-400">Order #{order._id}</p>
            <p className="mt-1 text-sm text-slate-400">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>

            <h2 className="mt-8 text-lg font-semibold">Items</h2>
            <ul className="mt-4 space-y-4">
              {order.items.map((item, index) => (
                <li key={`${item.product}-${index}`} className="flex justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 p-5">
              <h2 className="font-semibold">Shipping Address</h2>
              <p className="mt-3 text-slate-300">{order.shippingAddress.fullName}</p>
              <p className="text-slate-300">{order.shippingAddress.phone}</p>
              <p className="mt-2 text-slate-400">{order.shippingAddress.addressLine1}</p>
              <p className="text-slate-400">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
            </div>

            <Link to="/orders" className="mt-7 inline-flex text-indigo-300 hover:text-indigo-200">
              Back to My Orders
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

export default OrderDetails;
