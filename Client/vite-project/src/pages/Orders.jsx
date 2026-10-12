import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrders } from "../services/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadOrders = async () => {
      try {
        const response = await getOrders(controller.signal);
        if (!controller.signal.aborted) {
          setOrders(response.data.orders);
          setError("");
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load your orders. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadOrders();
    return () => controller.abort();
  }, [retry]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-8 text-3xl font-bold sm:text-4xl">My Orders</h1>
        {loading && <p role="status" className="text-slate-300">Loading your orders...</p>}
        {!loading && error && (
          <section role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6">
            <p className="text-slate-200">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRetry((value) => value + 1);
              }}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500"
            >
              Try Again
            </button>
          </section>
        )}
        {!loading && !error && orders.length === 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h2 className="text-xl font-semibold">You have not placed any orders yet.</h2>
            <Link to="/products" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500">
              Start Shopping
            </Link>
          </section>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order._id} className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">Order #{order._id}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : order.paymentStatus === "FAILED"
                            ? "bg-rose-400/10 text-rose-300"
                            : "bg-amber-400/10 text-amber-200"
                      }`}
                    >
                      {order.paymentStatus === "PAID"
                        ? order.status
                        : order.paymentStatus === "FAILED"
                          ? "Payment Failed"
                          : "Payment Pending"}
                    </span>
                </div>
                <ul className="mt-5 space-y-2 text-sm text-slate-300">
                  {order.items.map((item, index) => (
                    <li key={`${item.product}-${index}`} className="flex justify-between gap-4">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <p className="font-semibold">
                    Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                  <Link to={`/orders/${order._id}`} className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
