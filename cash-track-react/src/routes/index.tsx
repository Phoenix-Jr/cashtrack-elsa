import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthRoutes from "./auth";
import Loader from "@/components/Loader";
import PublicRoute from "@/components/PublicRoute";
import DashboardLayout from "@/pages/dashboard/layout";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const TransactionsPage = lazy(() => import("@/pages/dashboard/transactions/index"));
const CategoriesPage = lazy(() => import("@/pages/dashboard/categories/index"));
const UsersPage = lazy(() => import("@/pages/dashboard/users/index"));
const AnalyticsPage = lazy(() => import("@/pages/dashboard/analytics/index"));
const SettingsPage = lazy(() => import("@/pages/dashboard/settings/index"));
const HistoryPage = lazy(() => import("@/pages/dashboard/history/index"));

// Configuration des routes protégées
const protectedRoutes = [
  { path: "/dashboard", component: DashboardPage },
  { path: "/dashboard/transactions", component: TransactionsPage },
  { path: "/dashboard/categories", component: CategoriesPage },
  { path: "/dashboard/users", component: UsersPage },
  { path: "/dashboard/analytics", component: AnalyticsPage },
  { path: "/dashboard/history", component: HistoryPage },
  { path: "/dashboard/settings", component: SettingsPage },
];

// Fonction pour créer une route avec Suspense
const createSuspenseRoute = (RouteComponent: React.ComponentType<any>) => (
  <Suspense fallback={<Loader />}>
    <RouteComponent />
  </Suspense>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques (auth) */}
      <Route
        path="auth/*"
        element={
          <PublicRoute>
            <AuthRoutes />
          </PublicRoute>
        }
      />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={createSuspenseRoute(route.component)}
          />
        ))}
        <Route
          path="*"
          element={
            <Suspense fallback={<Loader />}>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <p className="mb-8 text-xl text-gray-600">
                    La page est en cours de création
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block px-6 py-3 text-white bg-primary transition-colors"
                  >
                    Retour au tableau de bord
                  </a>
                </div>
              </div>
            </Suspense>
          }
        />
      </Route>

      {/* Redirection racine vers dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Route 404 */}
      <Route
        path="*"
        element={
          <Suspense fallback={<Loader />}>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <p className="mb-8 text-xl text-gray-600">
                  Page non trouvée
                </p>
                <a
                  href="/dashboard"
                  className="inline-block px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour au tableau de bord
                </a>
              </div>
            </div>
          </Suspense>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

