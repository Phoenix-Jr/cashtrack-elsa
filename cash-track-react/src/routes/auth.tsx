import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const LoginPage = lazy(() => import("@/pages/auth/login/index"));
const ForgotPassword = lazy(
  () => import("@/pages/auth/forgot-password/index")
);

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" >
        <Route index element={<LoginPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  );
};

export default AuthRoutes;

