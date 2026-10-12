import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-indigo-300">ShopKart</p>
        <h1 className="text-5xl font-bold mt-4">Welcome to the catalog</h1>
        <p className="text-slate-300 mt-4">Browse products, search by name, and filter by category.</p>

        <Link
          to="/products"
          className="inline-block mt-8 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold"
        >
          View Products
        </Link>
      </div>
    </div>
  );
}

export default Home;
