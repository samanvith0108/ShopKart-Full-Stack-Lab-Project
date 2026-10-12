import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { axiosInstance } from "../axiosCalls/axios";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

function Login() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { markAuthenticated } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlechange = (e) => {
    setErrorMessage("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await axiosInstance.post("/customers/login", form);
      markAuthenticated();
      await refreshCart();

      navigate("/home");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to log in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Login</h1>

            <p className="text-slate-400 text-sm mt-2">
              Login to your account to continue
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handlechange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-xl
                                bg-white/5
                                border border-white/10
                                text-white
                                placeholder:text-slate-500
                                outline-none
                                transition-all duration-200
                                focus:border-indigo-500
                                focus:ring-4 focus:ring-indigo-500/10
                                hover:border-white/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handlechange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3.5 rounded-xl
                                bg-white/5
                                border border-white/10
                                text-white
                                placeholder:text-slate-500
                                outline-none
                                transition-all duration-200
                                focus:border-indigo-500
                                focus:ring-4 focus:ring-indigo-500/10
                                hover:border-white/20"
              />
            </div>

            {/* Login Button */}
            {errorMessage && (
              <p role="alert" className="text-sm text-rose-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 rounded-xl
                            bg-gradient-to-r from-indigo-500 to-purple-600
                            text-white font-semibold
                            shadow-lg shadow-indigo-500/20
                            transition-all duration-200
                            hover:from-indigo-400 hover:to-purple-500
                            hover:shadow-indigo-500/40
                            hover:-translate-y-0.5
                            active:translate-y-0"
            >
              {isSubmitting ? "Logging In..." : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-7">
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                SignUp
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Secure login • Your information is protected
        </p>
      </div>
    </div>
  );
}

export default Login;
