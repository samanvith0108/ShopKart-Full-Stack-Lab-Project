import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { getProducts } from "../services/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getProducts({ search, category }, controller.signal);
        setProducts(response.data.products);
      } catch {
        if (!controller.signal.aborted) {
          setError("Something went wrong while loading products.");
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => controller.abort();
  }, [search, category]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Products</h1>

        <SearchBar
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        {loading && <p role="status" className="text-slate-300">Loading products...</p>}

        {!loading && error && <p role="alert" className="text-red-400">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-slate-300">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
