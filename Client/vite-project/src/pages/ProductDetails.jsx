import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../services/products';
import { useCart } from '../context/useCart';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartError, setCartError] = useState('');

  const handleAddToCart = async () => {
    if (addingToCart || !product || product.stock < 1) return;

    setAddingToCart(true);
    setCartMessage('');
    setCartError('');
    try {
      await addToCart(product._id);
      setCartMessage('Added to cart.');
    } catch (requestError) {
      setCartError(requestError.response?.data?.message || 'Unable to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getProductById(id, controller.signal);
        setProduct(response.data.product);
      } catch {
        if (!controller.signal.aborted) {
          setError('Something went wrong while loading the product.');
          setProduct(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  if (loading) return <main role="status" className="min-h-screen bg-slate-950 p-6 text-white">Loading product...</main>;
  if (error) return <main role="alert" className="min-h-screen bg-slate-950 p-6 text-white">{error}</main>;
  if (!product) return <main className="min-h-screen bg-slate-950 p-6 text-white">No products found.</main>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl p-6">
        <Link to="/products" className="mb-6 inline-block text-indigo-300">← Back to Products</Link>

        <div className="grid grid-cols-1 gap-8 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
          <img src={product.image} alt={product.name} className="h-[320px] w-full rounded-2xl object-cover md:h-[420px]" />

          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">{product.category}</p>
            <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>
            <p className="mt-5 text-3xl font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="mt-5 text-slate-300">{product.description}</p>

            <p className="mt-6 text-slate-200">
              {product.stock > 0 ? `Stock: ${product.stock} units available` : 'Out of stock'}
            </p>
            {cartError && <p role="alert" className="mt-4 text-rose-300">{cartError}</p>}
            {cartMessage && <p role="status" className="mt-4 text-emerald-300">{cartMessage}</p>}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;
