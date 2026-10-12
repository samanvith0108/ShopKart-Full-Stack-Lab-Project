import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/orders";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadOrder = async () => {
      try {
        const response = await getOrderById(id, controller.signal);
        if (!controller.signal.aborted) setOrder(response.data.order);
      } catch {
        if (!controller.signal.aborted) setError("Your order was placed, but we couldn't load its details.");
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
      <main className="mx-auto flex max-w-3xl justify-center px-5 py-14">
        <section className="w-full rounded-3xl border border-white/10 bg-slate-900 p-7 text-center sm:p-10">
          <p aria-hidden="true" className="text-5xl">✅</p>
          <h1 className="mt-5 text-3xl font-bold">Order Placed Successfully</h1>
          {loading && <p role="status" className="mt-5 text-slate-300">Loading order details...</p>}
          {!loading && error && <p role="alert" className="mt-5 text-amber-200">{error}</p>}
          {!loading && order && (
            <>
              <p className="mt-5 text-slate-300">Order ID: <span className="break-all">{order._id}</span></p>
              <p className="mt-3 text-2xl font-semibold">₹{order.totalAmount.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm font-medium text-emerald-300">Status: {order.status}</p>
              <p className="mt-4 text-slate-400">Your order has been saved successfully.</p>
            </>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/orders" className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500">
              View My Orders
            </Link>
            <Link to="/products" className="rounded-xl border border-white/10 px-5 py-3 font-semibold hover:bg-white/5">
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OrderSuccess;
