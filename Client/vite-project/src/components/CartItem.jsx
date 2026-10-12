import { Link } from "react-router-dom";

function CartItem({ item, busy, onQuantityChange, onRemove }) {
  const { product, quantity } = item;

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-slate-900 p-4 sm:flex-row sm:items-center">
      <img
        src={product.image}
        alt={product.name}
        className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-32"
      />

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${product._id}`}
          className="text-lg font-semibold text-white hover:text-indigo-300"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-indigo-300">{product.category}</p>
        <p className="mt-2 font-semibold text-white">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p className={`mt-1 text-sm ${product.stock > 0 ? "text-slate-400" : "text-rose-300"}`}>
          {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 px-2 py-1">
          <button
            type="button"
            aria-label={quantity === 1 ? `Remove ${product.name} from cart` : `Decrease ${product.name} quantity`}
            disabled={busy}
            onClick={() => {
              if (quantity === 1) {
                onRemove(product._id);
                return;
              }
              onQuantityChange(product._id, quantity - 1);
            }}
            className="h-9 w-9 rounded-lg text-lg hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span aria-live="polite" className="min-w-6 text-center">{quantity}</span>
          <button
            type="button"
            aria-label={`Increase ${product.name} quantity`}
            disabled={busy || quantity >= product.stock}
            onClick={() => onQuantityChange(product._id, quantity + 1)}
            className="h-9 w-9 rounded-lg text-lg hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>

        <div className="min-w-24 text-right">
          <p className="font-semibold text-white">
            ₹{(product.price * quantity).toLocaleString("en-IN")}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(product._id)}
            className="mt-2 text-sm text-rose-300 hover:text-rose-200 disabled:opacity-50"
          >
            {busy ? "Updating..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default CartItem;
