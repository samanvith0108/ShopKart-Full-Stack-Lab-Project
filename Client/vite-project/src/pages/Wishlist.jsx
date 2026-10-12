import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/wishlist";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [removingId, setRemovingId] = useState("");
  const [removeError, setRemoveError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const fetchWishlist = async () => {
      try {
        const response = await getWishlist(controller.signal);
        if (!controller.signal.aborted) {
          setWishlist(response.data.wishlist);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Unable to load your wishlist.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchWishlist();
    return () => controller.abort();
  }, [retry]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    setRemoveError("");
    try {
      await removeFromWishlist(productId);
      setWishlist((current) => current.filter((product) => product._id !== productId));
    } catch {
      setRemoveError("Unable to remove this product. Please try again.");
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">Saved for later</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">My Wishlist</h1>
          {!loading && !error && wishlist.length > 0 && (
            <p className="mt-2 text-slate-400">
              {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
            </p>
          )}
        </div>

        {loading && <p role="status" className="text-slate-300">Loading your wishlist...</p>}

        {!loading && error && (
          <section className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-6" role="alert">
            <p className="text-lg font-semibold">Something went wrong.</p>
            <p className="mt-2 text-slate-300">We couldn't load your wishlist.</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setRetry((value) => value + 1);
              }}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500"
            >
              Try Again
            </button>
          </section>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <p aria-hidden="true" className="text-5xl">♡</p>
            <h2 className="mt-5 text-2xl font-semibold">Your wishlist is empty ❤️</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Start saving products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
            >
              Browse Products
            </Link>
          </section>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <>
            {removeError && <p role="alert" className="mb-5 text-rose-300">{removeError}</p>}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                  removing={removingId === product._id}
                  disabled={Boolean(removingId)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
