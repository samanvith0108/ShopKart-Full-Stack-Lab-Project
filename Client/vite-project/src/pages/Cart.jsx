import { useState } from "react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";
import { useCart } from "../context/useCart";

function Cart() {
  const {
    cartItems,
    cartLoading,
    cartError,
    cartCount,
    subtotal,
    refreshCart,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const [retrying, setRetrying] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  const handleRetry = async () => {
    setRetrying(true);
    await refreshCart();
    setRetrying(false);
  };

  const handleQuantityChange = async (productId, quantity) => {
    setBusyId(productId);
    setActionError("");
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      setActionError(error.response?.data?.message || "Unable to update quantity. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setActionError("");
    try {
      await removeFromCart(productId);
    } catch (error) {
      setActionError(error.response?.data?.message || "Unable to remove product. Please try again.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="mb-8 text-3xl font-bold sm:text-4xl">My Cart</h1>

        {cartLoading && (
          <p role="status" className="text-slate-300">Loading your cart...</p>
        )}

        {!cartLoading && cartError && (
          <section role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6">
            <h2 className="text-lg font-semibold">Unable to load your cart.</h2>
            <p className="mt-2 text-slate-300">{cartError}</p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500 disabled:opacity-60"
            >
              {retrying ? "Trying again..." : "Try Again"}
            </button>
          </section>
        )}

        {!cartLoading && !cartError && cartItems.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <p aria-hidden="true" className="text-5xl">🛒</p>
            <h2 className="mt-5 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
            >
              Browse Products
            </Link>
          </section>
        )}

        {!cartLoading && !cartError && cartItems.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section aria-label="Cart items" className="space-y-4">
              {actionError && <p role="alert" className="text-rose-300">{actionError}</p>}
              {cartItems.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  busy={busyId === item.product._id}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </section>

            <aside className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="mt-5 flex justify-between text-slate-300">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-white/10 pt-4 text-lg font-semibold">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold hover:bg-indigo-500"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
