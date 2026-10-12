import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
  const { status, retryAuthCheck } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main role="status" className="min-h-screen bg-slate-950 p-6 text-white">
        Checking your session...
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <p role="alert">Unable to verify your session. Check your connection and try again.</p>
        <button
          type="button"
          onClick={retryAuthCheck}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 font-semibold hover:bg-indigo-500"
        >
          Try Again
        </button>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
