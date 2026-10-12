import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./cart-context";
import {
  addProductToCart,
  getCart,
  removeProductFromCart,
  updateProductQuantity,
} from "../services/cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  const refreshCart = useCallback(async (signal) => {
    setCartLoading(true);
    setCartError("");

    try {
      const response = await getCart(signal);
      if (!signal?.aborted) {
        setCartItems(response.data.cart);
        setCartError("");
      }
      return true;
    } catch {
      if (!signal?.aborted) {
        setCartItems([]);
        setCartError("Unable to load your cart.");
      }
      return false;
    } finally {
      if (!signal?.aborted) {
        setCartLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadInitialCart = async () => {
      try {
        const response = await getCart(controller.signal);
        if (!controller.signal.aborted) {
          setCartItems(response.data.cart);
          setCartError("");
        }
      } catch {
        if (!controller.signal.aborted) {
          setCartItems([]);
          setCartError("Unable to load your cart.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCartLoading(false);
        }
      }
    };

    loadInitialCart();
    return () => controller.abort();
  }, []);

  const addToCart = useCallback(async (productId) => {
    const response = await addProductToCart(productId);
    setCartItems(response.data.cart);
    setCartError("");
    return response.data.cart;
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const response = await updateProductQuantity(productId, quantity);
    setCartItems(response.data.cart);
    setCartError("");
    return response.data.cart;
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const response = await removeProductFromCart(productId);
    setCartItems(response.data.cart);
    setCartError("");
    return response.data.cart;
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartError("");
    setCartLoading(false);
  }, []);

  const value = useMemo(() => ({
    cartItems,
    cartLoading,
    cartError,
    cartCount: cartItems.reduce((total, item) => total + item.quantity, 0),
    subtotal: cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    ),
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCart,
  }), [
    cartItems,
    cartLoading,
    cartError,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
