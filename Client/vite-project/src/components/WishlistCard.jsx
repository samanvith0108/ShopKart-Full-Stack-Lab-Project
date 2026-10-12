import { Link } from "react-router-dom";

function WishlistCard({ product, onRemove, removing, disabled }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg">
      <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">{product.name}</h2>
          <span className="text-sm text-indigo-300">{product.category}</span>
        </div>
        <p className="text-xl font-bold text-white">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p className={`mt-2 text-sm ${product.stock > 0 ? "text-slate-400" : "text-rose-300"}`}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-500"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onRemove(product._id)}
            disabled={disabled}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {removing ? "Removing..." : "Remove from Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default WishlistCard;
