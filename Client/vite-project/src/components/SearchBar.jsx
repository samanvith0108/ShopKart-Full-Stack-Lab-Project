const categories = ["All", "Electronics", "Fashion", "Books", "Home", "Fitness"];

function SearchBar({ search, category, onSearchChange, onCategoryChange }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row">
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
      />

      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        aria-label="Filter by category"
        className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item === "All" ? "All Categories" : item}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;
