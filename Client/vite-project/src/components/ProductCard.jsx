import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/wishlist";
import { useCart } from "../context/useCart";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const handleAddToWishlist = async () => {
    if (saving || added) return;

    setSaving(true);
    setError("");
    try {
      await addToWishlist(product._id);
      setAdded(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message === "Product already in wishlist"
          ? "This product is already in your wishlist."
          : "Unable to save product. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (addingToCart || product.stock < 1) return;

    setAddingToCart(true);
    setCartError("");
    setCartMessage("");
    try {
      await addToCart(product._id);
      setCartMessage("Added to cart.");
    } catch (requestError) {
      setCartError(requestError.response?.data?.message || "Unable to add product to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg">
      <img
        src={product.image}
        alt={product.name}
        className="h-52 w-full object-cover"
      />

      <div className="min-w-0 p-4">
        <div className="mb-2 flex min-w-0 flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 break-words text-lg font-semibold">{product.name}</h2>
          <span className="text-sm text-indigo-300">{product.category}</span>
        </div>

        <p className="text-xl font-bold text-white">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p className={`mt-2 text-sm ${product.stock > 0 ? "text-slate-400" : "text-rose-300"}`}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
        {cartError && <p role="alert" className="mt-3 text-sm text-rose-300">{cartError}</p>}
        {cartMessage && <p role="status" className="mt-3 text-sm text-emerald-300">{cartMessage}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex min-h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-xl bg-indigo-600 px-2 py-2 text-center text-sm font-medium hover:bg-indigo-500"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock < 1}
            className="flex min-h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-xl border border-indigo-400/40 px-2 py-2 text-center text-sm font-medium text-indigo-200 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addingToCart ? "Adding..." : product.stock < 1 ? "Out of Stock" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={saving || added}
            className="col-span-2 flex min-h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-xl border border-white/10 px-2 py-2 text-center text-sm font-medium text-slate-100 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "⏳ Saving..." : added ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
