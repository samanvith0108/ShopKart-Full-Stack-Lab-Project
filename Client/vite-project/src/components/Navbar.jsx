import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { axiosInstance } from "../axiosCalls/axios";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm transition ${
    isActive ? "bg-indigo-500/15 text-indigo-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCart } = useCart();
  const { markUnauthenticated } = useAuth();
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setError("");
    setLoggingOut(true);
    try {
      await axiosInstance.post("/customers/logout");
      markUnauthenticated();
      clearCart();
      navigate("/login");
    } catch {
      setError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="border-b border-white/10 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link to="/home" className="text-xl font-bold tracking-tight text-white">
          Shop<span className="text-indigo-400">Kart</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1">
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          <NavLink to="/wishlist" className={linkClass}>Wishlist</NavLink>
          <NavLink to="/cart" className={linkClass}>Cart ({cartCount})</NavLink>
          <NavLink to="/orders" className={linkClass}>My Orders</NavLink>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </nav>
      </div>
      {error && (
        <p role="alert" className="mx-auto max-w-6xl px-5 pb-3 text-sm text-rose-300">
          {error}
        </p>
      )}
    </header>
  );
}

export default Navbar;
